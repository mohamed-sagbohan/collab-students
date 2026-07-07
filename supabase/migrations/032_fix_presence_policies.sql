-- ============================================================
-- Migration 032 — Répare les politiques RLS de user_presence
-- Exécutez dans Supabase > SQL Editor (après la migration 031)
--
-- Symptôme en prod : le heartbeat POST /rest/v1/user_presence
-- répond 403 « new row violates row-level security policy »
-- alors que la politique INSERT de la migration 030 devrait
-- l'accepter — l'état réel des politiques ne correspond pas au
-- fichier. Ce script est idempotent : il remet tout d'équerre
-- (RLS activée, les 3 politiques, les GRANT) puis affiche l'état
-- final pour contrôle.
-- ============================================================

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff lit la presence"         ON public.user_presence;
DROP POLICY IF EXISTS "Chacun cree sa presence"       ON public.user_presence;
DROP POLICY IF EXISTS "Chacun met a jour sa presence" ON public.user_presence;

CREATE POLICY "Staff lit la presence"
  ON public.user_presence FOR SELECT
  USING (public.get_my_role() IN ('formateur', 'admin'));

CREATE POLICY "Chacun cree sa presence"
  ON public.user_presence FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Chacun met a jour sa presence"
  ON public.user_presence FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.user_presence TO authenticated;

-- État final : 3 politiques attendues (SELECT staff, INSERT self, UPDATE self)
SELECT policyname, cmd, permissive, qual, with_check
FROM pg_policies
WHERE tablename = 'user_presence'
ORDER BY policyname;
