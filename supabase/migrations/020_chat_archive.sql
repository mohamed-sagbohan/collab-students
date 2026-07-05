-- ============================================================
-- Migration 020 — Archivage des conversations du chat
-- Exécutez dans Supabase > SQL Editor (après la migration 019)
--
-- Le staff peut ranger les conversations terminées :
--  - archived_at sur conversations (NULL = active), état partagé
--    par toute l'équipe (boîte mutualisée) ;
--  - archivage/désarchivage via RPC réservé au staff (pas de
--    policy UPDATE : on ne veut exposer que cette colonne) ;
--  - réactivation AUTOMATIQUE dès qu'un nouveau message arrive
--    (l'apprenante qui réécrit fait remonter le fil en Actives).
-- Côté apprenante, rien ne change : son widget ignore l'archivage.
-- ============================================================

-- ── 1. Colonne archived_at ───────────────────────────────────

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- ── 2. RPC : archiver / désarchiver (staff uniquement) ───────

CREATE OR REPLACE FUNCTION public.set_conversation_archived(p_conversation_id uuid, p_archived boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.get_my_role() NOT IN ('formateur', 'admin') THEN
    RAISE EXCEPTION 'Réservé au staff';
  END IF;

  UPDATE public.conversations
  SET archived_at = CASE WHEN p_archived THEN now() ELSE NULL END
  WHERE id = p_conversation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation introuvable';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_conversation_archived(uuid, boolean) TO authenticated;

-- ── 3. Trigger message : tout nouveau message réactive le fil ──

CREATE OR REPLACE FUNCTION public.trigger_chat_message_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_student_id  uuid;
  v_sender_name text;
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at,
      archived_at     = NULL
  WHERE id = NEW.conversation_id
  RETURNING student_id INTO v_student_id;

  -- Notification uniquement pour l'apprenante quand le staff répond.
  -- Côté staff, le compteur de non-lus suffit (pas de spam de tous
  -- les formateurs à chaque question).
  IF v_student_id IS NULL OR v_student_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  -- Anti-spam : une seule notification chat non lue à la fois
  -- (5 réponses rapides = 1 notification dans la cloche).
  IF EXISTS (
    SELECT 1 FROM public.notifications
    WHERE user_id = v_student_id AND type = 'chat_message' AND read = false
  ) THEN
    RETURN NEW;
  END IF;

  SELECT name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

  INSERT INTO public.notifications(user_id, type, title, body, link)
  VALUES (
    v_student_id,
    'chat_message',
    COALESCE(v_sender_name, 'L''équipe LearnIT') || ' vous a répondu',
    LEFT(NEW.body, 120),
    '/dashboard?chat=ouvert'
  );
  RETURN NEW;
END;
$$;

-- (le trigger on_chat_message_notify existant pointe déjà sur cette fonction)

-- ── 4. get_staff_conversations : expose l'état d'archive ─────

CREATE OR REPLACE FUNCTION public.get_staff_conversations()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF public.get_my_role() NOT IN ('formateur', 'admin') THEN
    RAISE EXCEPTION 'Réservé au staff';
  END IF;

  SELECT COALESCE(jsonb_agg(row_data ORDER BY last_message_at DESC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT
      c.last_message_at,
      jsonb_build_object(
        'id',              c.id,
        'student_id',      c.student_id,
        'student_name',    p.name,
        'last_message_at', c.last_message_at,
        'archived',        (c.archived_at IS NOT NULL),
        'last_message',    (
          SELECT jsonb_build_object(
                   'body',       m.body,
                   'sender_id',  m.sender_id,
                   'created_at', m.created_at
                 )
          FROM public.chat_messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ),
        'unread_count',    (
          SELECT count(*)
          FROM public.chat_messages m
          WHERE m.conversation_id = c.id
            AND m.sender_id <> auth.uid()
            AND m.created_at > COALESCE(r.last_read_at, 'epoch'::timestamptz)
        )
      ) AS row_data
    FROM public.conversations c
    JOIN public.profiles p ON p.id = c.student_id
    LEFT JOIN public.chat_reads r
      ON r.conversation_id = c.id AND r.user_id = auth.uid()
    WHERE c.last_message_at IS NOT NULL
  ) sub;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_staff_conversations() TO authenticated;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 020 terminée : archivage des conversations (colonne, RPC, réactivation automatique).';
END $$;
