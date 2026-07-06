-- ============================================================
-- Migration 029 — Règles de validation des leçons + parcours séquentiel
-- Exécutez dans Supabase > SQL Editor (après la migration 028)
--
-- La complétion d'une leçon n'est plus purement déclarative :
--  - si la leçon contient un quiz (QCM/Vrai-Faux), il faut au moins
--    UN résultat >= 60 % sur un des quiz de la leçon ;
--  - si elle contient un exercice de dactylographie, il faut au
--    moins un résultat de frappe enregistré (mode examen OU
--    entraînement — les deux écrivent dans exercise_results) ;
--  - les leçons sans exercice se valident librement, comme avant.
--
-- Parcours séquentiel (opt-in par cours) :
--  - courses.sequential (false par défaut : AUCUN cours existant ne
--    change de comportement) ;
--  - si activé, une leçon ne peut être validée que si toutes les
--    leçons précédentes (order_index inférieur) le sont déjà.
--
-- Rétrocompatibilité : les progressions déjà complétées ne sont
-- jamais re-vérifiées (le trigger laisse passer les re-upserts sur
-- une ligne déjà completed = true).
-- Le front affiche les mêmes règles AVANT le clic ; le trigger est
-- la vérité côté serveur (RAISE avec un mot-clé mappé en toast).
-- ============================================================

-- ── 1. Colonne sequential sur courses ────────────────────────

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS sequential boolean DEFAULT false NOT NULL;

-- ── 2. Trigger : garde-fou de complétion ─────────────────────

CREATE OR REPLACE FUNCTION public.trigger_progress_completion_guard()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_id   uuid;
  v_order       integer;
  v_sequential  boolean;
  v_has_quiz    boolean;
  v_has_dactylo boolean;
BEGIN
  IF NEW.completed IS DISTINCT FROM true THEN
    RETURN NEW;
  END IF;
  -- Ligne déjà complétée : re-upsert toléré (rétrocompatibilité).
  IF TG_OP = 'UPDATE' AND OLD.completed = true THEN
    RETURN NEW;
  END IF;

  SELECT l.course_id, l.order_index, c.sequential
  INTO v_course_id, v_order, v_sequential
  FROM public.lessons l
  JOIN public.courses c ON c.id = l.course_id
  WHERE l.id = NEW.lesson_id;

  SELECT
    EXISTS (
      SELECT 1 FROM public.exercises e
      JOIN public.questions q ON q.exercise_id = e.id
      WHERE e.lesson_id = NEW.lesson_id AND q.type IN ('qcm', 'vrai_faux')
    ),
    EXISTS (
      SELECT 1 FROM public.exercises e
      JOIN public.questions q ON q.exercise_id = e.id
      WHERE e.lesson_id = NEW.lesson_id AND q.type = 'dactylographie'
    )
  INTO v_has_quiz, v_has_dactylo;

  IF v_has_quiz AND NOT EXISTS (
    SELECT 1 FROM public.exercise_results r
    JOIN public.exercises e ON e.id = r.exercise_id
    WHERE e.lesson_id = NEW.lesson_id
      AND r.user_id = NEW.user_id
      AND r.result_type = 'qcm'
      AND r.score_pct >= 60
  ) THEN
    RAISE EXCEPTION 'QUIZ_REQUIS : réussissez le quiz de la leçon (60 %% minimum) avant de la valider';
  END IF;

  IF v_has_dactylo AND NOT EXISTS (
    SELECT 1 FROM public.exercise_results r
    JOIN public.exercises e ON e.id = r.exercise_id
    WHERE e.lesson_id = NEW.lesson_id
      AND r.user_id = NEW.user_id
      AND r.result_type = 'dactylographie'
  ) THEN
    RAISE EXCEPTION 'DACTYLO_REQUISE : terminez l''exercice de frappe avant de valider la leçon';
  END IF;

  IF v_sequential AND EXISTS (
    SELECT 1 FROM public.lessons l
    WHERE l.course_id = v_course_id
      AND l.order_index < v_order
      AND NOT EXISTS (
        SELECT 1 FROM public.progress p
        WHERE p.lesson_id = l.id AND p.user_id = NEW.user_id AND p.completed = true
      )
  ) THEN
    RAISE EXCEPTION 'ORDRE_REQUIS : terminez d''abord les leçons précédentes de ce cours';
  END IF;

  IF NEW.completed_at IS NULL THEN
    NEW.completed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_progress_completion_guard ON public.progress;
CREATE TRIGGER on_progress_completion_guard
  BEFORE INSERT OR UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.trigger_progress_completion_guard();

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 029 terminée : validation conditionnée aux exercices + parcours séquentiel opt-in (courses.sequential).';
END $$;
