-- ============================================================
-- Migration 006 — Résultats d'exercices + Realtime
-- Exécutez dans Supabase > SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- TABLE exercise_results
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exercise_results (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  result_type text NOT NULL CHECK (result_type IN ('qcm', 'dactylographie')),
  score_pct   integer,          -- QCM : % de bonnes réponses
  wpm         integer,          -- Dactylo : mots par minute
  accuracy    integer,          -- Dactylo : % de précision
  elapsed_sec integer,          -- Durée en secondes
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.exercise_results ENABLE ROW LEVEL SECURITY;

-- Apprenant voit ses propres résultats
CREATE POLICY "Apprenant voit ses résultats"
  ON public.exercise_results FOR SELECT
  USING (user_id = auth.uid());

-- Apprenant peut soumettre ses résultats
CREATE POLICY "Apprenant soumet ses résultats"
  ON public.exercise_results FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Formateur et admin voient TOUS les résultats (pour le suivi en direct)
CREATE POLICY "Formateur et admin voient tous les résultats"
  ON public.exercise_results FOR SELECT
  USING (public.get_my_role() IN ('formateur', 'admin'));

-- ──────────────────────────────────────────────────────────────
-- RLS supplémentaire : formateur peut voir la progression
-- (la table progress n'avait pas de policy pour formateur)
-- ──────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'progress'
      AND policyname = 'Formateur voit toute la progression'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Formateur voit toute la progression"
        ON public.progress FOR SELECT
        USING (public.get_my_role() = 'formateur');
    $p$;
    RAISE NOTICE 'Policy "Formateur voit toute la progression" créée.';
  ELSE
    RAISE NOTICE 'Policy "Formateur voit toute la progression" déjà existante.';
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- Activer Supabase Realtime sur exercise_results
-- (permet au formateur de recevoir les résultats en temps réel)
-- ──────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Vérifie si la table est déjà dans la publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'exercise_results'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.exercise_results';
    RAISE NOTICE 'Realtime activé sur exercise_results.';
  ELSE
    RAISE NOTICE 'Realtime déjà activé sur exercise_results.';
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- Fix : admin peut supprimer des cours (policy manquante)
-- ──────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'courses'
      AND policyname = 'Admin peut supprimer des cours'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admin peut supprimer des cours"
        ON public.courses FOR DELETE
        USING (public.get_my_role() = 'admin');
    $p$;
    RAISE NOTICE 'Policy DELETE sur courses créée pour admin.';
  END IF;
END $$;

DO $$ BEGIN RAISE NOTICE '✅ Migration 006 terminée : table exercise_results + RLS + Realtime + fix DELETE.'; END $$;
