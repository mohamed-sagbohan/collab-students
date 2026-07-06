-- ============================================================
-- Migration 027 — Répondre à un message (citation)
-- Exécutez dans Supabase > SQL Editor (après la migration 026)
--
-- Chaque message peut citer un message du même fil :
--  - chat_messages.reply_to_id (ON DELETE SET NULL : si l'original
--    est supprimé, la réponse reste avec « message supprimé ») ;
--  - trigger BEFORE INSERT : la cible doit appartenir à la MÊME
--    conversation (pas de citation inter-fils, même pour le staff) ;
--  - trigger d'édition : la citation est figée comme le reste ;
--  - lecture : l'extrait cité arrive par embed PostgREST
--    (reply_to:chat_messages!reply_to_id) — la RLS SELECT existante
--    s'applique aussi à l'embed, rien à ouvrir.
-- ============================================================

-- ── 1. Colonne reply_to_id ───────────────────────────────────

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS chat_messages_reply_to_idx
  ON public.chat_messages(reply_to_id)
  WHERE reply_to_id IS NOT NULL;

-- ── 2. Trigger : la citation reste dans le même fil ──────────

CREATE OR REPLACE FUNCTION public.trigger_chat_reply_same_conversation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.reply_to_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.chat_messages m
    WHERE m.id = NEW.reply_to_id
      AND m.conversation_id = NEW.conversation_id
  ) THEN
    RAISE EXCEPTION 'Citation invalide : le message cité n''appartient pas à ce fil';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_chat_reply_same_conversation ON public.chat_messages;
CREATE TRIGGER on_chat_reply_same_conversation
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.trigger_chat_reply_same_conversation();

-- ── 3. Trigger d'édition : la citation est figée elle aussi ──

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
  NEW.reply_to_id        := OLD.reply_to_id;
  IF NEW.body IS DISTINCT FROM OLD.body THEN
    NEW.edited_at := now();
  ELSE
    NEW.edited_at := OLD.edited_at;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 027 terminée : réponse/citation (reply_to_id, même fil imposé, citation figée).';
END $$;
