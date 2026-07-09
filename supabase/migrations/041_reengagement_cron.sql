-- ============================================================
-- Migration 041 — Planification quotidienne de la relance email
-- Exécutez dans Supabase > SQL Editor (après la migration 040 ET
-- après avoir déployé la Edge Function reengagement-emails)
--
-- ⚠️ PRÉREQUIS avant d'exécuter cette migration :
-- 1) La fonction reengagement-emails doit être déployée (voir
--    supabase/functions/reengagement-emails), avec ses secrets posés
--    (RESEND_API_KEY, RESEND_FROM_EMAIL, CRON_SECRET, UNSUBSCRIBE_SECRET,
--    APP_URL) via `supabase secrets set`.
-- 2) Créer le secret Vault UNE FOIS, avec la MÊME valeur que CRON_SECRET
--    (à exécuter séparément, PAS committé — c'est un secret) :
--      select vault.create_secret('<même valeur que CRON_SECRET>', 'reengagement_cron_secret');
--
-- Comme la migration 038 (pg_cron, déjà confirmée fonctionnelle sur ce
-- projet), mais cette fois le job appelle une Edge Function externe
-- (pour joindre l'API Resend) via pg_net — jamais exercé ici, à
-- vérifier manuellement avant de faire confiance à la planification
-- automatique (voir la requête de contrôle tout en bas).
-- ============================================================

-- Si cette ligne échoue par manque de droits : activer l'extension
-- "pg_net" depuis Database > Extensions dans le dashboard Supabase,
-- puis rejouer cette migration.
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-reengagement-emails') THEN
    PERFORM cron.unschedule('send-reengagement-emails');
  END IF;
END $$;

-- 9h UTC ≈ 10h/11h heure française (selon heure d'été) — ajuster
-- l'heure si besoin, c'est juste le moment où le mail part.
SELECT cron.schedule(
  'send-reengagement-emails',
  '0 9 * * *',
  $$
    SELECT net.http_post(
      url := 'https://gyirveyzhqmqtgsmrktl.supabase.co/functions/v1/reengagement-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'reengagement_cron_secret')
      ),
      body := '{}'::jsonb
    );
  $$
);

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 041 terminée : relance email planifiée chaque jour à 9h UTC.';
  RAISE NOTICE 'Vérification recommandée avant de faire confiance au planning : exécuter le même';
  RAISE NOTICE 'SELECT net.http_post(...) manuellement, puis SELECT * FROM net._http_response ORDER BY created DESC LIMIT 5;';
END $$;
