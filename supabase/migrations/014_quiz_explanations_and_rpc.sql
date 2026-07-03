-- ============================================================
-- Migration 014 — Explications de quiz + RPC
-- Exécutez dans Supabase > SQL Editor (après la migration 013)
--
-- Ajoute une colonne "explanation" aux questions, affichée dans le
-- bilan de fin de quiz pour expliquer les erreurs. Le RPC
-- get_exercise_attempt (011) ne la renvoie pas avant soumission
-- (elle resterait cachée aux côtés de correct_answer) ; seul
-- submit_qcm_result la renvoie, une fois le quiz corrigé.
-- ============================================================

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS explanation text;

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
      'is_correct', p_answers ->> q.id::text = q.correct_answer,
      'explanation', q.explanation
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

-- ============================================================
-- Explications pour les 11 questions déjà existantes (seed.sql)
-- ============================================================

UPDATE public.questions SET explanation = 'Ctrl + C copie l''élément sélectionné dans le presse-papiers. Ctrl + X le coupe (déplace), Ctrl + V le colle, et Ctrl + Z annule la dernière action.'
  WHERE exercise_id = (SELECT id FROM public.exercises WHERE title = 'Quiz — Les raccourcis clavier') AND order_index = 1;
UPDATE public.questions SET explanation = 'Ctrl + Z annule effectivement la dernière action effectuée. Pour la rétablir, utilisez Ctrl + Y.'
  WHERE exercise_id = (SELECT id FROM public.exercises WHERE title = 'Quiz — Les raccourcis clavier') AND order_index = 2;
UPDATE public.questions SET explanation = 'Win + E ouvre directement l''Explorateur de fichiers. Win + D affiche le bureau, et Win + L verrouille l''ordinateur.'
  WHERE exercise_id = (SELECT id FROM public.exercises WHERE title = 'Quiz — Les raccourcis clavier') AND order_index = 3;
UPDATE public.questions SET explanation = 'Alt + F4 ferme la fenêtre ou le programme actif à l''écran. À utiliser avec prudence si vous avez un travail non enregistré.'
  WHERE exercise_id = (SELECT id FROM public.exercises WHERE title = 'Quiz — Les raccourcis clavier') AND order_index = 4;
UPDATE public.questions SET explanation = 'Le cadenas et le préfixe https:// indiquent que la connexion entre vous et le site est chiffrée. Cela ne garantit pas l''honnêteté du site, mais c''est un premier signe de sérieux.'
  WHERE exercise_id = (SELECT id FROM public.exercises WHERE title = 'Quiz — Reconnaître un site fiable') AND order_index = 1;
UPDATE public.questions SET explanation = 'Aucune banque sérieuse ne vous demandera votre mot de passe par email : c''est une technique classique de phishing.'
  WHERE exercise_id = (SELECT id FROM public.exercises WHERE title = 'Quiz — Reconnaître un site fiable') AND order_index = 2;
UPDATE public.questions SET explanation = 'Ces popups sont de fausses alertes destinées à vous faire paniquer et appeler un faux support technique payant. Fermez la fenêtre, n''appelez jamais le numéro affiché.'
  WHERE exercise_id = (SELECT id FROM public.exercises WHERE title = 'Quiz — Reconnaître un site fiable') AND order_index = 3;
UPDATE public.questions SET explanation = '12 caractères est aujourd''hui le minimum recommandé pour résister aux outils de piratage automatisés. Plus c''est long, plus c''est solide.'
  WHERE exercise_id = (SELECT id FROM public.exercises WHERE title = 'Quiz — Créer un bon mot de passe') AND order_index = 1;
UPDATE public.questions SET explanation = 'Réutiliser le même mot de passe est risqué : si un seul site est piraté, tous vos autres comptes utilisant ce mot de passe deviennent vulnérables.'
  WHERE exercise_id = (SELECT id FROM public.exercises WHERE title = 'Quiz — Créer un bon mot de passe') AND order_index = 2;
UPDATE public.questions SET explanation = 'Ce mot de passe mélange majuscules, minuscules, chiffres et symboles sans schéma prévisible, contrairement aux autres options bien trop simples ou devinables.'
  WHERE exercise_id = (SELECT id FROM public.exercises WHERE title = 'Quiz — Créer un bon mot de passe') AND order_index = 3;
UPDATE public.questions SET explanation = 'Un gestionnaire de mots de passe génère et retient des mots de passe uniques et complexes pour chaque site, sans que vous ayez à les mémoriser.'
  WHERE exercise_id = (SELECT id FROM public.exercises WHERE title = 'Quiz — Créer un bon mot de passe') AND order_index = 4;
