-- ============================================================
-- Migration 031 — Présence en temps réel sur le suivi en direct
-- Exécutez dans Supabase > SQL Editor (après la migration 030)
--
-- Publie user_presence sur le flux realtime : le moniteur du staff
-- reçoit chaque heartbeat (arrivée) et chaque antidatage (départ,
-- envoyé par le front à la fermeture de l'onglet) et met à jour
-- « Apprenants en ligne » instantanément, sans attendre le poll.
-- La RLS reste appliquée aux événements : seul le staff les reçoit
-- (policy « Staff lit la presence », migration 030).
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_presence'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
  END IF;
END $$;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 031 terminée : user_presence publiée sur le flux realtime.';
END $$;
