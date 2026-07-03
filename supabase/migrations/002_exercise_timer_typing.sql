-- ============================================================
-- Migration 002 — Minuteur sur exercices + type dactylographie
-- Exécutez dans Supabase > SQL Editor
-- ============================================================

-- 1. Ajouter la colonne minuteur sur les exercices
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- 2. Étendre le CHECK pour autoriser le type 'dactylographie'
ALTER TABLE public.questions
  DROP CONSTRAINT IF EXISTS questions_type_check;

ALTER TABLE public.questions
  ADD CONSTRAINT questions_type_check
  CHECK (type IN ('qcm', 'vrai_faux', 'texte_libre', 'dactylographie'));

-- 3. Ajouter des exemples d'exercices de dactylographie
DO $$
DECLARE
  v_lesson UUID;
  v_ex     UUID;
BEGIN

  -- ── Exercice de dactylographie — Leçon "Raccourcis clavier" ──
  SELECT id INTO v_lesson
  FROM public.lessons
  WHERE title ILIKE '%raccourcis%'
  LIMIT 1;

  IF v_lesson IS NOT NULL THEN
    INSERT INTO public.exercises (lesson_id, title, duration_seconds)
    VALUES (v_lesson, 'Exercice de dactylographie — Mots courants', 60)
    RETURNING id INTO v_ex;

    INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, order_index)
    VALUES (
      v_ex,
      'Tapez le texte suivant aussi vite et précisément que possible :',
      'dactylographie',
      NULL,
      'Le clavier est votre meilleur allié pour travailler plus vite. Entraînez-vous chaque jour pour améliorer votre vitesse de frappe.',
      1
    );

    RAISE NOTICE 'Exercice de dactylographie ajouté à la leçon Raccourcis clavier.';
  END IF;

  -- ── Exercice de dactylographie — Leçon Internet ──
  SELECT id INTO v_lesson
  FROM public.lessons
  WHERE title ILIKE '%recherche%' AND title ILIKE '%google%'
  LIMIT 1;

  IF v_lesson IS NOT NULL THEN
    INSERT INTO public.exercises (lesson_id, title, duration_seconds)
    VALUES (v_lesson, 'Exercice de dactylographie — Termes numériques', 90)
    RETURNING id INTO v_ex;

    INSERT INTO public.questions (exercise_id, question, type, options, correct_answer, order_index)
    VALUES (
      v_ex,
      'Reproduisez ce texte pour vous entraîner à taper des termes informatiques :',
      'dactylographie',
      NULL,
      'Internet est un réseau mondial. Pour faire une recherche, ouvrez votre navigateur et tapez vos mots-clés dans la barre de recherche Google.',
      1
    );

    RAISE NOTICE 'Exercice de dactylographie ajouté à la leçon Internet.';
  END IF;

  -- ── 4. Mettre un minuteur sur les exercices QCM existants ──
  -- Exercice raccourcis clavier → 2 minutes
  UPDATE public.exercises
  SET duration_seconds = 120
  WHERE title ILIKE '%raccourcis clavier%'
    AND duration_seconds IS NULL;

  -- Exercice sites fiables → 90 secondes
  UPDATE public.exercises
  SET duration_seconds = 90
  WHERE title ILIKE '%site%fiable%'
    AND duration_seconds IS NULL;

  -- Exercice mots de passe → 120 secondes
  UPDATE public.exercises
  SET duration_seconds = 120
  WHERE title ILIKE '%mot de passe%'
    AND duration_seconds IS NULL;

  RAISE NOTICE '✅ Migration 002 appliquée avec succès.';
END $$;
