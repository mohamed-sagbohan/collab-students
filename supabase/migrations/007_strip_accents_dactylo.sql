-- ============================================================
-- Migration 007 — Suppression des accents dans les exercices
--                 de dactylographie
-- Exécutez dans Supabase > SQL Editor
--
-- Remplace tous les caractères accentués français dans les
-- textes à taper (correct_answer) des questions de type
-- 'dactylographie', afin que tous les claviers puissent
-- réaliser les exercices sans difficulté.
-- ============================================================

UPDATE public.questions
SET correct_answer = translate(
  correct_answer,
  'éèêëàâùûüîïôçÉÈÊËÀÂÙÛÜÎÏÔÇ',
  'eeeeaauuuiiocEEEEAAUUUIIOC'
)
WHERE type = 'dactylographie';

-- Vérification : affiche les textes mis à jour
SELECT
  q.id,
  LEFT(q.correct_answer, 80) AS apercu,
  e.title AS exercice
FROM public.questions q
JOIN public.exercises e ON e.id = q.exercise_id
WHERE q.type = 'dactylographie'
ORDER BY e.title;
