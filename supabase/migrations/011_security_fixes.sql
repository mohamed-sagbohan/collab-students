-- ============================================================
-- Migration 011 — Corrections de sécurité
-- Exécutez dans Supabase > SQL Editor
--
-- 1) Empêche l'auto-élévation de privilèges (profiles.role)
-- 2) Cache les bonnes réponses QCM/Vrai-Faux avant soumission
-- 3) Calcule et enregistre le score QCM côté serveur
-- 4) Restreint l'insertion directe dans exercise_results
-- 5) Restreint la visibilité des commentaires aux leçons accessibles
-- ============================================================

-- ── 1. Anti auto-élévation de privilèges ────────────────────────
-- La policy "Profil modifiable par son propriétaire" (USING auth.uid() = id,
-- sans WITH CHECK) permettait à n'importe quel utilisateur connecté de
-- s'attribuer le rôle 'admin' ou 'formateur' via un simple appel
-- supabase.from('profiles').update({ role: 'admin' }).eq('id', monId).
-- On verrouille la colonne role avec un trigger : seul un admin (ou le
-- trigger système handle_new_user) peut la modifier.

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND public.get_my_role() <> 'admin' THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();

-- ── 2 & 3. RPC sécurisées pour les exercices QCM/Vrai-Faux ──────
-- Le SELECT direct sur `questions` exposait `correct_answer` avant que
-- l'apprenant ne réponde. Pour le type 'dactylographie', correct_answer
-- est le texte à taper (il doit rester visible) ; pour 'qcm'/'vrai_faux'
-- c'est la réponse attendue (elle doit rester cachée avant soumission).

CREATE OR REPLACE FUNCTION public.get_exercise_attempt(p_exercise_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed boolean;
  v_result  jsonb;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.exercises e
    JOIN public.lessons l ON l.id = e.lesson_id
    JOIN public.courses c ON c.id = l.course_id
    WHERE e.id = p_exercise_id
      AND (c.published = true OR c.instructor_id = auth.uid() OR public.get_my_role() = 'admin')
  ) INTO v_allowed;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Exercice introuvable ou accès refusé';
  END IF;

  SELECT jsonb_build_object(
    'id', e.id,
    'title', e.title,
    'duration_seconds', e.duration_seconds,
    'questions', COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', q.id,
        'question', q.question,
        'type', q.type,
        'options', q.options,
        'order_index', q.order_index,
        'correct_answer', CASE WHEN q.type = 'dactylographie' THEN q.correct_answer ELSE NULL END
      ) ORDER BY q.order_index
    ) FILTER (WHERE q.id IS NOT NULL), '[]'::jsonb)
  )
  INTO v_result
  FROM public.exercises e
  LEFT JOIN public.questions q ON q.exercise_id = e.id
  WHERE e.id = p_exercise_id
  GROUP BY e.id;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_exercise_attempt(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_qcm_result(p_exercise_id uuid, p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total   int;
  v_correct int;
  v_score   int;
  v_results jsonb;
BEGIN
  SELECT count(*) INTO v_total
  FROM public.questions
  WHERE exercise_id = p_exercise_id AND type <> 'dactylographie';

  IF v_total = 0 THEN
    RAISE EXCEPTION 'Aucune question QCM/Vrai-Faux pour cet exercice';
  END IF;

  SELECT
    count(*) FILTER (WHERE p_answers ->> q.id::text = q.correct_answer),
    jsonb_agg(jsonb_build_object(
      'id', q.id,
      'correct_answer', q.correct_answer,
      'user_answer', p_answers ->> q.id::text,
      'is_correct', p_answers ->> q.id::text = q.correct_answer
    ))
  INTO v_correct, v_results
  FROM public.questions q
  WHERE q.exercise_id = p_exercise_id AND q.type <> 'dactylographie';

  v_score := round((v_correct::numeric / v_total) * 100);

  INSERT INTO public.exercise_results (user_id, exercise_id, result_type, score_pct)
  VALUES (auth.uid(), p_exercise_id, 'qcm', v_score);

  RETURN jsonb_build_object('score_pct', v_score, 'correct', v_correct, 'total', v_total, 'results', v_results);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_qcm_result(uuid, jsonb) TO authenticated;

-- ── 4. L'insertion directe de résultats QCM passe désormais par ────
--      submit_qcm_result() (SECURITY DEFINER). Seuls les résultats de
--      dactylographie restent insérables directement par le client,
--      avec des bornes de sanité pour éviter les valeurs aberrantes.

DROP POLICY IF EXISTS "Apprenant soumet ses résultats" ON public.exercise_results;
CREATE POLICY "Apprenant soumet ses résultats de frappe"
  ON public.exercise_results FOR INSERT
  WITH CHECK (user_id = auth.uid() AND result_type = 'dactylographie');

ALTER TABLE public.exercise_results
  DROP CONSTRAINT IF EXISTS exercise_results_score_pct_check,
  DROP CONSTRAINT IF EXISTS exercise_results_wpm_check,
  DROP CONSTRAINT IF EXISTS exercise_results_accuracy_check;

ALTER TABLE public.exercise_results
  ADD CONSTRAINT exercise_results_score_pct_check CHECK (score_pct IS NULL OR score_pct BETWEEN 0 AND 100),
  ADD CONSTRAINT exercise_results_wpm_check CHECK (wpm IS NULL OR wpm BETWEEN 0 AND 400),
  ADD CONSTRAINT exercise_results_accuracy_check CHECK (accuracy IS NULL OR accuracy BETWEEN 0 AND 100);

-- ── 5. Commentaires visibles seulement si la leçon est accessible ──
DROP POLICY IF EXISTS "Commentaires visibles par tous les connectes" ON public.comments;
CREATE POLICY "Commentaires visibles si leçon accessible"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON c.id = l.course_id
      WHERE l.id = comments.lesson_id
        AND (c.published = true OR c.instructor_id = auth.uid() OR public.get_my_role() = 'admin')
    )
  );
