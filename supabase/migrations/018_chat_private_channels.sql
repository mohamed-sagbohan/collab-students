-- ============================================================
-- Migration 018 — Canaux realtime privés pour le chat
-- Exécutez dans Supabase > SQL Editor (après la migration 017)
--
-- Durcissement : les topics Broadcast/Presence du chat passent en
-- canaux privés (option private: true côté client). L'autorisation
-- est gouvernée par des policies RLS sur realtime.messages :
--  - chat-conv-<uuid> : réservé à l'apprenante propriétaire de la
--    conversation et au staff (plus d'écoute du « X écrit… » en
--    devinant l'UUID) ;
--  - chat-presence    : réservé aux utilisateurs authentifiés
--    (les visiteurs anonymes ne voient plus qui est en ligne).
-- Les messages eux-mêmes passaient déjà par postgres_changes,
-- protégé par la RLS de chat_messages (migration 017).
--
-- ⚠️ À appliquer AVANT de déployer le front qui active private: true,
-- sinon les canaux du chat ne pourront plus se connecter.
-- ============================================================

-- ── 1. Lecture : rejoindre un canal et recevoir broadcast/presence ──

DROP POLICY IF EXISTS "Chat : lecture des canaux prives" ON realtime.messages;

CREATE POLICY "Chat : lecture des canaux prives"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (
    realtime.messages.extension IN ('broadcast', 'presence')
    AND (
      realtime.topic() = 'chat-presence'
      OR (
        realtime.topic() LIKE 'chat-conv-%'
        AND EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id::text = replace(realtime.topic(), 'chat-conv-', '')
            AND (c.student_id = (SELECT auth.uid()) OR public.get_my_role() IN ('formateur', 'admin'))
        )
      )
    )
  );

-- ── 2. Écriture : émettre un broadcast (typing) / se signaler présent ──

DROP POLICY IF EXISTS "Chat : ecriture sur les canaux prives" ON realtime.messages;

CREATE POLICY "Chat : ecriture sur les canaux prives"
  ON realtime.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    realtime.messages.extension IN ('broadcast', 'presence')
    AND (
      realtime.topic() = 'chat-presence'
      OR (
        realtime.topic() LIKE 'chat-conv-%'
        AND EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id::text = replace(realtime.topic(), 'chat-conv-', '')
            AND (c.student_id = (SELECT auth.uid()) OR public.get_my_role() IN ('formateur', 'admin'))
        )
      )
    )
  );

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 018 terminée : canaux realtime du chat privés (policies sur realtime.messages).';
END $$;
