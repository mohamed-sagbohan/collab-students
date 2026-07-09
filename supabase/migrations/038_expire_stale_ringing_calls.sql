-- ============================================================
-- Migration 038 — Expiration automatique des appels 'ringing' périmés
-- Exécutez dans Supabase > SQL Editor (après la migration 037)
--
-- Un appel dont l'appelant part avant l'expiration de son minuteur de
-- sonnerie (45s, RING_TIMEOUT_MS côté client) — onglet fermé, réseau
-- coupé — reste 'ringing' en base pour toujours : c'est le CLIENT qui
-- écrit le passage à 'missed' (CallProvider.startCall), et personne
-- n'est là pour le faire. Jusqu'ici traité comme manqué à L'AFFICHAGE
-- seulement (useCalls.isMissedCall) — insuffisant pour get_staff_calls
-- (filtre p_status='missed' sur la colonne littérale) et pour le badge
-- staff, qui ne voyaient donc jamais ces lignes.
--
-- Correction côté serveur : pg_cron corrige la ligne toutes les 2 min
-- (90s de marge sur les 45s du minuteur, cohérent avec STALE_RINGING_MS
-- côté client). L'UPDATE traverse la réplication realtime déjà activée
-- sur `calls` (migration 034) : les clients connectés voient la
-- correction en direct, sans code supplémentaire.
-- ============================================================

-- Si cette ligne échoue par manque de droits : activer l'extension
-- "pg_cron" depuis Database > Extensions dans le dashboard Supabase,
-- puis rejouer cette migration.
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.expire_stale_ringing_calls()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.calls
  SET status = 'missed'
  WHERE status = 'ringing'
    AND started_at < now() - interval '90 seconds';
$$;

-- Idempotent : on désinscrit l'éventuelle exécution précédente avant de
-- reprogrammer (évite les doublons si cette migration est rejouée).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-stale-ringing-calls') THEN
    PERFORM cron.unschedule('expire-stale-ringing-calls');
  END IF;
END $$;

SELECT cron.schedule(
  'expire-stale-ringing-calls',
  '*/2 * * * *',
  $$ SELECT public.expire_stale_ringing_calls(); $$
);

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 038 terminée : appels ringing périmés (>90s) corrigés toutes les 2 min.';
END $$;
