-- ============================================================
-- Migration 023 — Notes vocales dans le chat
-- Exécutez dans Supabase > SQL Editor (après la migration 022)
--
-- Un message peut désormais être une note vocale :
--  - chat_messages.audio_path (chemin dans le bucket) et
--    audio_duration_sec ; un message = du texte OU de l'audio ;
--  - bucket PRIVÉ chat-audio (5 Mo max, types audio uniquement),
--    fichiers rangés par conversation : chat-audio/<conversation_id>/<uuid>.<ext>
--  - policies sur storage.objects calquées sur la RLS du chat :
--    seuls l'apprenante propriétaire du fil et le staff peuvent
--    lire/déposer ; suppression par l'auteur du fichier ou l'admin ;
--  - une note vocale ne se modifie pas (le trigger d'édition fige
--    l'audio) ; elle se supprime comme un message normal.
--
-- NB : si l'INSERT dans storage.buckets échouait (droits), créez le
-- bucket « chat-audio » (privé) via Dashboard > Storage, puis
-- rejouez cette migration pour poser les policies.
-- ============================================================

-- ── 1. Colonnes audio + contrainte texte OU audio ────────────

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS audio_path text,
  ADD COLUMN IF NOT EXISTS audio_duration_sec integer;

ALTER TABLE public.chat_messages ALTER COLUMN body DROP NOT NULL;

ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_body_check;
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_body_or_audio_check;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_body_or_audio_check CHECK (
  (body IS NULL OR char_length(body) BETWEEN 1 AND 2000)
  AND (body IS NOT NULL OR audio_path IS NOT NULL)
  AND (audio_duration_sec IS NULL OR audio_duration_sec BETWEEN 1 AND 300)
);

-- ── 2. Trigger d'édition : l'audio est figé lui aussi ────────

CREATE OR REPLACE FUNCTION public.trigger_chat_message_edited()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Toutes les colonnes sont figées, sauf body.
  NEW.id                 := OLD.id;
  NEW.conversation_id    := OLD.conversation_id;
  NEW.sender_id          := OLD.sender_id;
  NEW.lesson_id          := OLD.lesson_id;
  NEW.created_at         := OLD.created_at;
  NEW.audio_path         := OLD.audio_path;
  NEW.audio_duration_sec := OLD.audio_duration_sec;
  IF NEW.body IS DISTINCT FROM OLD.body THEN
    NEW.edited_at := now();
  ELSE
    NEW.edited_at := OLD.edited_at;
  END IF;
  RETURN NEW;
END;
$$;

-- ── 3. Notification : aperçu adapté aux notes vocales ────────

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

  IF v_student_id IS NULL OR v_student_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;

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
    COALESCE(LEFT(NEW.body, 120), '🎤 Note vocale'),
    '/dashboard?chat=ouvert'
  );
  RETURN NEW;
END;
$$;

-- ── 4. Bucket privé chat-audio ───────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-audio',
  'chat-audio',
  false,
  5242880, -- 5 Mo
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 5. Policies storage.objects (bucket chat-audio) ──────────
-- Chemin : <conversation_id>/<fichier> — l'accès suit la RLS du chat.

DROP POLICY IF EXISTS "Chat audio : lecture"     ON storage.objects;
DROP POLICY IF EXISTS "Chat audio : envoi"       ON storage.objects;
DROP POLICY IF EXISTS "Chat audio : suppression" ON storage.objects;

CREATE POLICY "Chat audio : lecture"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'chat-audio'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.student_id = (SELECT auth.uid()) OR public.get_my_role() IN ('formateur', 'admin'))
    )
  );

CREATE POLICY "Chat audio : envoi"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-audio'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.student_id = (SELECT auth.uid()) OR public.get_my_role() IN ('formateur', 'admin'))
    )
  );

CREATE POLICY "Chat audio : suppression"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-audio'
    AND (owner_id = (SELECT auth.uid())::text OR public.get_my_role() = 'admin')
  );

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 023 terminée : notes vocales (colonnes, bucket privé chat-audio, policies Storage).';
END $$;
