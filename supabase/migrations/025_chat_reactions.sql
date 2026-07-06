-- ============================================================
-- Migration 025 — Réactions emoji sur les messages du chat
-- Exécutez dans Supabase > SQL Editor (après la migration 024)
--
-- Chacun peut réagir aux messages avec un emoji parmi une petite
-- palette (👍 ❤️ 😂 😮 😢 🙏), une fois par emoji et par message.
--  - table chat_reactions : PK (message_id, user_id, emoji) ;
--    conversation_id est DÉNORMALISÉ (rempli par trigger depuis le
--    message, jamais fourni par le client) pour permettre le filtre
--    realtime par conversation sur les canaux privés chat-conv-<id> ;
--  - RLS : lecture par les participants (même périmètre que les
--    messages), chacun n'ajoute/retire que SES réactions ;
--  - realtime : INSERT/DELETE diffusés en direct ; REPLICA IDENTITY
--    FULL pour que les DELETE transportent la ligne complète.
-- ============================================================

-- ── 1. Table ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_reactions (
  message_id      uuid REFERENCES public.chat_messages(id) ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  emoji           text NOT NULL CHECK (emoji IN ('👍', '❤️', '😂', '😮', '😢', '🙏')),
  created_at      timestamptz DEFAULT now(),
  PRIMARY KEY (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS chat_reactions_conv_idx
  ON public.chat_reactions(conversation_id);

-- ── 2. Trigger : conversation_id toujours dérivé du message ──
-- Le client n'envoie que (message_id, user_id, emoji) ; impossible
-- d'étiqueter une réaction sur la mauvaise conversation.

CREATE OR REPLACE FUNCTION public.trigger_chat_reaction_fill()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT m.conversation_id INTO NEW.conversation_id
  FROM public.chat_messages m
  WHERE m.id = NEW.message_id;

  IF NEW.conversation_id IS NULL THEN
    RAISE EXCEPTION 'Message introuvable';
  END IF;

  NEW.created_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_chat_reaction_fill ON public.chat_reactions;
CREATE TRIGGER on_chat_reaction_fill
  BEFORE INSERT ON public.chat_reactions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_chat_reaction_fill();

-- ── 3. RLS ───────────────────────────────────────────────────

ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reactions visibles par les participants" ON public.chat_reactions;
DROP POLICY IF EXISTS "Chacun ajoute sa reaction"               ON public.chat_reactions;
DROP POLICY IF EXISTS "Chacun retire sa reaction"               ON public.chat_reactions;

CREATE POLICY "Reactions visibles par les participants"
  ON public.chat_reactions FOR SELECT
  USING (
    public.get_my_role() IN ('formateur', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = chat_reactions.conversation_id
        AND c.student_id = auth.uid()
    )
  );

-- Le WITH CHECK passe par le message (et non par conversation_id,
-- rempli après coup par le trigger) : on ne réagit qu'aux messages
-- que l'on a le droit de lire.
CREATE POLICY "Chacun ajoute sa reaction"
  ON public.chat_reactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.chat_messages m
      JOIN public.conversations c ON c.id = m.conversation_id
      WHERE m.id = chat_reactions.message_id
        AND (c.student_id = auth.uid() OR public.get_my_role() IN ('formateur', 'admin'))
    )
  );

CREATE POLICY "Chacun retire sa reaction"
  ON public.chat_reactions FOR DELETE
  USING (user_id = auth.uid());

-- ── 4. Realtime ──────────────────────────────────────────────

ALTER TABLE public.chat_reactions REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions;
  RAISE NOTICE 'chat_reactions ajoutee a supabase_realtime';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'chat_reactions deja dans supabase_realtime';
END $$;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 025 terminée : réactions emoji (table, trigger conversation_id, RLS, realtime).';
END $$;
