-- ============================================================
-- Migration 026 — Pièces jointes images dans le chat
-- Exécutez dans Supabase > SQL Editor (après la migration 025)
--
-- Un message peut désormais contenir une photo (capture d'écran
-- d'un exercice, par exemple), avec une légende facultative :
--  - chat_messages.image_path ; un message = texte, audio ou
--    image (le texte peut accompagner l'image en légende) ;
--  - bucket PRIVÉ chat-images (5 Mo max, types image uniquement),
--    fichiers rangés par conversation, policies calquées sur
--    celles de chat-audio (migration 023) ;
--  - trigger d'édition : l'image est figée (seule la légende
--    reste modifiable pendant 2 minutes) ;
--  - notification et aperçu de la liste staff : « 📷 Photo »
--    quand le message n'a pas de texte ; get_staff_conversations
--    expose audio_path/image_path du dernier message pour que
--    l'aperçu affiche « 🎤 Note vocale » / « 📷 Photo ».
--
-- NB : si l'INSERT dans storage.buckets échouait (droits), créez le
-- bucket « chat-images » (privé) via Dashboard > Storage, puis
-- rejouez cette migration pour poser les policies.
-- ============================================================

-- ── 1. Colonne image_path + contrainte de contenu ────────────

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS image_path text;

ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_body_or_audio_check;
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_content_check;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_content_check CHECK (
  (body IS NULL OR char_length(body) BETWEEN 1 AND 2000)
  AND (body IS NOT NULL OR audio_path IS NOT NULL OR image_path IS NOT NULL)
  AND (audio_duration_sec IS NULL OR audio_duration_sec BETWEEN 1 AND 300)
);

-- ── 2. Trigger d'édition : l'image est figée elle aussi ──────

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
  NEW.image_path         := OLD.image_path;
  IF NEW.body IS DISTINCT FROM OLD.body THEN
    NEW.edited_at := now();
  ELSE
    NEW.edited_at := OLD.edited_at;
  END IF;
  RETURN NEW;
END;
$$;

-- ── 3. Notification : aperçu adapté aux photos ───────────────

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
    COALESCE(
      LEFT(NEW.body, 120),
      CASE WHEN NEW.image_path IS NOT NULL THEN '📷 Photo' ELSE '🎤 Note vocale' END
    ),
    '/dashboard?chat=ouvert'
  );
  RETURN NEW;
END;
$$;

-- ── 4. get_staff_conversations : aperçu audio/photo ──────────

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

-- ── 5. Bucket privé chat-images ──────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  false,
  5242880, -- 5 Mo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 6. Policies storage.objects (bucket chat-images) ─────────
-- Chemin : <conversation_id>/<fichier> — l'accès suit la RLS du chat.

DROP POLICY IF EXISTS "Chat images : lecture"     ON storage.objects;
DROP POLICY IF EXISTS "Chat images : envoi"       ON storage.objects;
DROP POLICY IF EXISTS "Chat images : suppression" ON storage.objects;

CREATE POLICY "Chat images : lecture"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.student_id = (SELECT auth.uid()) OR public.get_my_role() IN ('formateur', 'admin'))
    )
  );

CREATE POLICY "Chat images : envoi"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-images'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.student_id = (SELECT auth.uid()) OR public.get_my_role() IN ('formateur', 'admin'))
    )
  );

CREATE POLICY "Chat images : suppression"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND (owner_id = (SELECT auth.uid())::text OR public.get_my_role() = 'admin')
  );

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 026 terminée : pièces jointes images (colonne, bucket privé chat-images, policies Storage, aperçus).';
END $$;
