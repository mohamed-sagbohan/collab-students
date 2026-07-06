-- ============================================================
-- Migration 028 — Suppression pour soi au-delà de 2 minutes
-- Exécutez dans Supabase > SQL Editor (après la migration 027)
--
-- Nouveau modèle de suppression (aligné sur la fenêtre d'édition) :
--  - dans les 2 minutes suivant l'envoi : suppression POUR TOUT LE
--    MONDE (DELETE réel, comme avant) ;
--  - au-delà : le message n'est masqué QUE pour celui qui supprime
--    (table chat_message_hides), l'autre participant le voit
--    toujours ; les fichiers audio/image ne sont PAS supprimés ;
--  - l'admin garde la suppression réelle sans limite (modération).
--
-- La décision est prise CÔTÉ SERVEUR par le RPC delete_chat_message
-- (pas d'horloge client) qui renvoie 'deleted' ou 'hidden' ; la
-- policy DELETE directe est resserrée à la fenêtre de 2 minutes.
-- Lecture : chat_message_hides est embarquée dans le SELECT des
-- messages (RLS : chacun ne voit que SES masquages) et le front
-- filtre ; pas de realtime nécessaire (l'autre côté n'est pas
-- concerné, et le RLS l'empêcherait de toute façon de recevoir
-- l'événement).
-- ============================================================

-- ── 1. Table des masquages « supprimé pour moi » ─────────────

CREATE TABLE IF NOT EXISTS public.chat_message_hides (
  message_id uuid REFERENCES public.chat_messages(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

ALTER TABLE public.chat_message_hides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chacun voit ses masquages" ON public.chat_message_hides;

CREATE POLICY "Chacun voit ses masquages"
  ON public.chat_message_hides FOR SELECT
  USING (user_id = auth.uid());

-- Pas de policy INSERT/DELETE : le masquage passe UNIQUEMENT par le
-- RPC delete_chat_message (security definer).

-- ── 2. Policy DELETE resserrée : 2 minutes, ou admin ─────────

DROP POLICY IF EXISTS "Chacun supprime son message, admin tout"          ON public.chat_messages;
DROP POLICY IF EXISTS "Suppression pour tous : 2 minutes, admin sans limite" ON public.chat_messages;

CREATE POLICY "Suppression pour tous : 2 minutes, admin sans limite"
  ON public.chat_messages FOR DELETE
  USING (
    (sender_id = auth.uid() AND created_at > now() - interval '2 minutes')
    OR public.get_my_role() = 'admin'
  );

-- ── 3. RPC : supprime (fenêtre 2 min / admin) ou masque ──────

CREATE OR REPLACE FUNCTION public.delete_chat_message(p_message_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_id  uuid;
  v_created_at timestamptz;
BEGIN
  SELECT sender_id, created_at INTO v_sender_id, v_created_at
  FROM public.chat_messages
  WHERE id = p_message_id;

  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'Message introuvable';
  END IF;

  -- Admin : suppression réelle sans limite (modération).
  IF public.get_my_role() = 'admin' THEN
    DELETE FROM public.chat_messages WHERE id = p_message_id;
    RETURN 'deleted';
  END IF;

  IF v_sender_id <> auth.uid() THEN
    RAISE EXCEPTION 'Vous ne pouvez supprimer que vos propres messages';
  END IF;

  -- Dans la fenêtre de 2 minutes : suppression pour tout le monde.
  IF v_created_at > now() - interval '2 minutes' THEN
    DELETE FROM public.chat_messages WHERE id = p_message_id;
    RETURN 'deleted';
  END IF;

  -- Au-delà : masqué uniquement pour l'appelant.
  INSERT INTO public.chat_message_hides (message_id, user_id)
  VALUES (p_message_id, auth.uid())
  ON CONFLICT DO NOTHING;
  RETURN 'hidden';
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_chat_message(uuid) TO authenticated;

-- ── 4. get_staff_conversations : l'aperçu ignore mes masquages ──

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
                   'created_at', m.created_at,
                   'audio_path', m.audio_path,
                   'image_path', m.image_path
                 )
          FROM public.chat_messages m
          WHERE m.conversation_id = c.id
            AND NOT EXISTS (
              SELECT 1 FROM public.chat_message_hides h
              WHERE h.message_id = m.id AND h.user_id = auth.uid()
            )
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
  RAISE NOTICE '✅ Migration 028 terminée : suppression pour tous limitée à 2 minutes, « supprimé pour moi » au-delà (chat_message_hides, RPC delete_chat_message).';
END $$;
