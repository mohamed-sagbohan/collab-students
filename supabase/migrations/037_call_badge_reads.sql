-- ============================================================
-- Migration 037 — Curseur "vu" pour le badge d'appels manqués
-- Exécutez dans Supabase > SQL Editor (après la migration 036)
--
-- Remplace le prototype localStorage : une ligne PAR UTILISATEUR
-- (pas par conversation, contrairement à chat_reads) — le badge
-- d'appels manqués est un total global aussi bien côté élève (une
-- seule conversation de toute façon) que côté staff (vue agrégée
-- toutes conversations confondues, pas de drill-down par fil).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.call_badge_reads (
  user_id  uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  seen_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.call_badge_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lire son propre curseur d appels"      ON public.call_badge_reads;
DROP POLICY IF EXISTS "Creer son propre curseur d appels"     ON public.call_badge_reads;
DROP POLICY IF EXISTS "Mettre a jour son propre curseur d appels" ON public.call_badge_reads;

CREATE POLICY "Lire son propre curseur d appels"
  ON public.call_badge_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Creer son propre curseur d appels"
  ON public.call_badge_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mettre a jour son propre curseur d appels"
  ON public.call_badge_reads FOR UPDATE
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.call_badge_reads TO authenticated;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 037 terminée : call_badge_reads prête (badge appels manqués en base).';
END $$;
