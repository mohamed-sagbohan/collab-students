-- ============================================================
-- Migration 017 — Chat de support apprenant ↔ formateurs/admins
-- Exécutez dans Supabase > SQL Editor (après la migration 016)
--
-- Modèle : une conversation de support UNIQUE par apprenante
-- (student_id unique), mutualisée côté staff : tout formateur ou
-- admin voit et peut répondre à toutes les conversations.
-- Historique immuable (pas d'UPDATE, DELETE réservé à l'admin).
-- Non-lus calculés via un curseur par utilisateur (chat_reads).
-- ============================================================

-- ── 1. Conversations ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  last_message_at timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversations_last_message_idx
  ON public.conversations(last_message_at DESC NULLS LAST);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Apprenante voit sa conversation, staff voit tout" ON public.conversations;

CREATE POLICY "Apprenante voit sa conversation, staff voit tout"
  ON public.conversations FOR SELECT
  USING (auth.uid() = student_id OR public.get_my_role() IN ('formateur', 'admin'));

-- Pas de policy INSERT/UPDATE/DELETE : la création passe par le RPC
-- get_or_create_my_conversation() (security definer) et
-- last_message_at est mis à jour par trigger.

-- ── 2. Messages ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body            text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  lesson_id       uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_conv_created_idx
  ON public.chat_messages(conversation_id, created_at DESC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Messages visibles par la proprietaire ou le staff" ON public.chat_messages;
DROP POLICY IF EXISTS "Envoi dans sa conversation ou par le staff"        ON public.chat_messages;
DROP POLICY IF EXISTS "Admin peut supprimer un message"                   ON public.chat_messages;

CREATE POLICY "Messages visibles par la proprietaire ou le staff"
  ON public.chat_messages FOR SELECT
  USING (
    public.get_my_role() IN ('formateur', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = chat_messages.conversation_id
        AND c.student_id = auth.uid()
    )
  );

CREATE POLICY "Envoi dans sa conversation ou par le staff"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      public.get_my_role() IN ('formateur', 'admin')
      OR EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = chat_messages.conversation_id
          AND c.student_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admin peut supprimer un message"
  ON public.chat_messages FOR DELETE
  USING (public.get_my_role() = 'admin');

-- Pas de policy UPDATE : l'historique des messages est immuable.

-- ── 3. Curseurs de lecture (non-lus) ─────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_reads (
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_read_at    timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.chat_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chacun voit son curseur de lecture"     ON public.chat_reads;
DROP POLICY IF EXISTS "Chacun cree son curseur de lecture"     ON public.chat_reads;
DROP POLICY IF EXISTS "Chacun met a jour son curseur de lecture" ON public.chat_reads;

CREATE POLICY "Chacun voit son curseur de lecture"
  ON public.chat_reads FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Chacun cree son curseur de lecture"
  ON public.chat_reads FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Chacun met a jour son curseur de lecture"
  ON public.chat_reads FOR UPDATE USING (auth.uid() = user_id);

-- ── 4. RPC : obtenir/créer sa conversation (apprenante) ──────

CREATE OR REPLACE FUNCTION public.get_or_create_my_conversation()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF public.get_my_role() <> 'apprenante' THEN
    RAISE EXCEPTION 'Réservé aux apprenantes';
  END IF;

  -- ON CONFLICT DO UPDATE (no-op) pour que RETURNING renvoie aussi
  -- la ligne existante (DO NOTHING ne renvoie rien).
  INSERT INTO public.conversations (student_id)
  VALUES (auth.uid())
  ON CONFLICT (student_id) DO UPDATE SET student_id = EXCLUDED.student_id
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_my_conversation() TO authenticated;

-- ── 5. RPC : liste des conversations pour le staff ───────────
-- Une seule requête pour la liste (nom, dernier message, non-lus
-- calculés pour l'appelant) : évite un N+1 côté client.
-- Les conversations sans aucun message sont masquées.

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

-- ── 6. Trigger : nouveau message → last_message_at + notification ──

CREATE OR REPLACE FUNCTION public.trigger_chat_message_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_student_id  uuid;
  v_sender_name text;
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
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

DROP TRIGGER IF EXISTS on_chat_message_notify ON public.chat_messages;
CREATE TRIGGER on_chat_message_notify
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.trigger_chat_message_notification();

-- ── 7. Realtime ──────────────────────────────────────────────

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  RAISE NOTICE 'conversations ajoutee a supabase_realtime';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'conversations deja dans supabase_realtime';
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  RAISE NOTICE 'chat_messages ajoutee a supabase_realtime';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'chat_messages deja dans supabase_realtime';
END $$;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 017 terminée : chat de support (conversations, messages, non-lus, RPC, notifications, realtime).';
END $$;
