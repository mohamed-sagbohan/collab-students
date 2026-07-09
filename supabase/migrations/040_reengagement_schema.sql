-- ============================================================
-- Migration 040 — Relance email des élèves inactives : schéma
-- Exécutez dans Supabase > SQL Editor (après la migration 039)
--
-- Objectif : relancer par email les élèves (role='apprenante') qui ne
-- reviennent plus sur la plateforme, à des paliers d'inactivité
-- espacés (J+3, J+7, J+14) plutôt qu'un email quotidien sans fin
-- (délivrabilité, spam). La planification (pg_cron/pg_net) et la
-- Edge Function d'envoi arrivent dans une migration séparée (041) et
-- dans supabase/functions/reengagement-emails — celle-ci ne pose que
-- le schéma, sans rien d'exécutable côté cron.
--
-- Source d'inactivité : `user_presence.last_seen_at` (migration 030),
-- déjà mis à jour par le heartbeat élève — aucune nouvelle table de
-- suivi de présence nécessaire, juste une comparaison de date.
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reengagement_opt_out boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.reengagement_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  milestone_days integer NOT NULL CHECK (milestone_days IN (3, 7, 14)),
  channel        text NOT NULL DEFAULT 'email' CHECK (channel IN ('email')),
  sent_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, milestone_days, channel)
);

ALTER TABLE public.reengagement_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin voit le journal de relance" ON public.reengagement_log;
CREATE POLICY "Admin voit le journal de relance"
  ON public.reengagement_log FOR SELECT
  USING (public.get_my_role() = 'admin');
-- Pas de policy INSERT/UPDATE : seul le service_role écrit (bypass RLS),
-- comme delete-user pour auth.admin.

-- RPC : élèves dues pour une relance aujourd'hui — expose emails et
-- inactivité, RÉSERVÉE au service_role (jamais authenticated/anon).
-- SELECT DISTINCT ON (p.id) ... ORDER BY m.days DESC : pas de fenêtre
-- temporelle stricte, donc auto-réparateur si un run cron est manqué —
-- le prochain run retrouve le palier le plus avancé pas encore envoyé.
CREATE OR REPLACE FUNCTION public.get_students_due_reengagement()
RETURNS TABLE (user_id uuid, name text, email text, milestone_days integer)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT ON (p.id)
    p.id, p.name, u.email, m.days
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  JOIN public.user_presence up ON up.user_id = p.id
  CROSS JOIN (VALUES (3), (7), (14)) AS m(days)
  WHERE p.role = 'apprenante'
    AND p.reengagement_opt_out = false
    AND up.last_seen_at < now() - (m.days || ' days')::interval
    AND NOT EXISTS (
      SELECT 1 FROM public.reengagement_log l
      WHERE l.user_id = p.id AND l.milestone_days = m.days AND l.channel = 'email'
    )
  ORDER BY p.id, m.days DESC;
$$;

REVOKE ALL ON FUNCTION public.get_students_due_reengagement() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_students_due_reengagement() TO service_role;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 040 terminée : schéma de relance email prêt (opt_out, reengagement_log, RPC).';
END $$;
