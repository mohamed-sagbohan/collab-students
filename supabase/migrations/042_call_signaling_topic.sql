-- ============================================================
-- Migration 042 — Topic privé dédié à la signalisation d'appel
-- Exécutez dans Supabase > SQL Editor (après la migration 041)
--
-- Contexte : supabase-js 2.110 ne permet plus qu'UN canal par topic
-- côté client. La signalisation WebRTC (SDP offer/answer, candidats
-- ICE, raccroché) partageait le topic `chat-conv-<uuid>` avec le fil
-- de discussion : le second composant à monter le topic récupérait le
-- canal déjà souscrit du premier et crashait l'application
-- (« cannot add postgres_changes callbacks … after subscribe() »).
-- La signalisation déménage sur son propre topic `call-sig-<uuid>`
-- (même uuid de conversation), qu'il faut autoriser dans les policies
-- des canaux privés (mêmes règles d'accès que le chat : l'apprenante
-- propriétaire de la conversation + tout le staff).
--
-- ⚠️ À appliquer AVANT de déployer le front correspondant, sinon les
-- appels audio/vidéo ne peuvent plus établir la connexion (le join du
-- canal privé call-sig-<uuid> serait refusé).
-- ============================================================

-- ── 1. Lecture : rejoindre un canal et recevoir les broadcasts ──

DROP POLICY IF EXISTS "Chat : lecture des canaux prives" ON realtime.messages;

CREATE POLICY "Chat : lecture des canaux prives"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (
    realtime.messages.extension IN ('broadcast', 'presence')
    AND (
      realtime.topic() = 'chat-presence'
      OR (
        (realtime.topic() LIKE 'chat-conv-%' OR realtime.topic() LIKE 'call-sig-%')
        AND EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id::text = replace(replace(realtime.topic(), 'chat-conv-', ''), 'call-sig-', '')
            AND (c.student_id = (SELECT auth.uid()) OR public.get_my_role() IN ('formateur', 'admin'))
        )
      )
    )
  );

-- ── 2. Écriture : émettre un broadcast (typing, SDP, ICE, hangup) ──

DROP POLICY IF EXISTS "Chat : ecriture sur les canaux prives" ON realtime.messages;

CREATE POLICY "Chat : ecriture sur les canaux prives"
  ON realtime.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    realtime.messages.extension IN ('broadcast', 'presence')
    AND (
      realtime.topic() = 'chat-presence'
      OR (
        (realtime.topic() LIKE 'chat-conv-%' OR realtime.topic() LIKE 'call-sig-%')
        AND EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id::text = replace(replace(realtime.topic(), 'chat-conv-', ''), 'call-sig-', '')
            AND (c.student_id = (SELECT auth.uid()) OR public.get_my_role() IN ('formateur', 'admin'))
        )
      )
    )
  );

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 042 terminée : topic prive call-sig-<uuid> autorise pour la signalisation d''appel.';
END $$;
