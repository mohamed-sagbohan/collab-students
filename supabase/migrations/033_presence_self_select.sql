-- ============================================================
-- Migration 033 — L'upsert du heartbeat exige la lecture de soi
-- Exécutez dans Supabase > SQL Editor (après la migration 032)
--
-- Cause racine du 403 du heartbeat (diagnostiquée en live) :
-- l'upsert PostgREST (INSERT ... ON CONFLICT DO UPDATE) exige que
-- l'appelant puisse LIRE sa ligne existante via une politique
-- SELECT. La migration 030 réservait la lecture au staff : une
-- apprenante pouvait créer/modifier sa présence mais pas la voir
-- → tout upsert refusé (insertion simple : OK ; upsert : 403).
-- Chacun ne voit que SA ligne ; la lecture globale reste staff.
-- ============================================================

DROP POLICY IF EXISTS "Chacun lit sa presence" ON public.user_presence;

CREATE POLICY "Chacun lit sa presence"
  ON public.user_presence FOR SELECT
  USING (user_id = auth.uid());

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 033 terminée : lecture de sa propre présence autorisée (upsert du heartbeat fonctionnel).';
END $$;
