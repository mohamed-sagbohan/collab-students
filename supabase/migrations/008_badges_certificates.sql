-- ============================================================
-- Migration 008 — Système de badges
-- Exécutez dans Supabase > SQL Editor
-- ============================================================

-- ── 1. Tables ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text NOT NULL,
  emoji       text NOT NULL DEFAULT '🏅',
  color       text NOT NULL DEFAULT 'amber',  -- amber | emerald | blue | violet | orange | rose
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id    uuid REFERENCES public.badges(id) NOT NULL,
  course_id   uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  awarded_at  timestamptz DEFAULT now()
);

-- Index unique : un seul badge global par utilisateur (sans cours)
CREATE UNIQUE INDEX IF NOT EXISTS user_badges_global_unique
  ON public.user_badges(user_id, badge_id)
  WHERE course_id IS NULL;

-- Index unique : un seul badge par utilisateur + cours
CREATE UNIQUE INDEX IF NOT EXISTS user_badges_course_unique
  ON public.user_badges(user_id, badge_id, course_id)
  WHERE course_id IS NOT NULL;

-- ── 2. RLS ───────────────────────────────────────────────────

ALTER TABLE public.badges      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges visibles par tous"
  ON public.badges FOR SELECT USING (true);

CREATE POLICY "Apprenant voit ses propres badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id OR get_my_role() IN ('formateur', 'admin'));

-- ── 3. Badges de base ────────────────────────────────────────

INSERT INTO public.badges (slug, name, description, emoji, color) VALUES
  ('first_exercise', 'Première frappe',
   'Terminer votre tout premier exercice', '🎯', 'orange'),
  ('exercises_5', 'Assidu',
   'Terminer 5 exercices au total', '🔥', 'orange'),
  ('exercises_10', 'Endurant',
   'Terminer 10 exercices au total', '💪', 'amber'),
  ('wpm_30', 'Démarrage rapide',
   'Atteindre 30 mots par minute en dactylographie', '⚡', 'blue'),
  ('wpm_60', 'Vitesse supersonique',
   'Atteindre 60 mots par minute en dactylographie', '🚀', 'violet'),
  ('accuracy_100', 'Perfectionniste',
   'Obtenir 100 % de precision sur un exercice de dactylographie', '💯', 'emerald'),
  ('course_complete', 'Diplome',
   'Terminer toutes les lecons d un cours', '🎓', 'amber'),
  ('courses_3', 'Passionne',
   'Terminer 3 cours differents', '🏆', 'violet')
ON CONFLICT (slug) DO NOTHING;

-- ── 4. Fonction d'attribution sécurisée ──────────────────────

CREATE OR REPLACE FUNCTION public.award_badge(
  p_user_id  uuid,
  p_slug     text,
  p_course_id uuid DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_badge_id uuid;
BEGIN
  SELECT id INTO v_badge_id FROM public.badges WHERE slug = p_slug;
  IF v_badge_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.user_badges(user_id, badge_id, course_id)
  VALUES (p_user_id, v_badge_id, p_course_id)
  ON CONFLICT DO NOTHING;
END;
$$;

-- ── 5. Trigger sur exercise_results ──────────────────────────

CREATE OR REPLACE FUNCTION public.trigger_exercise_badges()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.exercise_results
  WHERE user_id = NEW.user_id;

  IF v_count >= 1  THEN PERFORM public.award_badge(NEW.user_id, 'first_exercise'); END IF;
  IF v_count >= 5  THEN PERFORM public.award_badge(NEW.user_id, 'exercises_5'); END IF;
  IF v_count >= 10 THEN PERFORM public.award_badge(NEW.user_id, 'exercises_10'); END IF;

  IF NEW.wpm IS NOT NULL THEN
    IF NEW.wpm >= 30 THEN PERFORM public.award_badge(NEW.user_id, 'wpm_30'); END IF;
    IF NEW.wpm >= 60 THEN PERFORM public.award_badge(NEW.user_id, 'wpm_60'); END IF;
  END IF;

  IF NEW.accuracy = 100 THEN
    PERFORM public.award_badge(NEW.user_id, 'accuracy_100');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_exercise_result_badges ON public.exercise_results;
CREATE TRIGGER on_exercise_result_badges
  AFTER INSERT ON public.exercise_results
  FOR EACH ROW EXECUTE FUNCTION public.trigger_exercise_badges();

-- ── 6. Trigger sur progress (fin de cours) ───────────────────

CREATE OR REPLACE FUNCTION public.trigger_course_completion_badge()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_course_id         uuid;
  v_total_lessons     int;
  v_completed_lessons int;
  v_completed_courses int;
BEGIN
  -- Ne s'exécute que quand une leçon passe à "complétée"
  IF NOT NEW.completed THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.completed = true THEN RETURN NEW; END IF;

  -- Trouver le cours de cette leçon
  SELECT course_id INTO v_course_id
  FROM public.lessons WHERE id = NEW.lesson_id;
  IF v_course_id IS NULL THEN RETURN NEW; END IF;

  -- Compter les leçons totales du cours
  SELECT COUNT(*) INTO v_total_lessons
  FROM public.lessons WHERE course_id = v_course_id;

  -- Compter les leçons complétées par cet apprenant dans ce cours
  SELECT COUNT(*) INTO v_completed_lessons
  FROM public.progress p
  JOIN public.lessons l ON l.id = p.lesson_id
  WHERE p.user_id = NEW.user_id
    AND l.course_id = v_course_id
    AND p.completed = true;

  -- Si toutes les leçons sont terminées : badge cours
  IF v_completed_lessons >= v_total_lessons THEN
    PERFORM public.award_badge(NEW.user_id, 'course_complete', v_course_id);

    -- Badge "3 cours terminés"
    SELECT COUNT(*) INTO v_completed_courses
    FROM public.user_badges ub
    JOIN public.badges b ON b.id = ub.badge_id
    WHERE ub.user_id = NEW.user_id AND b.slug = 'course_complete';

    IF v_completed_courses >= 3 THEN
      PERFORM public.award_badge(NEW.user_id, 'courses_3');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_progress_course_badge ON public.progress;
CREATE TRIGGER on_progress_course_badge
  AFTER INSERT OR UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.trigger_course_completion_badge();
