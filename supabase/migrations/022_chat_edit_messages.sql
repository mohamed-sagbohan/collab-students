-- ============================================================
-- Migration 022 — Modification de son message (fenêtre 2 minutes)
-- Exécutez dans Supabase > SQL Editor (après la migration 021)
--
-- Correction d'une faute de frappe : l'expéditeur peut modifier
-- SON message pendant les 2 minutes qui suivent l'envoi.
--  - la fenêtre est appliquée par la policy RLS (côté serveur,
--    pas seulement par l'interface) ;
--  - un trigger BEFORE UPDATE fige toutes les colonnes sauf body
--    (pas de changement d'expéditeur, de fil, de date...) et
--    horodate la modification (edited_at → mention « modifié ») ;
--  - realtime : chat_messages est déjà dans la publication et en
--    REPLICA IDENTITY FULL (021), les événements UPDATE partent
--    donc tout seuls vers les fils ouverts.
-- ============================================================

-- ── 1. Colonne edited_at ─────────────────────────────────────

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS edited_at timestamptz;

-- ── 2. Policy UPDATE : son message, dans les 2 minutes ───────

DROP POLICY IF EXISTS "Modification de son message pendant 2 minutes" ON public.chat_messages;

CREATE POLICY "Modification de son message pendant 2 minutes"
  ON public.chat_messages FOR UPDATE
  USING (sender_id = auth.uid() AND created_at > now() - interval '2 minutes')
  WITH CHECK (sender_id = auth.uid());

-- ── 3. Trigger : seul le texte change, modification horodatée ──

CREATE OR REPLACE FUNCTION public.trigger_chat_message_edited()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Toutes les colonnes sont figées, sauf body.
  NEW.id              := OLD.id;
  NEW.conversation_id := OLD.conversation_id;
  NEW.sender_id       := OLD.sender_id;
  NEW.lesson_id       := OLD.lesson_id;
  NEW.created_at      := OLD.created_at;
  IF NEW.body IS DISTINCT FROM OLD.body THEN
    NEW.edited_at := now();
  ELSE
    NEW.edited_at := OLD.edited_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_chat_message_edited ON public.chat_messages;
CREATE TRIGGER on_chat_message_edited
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.trigger_chat_message_edited();

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 022 terminée : modification de son message pendant 2 minutes (policy, colonnes figées, edited_at).';
END $$;
