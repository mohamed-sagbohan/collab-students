-- ============================================================
-- Migration 021 — Suppression de ses propres messages de chat
-- Exécutez dans Supabase > SQL Editor (après la migration 020)
--
-- Chacun (apprenante comme staff) peut supprimer SES propres
-- messages ; l'admin garde le droit de tout supprimer.
--  - policy DELETE élargie (l'UPDATE reste interdit : un message
--    ne peut pas être modifié, seulement retiré) ;
--  - REPLICA IDENTITY FULL sur chat_messages : les événements
--    realtime DELETE transportent la ligne supprimée complète
--    (conversation_id inclus), nécessaire pour retirer le message
--    des fils ouverts en direct ;
--  - trigger AFTER DELETE : recalcule last_message_at (si le fil
--    n'a plus aucun message, il redisparaît de la liste staff).
-- ============================================================

-- ── 1. Policy DELETE : son propre message, ou admin ──────────

DROP POLICY IF EXISTS "Admin peut supprimer un message"           ON public.chat_messages;
DROP POLICY IF EXISTS "Chacun supprime son message, admin tout"   ON public.chat_messages;

CREATE POLICY "Chacun supprime son message, admin tout"
  ON public.chat_messages FOR DELETE
  USING (sender_id = auth.uid() OR public.get_my_role() = 'admin');

-- ── 2. Realtime : ligne complète dans les événements DELETE ──

ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- ── 3. Trigger : recalcul de last_message_at après suppression ──

CREATE OR REPLACE FUNCTION public.trigger_chat_message_deleted()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = (
    SELECT max(created_at)
    FROM public.chat_messages
    WHERE conversation_id = OLD.conversation_id
  )
  WHERE id = OLD.conversation_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_chat_message_deleted ON public.chat_messages;
CREATE TRIGGER on_chat_message_deleted
  AFTER DELETE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.trigger_chat_message_deleted();

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 021 terminée : suppression de ses propres messages (policy, realtime DELETE, recalcul du fil).';
END $$;
