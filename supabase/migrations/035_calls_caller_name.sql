-- ============================================================
-- Migration 035 — Nom de l'appelant porté directement par calls
-- Exécutez dans Supabase > SQL Editor (après la migration 034)
--
-- Le nom affiché sur l'écran d'appel entrant se lisait via une
-- requête profiles séparée après l'INSERT — bloquée par la RLS de
-- profiles (406, l'appelant n'a pas de droit de lecture générique sur
-- les autres profils ; les autres écrans qui affichent un nom
-- « étranger » passent tous par un RPC SECURITY DEFINER). Plus simple
-- et sans nouvelle policy : l'appelant connaît déjà son propre nom et
-- le transmet à la création de la ligne — aucune lecture supplémentaire
-- nécessaire, dans les deux sens (apprenante ↔ staff).
-- ============================================================

ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS caller_name text;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 035 terminée : calls.caller_name ajouté.';
END $$;
