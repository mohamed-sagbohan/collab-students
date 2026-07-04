-- ============================================================
-- Migration 019 — Le staff peut initier une conversation
-- Exécutez dans Supabase > SQL Editor (après la migration 018)
--
-- Jusqu'ici, un fil de chat naissait uniquement à la première
-- question de l'apprenante. Cette migration permet au formateur
-- ou à l'admin d'écrire en premier :
--  - annuaire des apprenantes (RPC security definer : la RLS de
--    profiles ne laisse un formateur voir que son propre profil) ;
--  - création/récupération de la conversation d'une apprenante
--    donnée, réservée au staff.
-- Le modèle reste inchangé : une conversation unique par
-- apprenante, la ligne appartient toujours à l'apprenante.
-- ============================================================

-- ── 1. RPC : annuaire des apprenantes (staff uniquement) ─────

CREATE OR REPLACE FUNCTION public.get_students_directory()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF public.get_my_role() NOT IN ('formateur', 'admin') THEN
    RAISE EXCEPTION 'Réservé au staff';
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name) ORDER BY p.name), '[]'::jsonb)
  INTO v_result
  FROM public.profiles p
  WHERE p.role = 'apprenante';

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_students_directory() TO authenticated;

-- ── 2. RPC : obtenir/créer la conversation d'une apprenante ──

CREATE OR REPLACE FUNCTION public.staff_get_or_create_conversation(p_student_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_id   uuid;
BEGIN
  IF public.get_my_role() NOT IN ('formateur', 'admin') THEN
    RAISE EXCEPTION 'Réservé au staff';
  END IF;

  SELECT role INTO v_role FROM public.profiles WHERE id = p_student_id;
  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;
  IF v_role <> 'apprenante' THEN
    RAISE EXCEPTION 'Une conversation appartient à une apprenante';
  END IF;

  -- ON CONFLICT DO UPDATE (no-op) pour que RETURNING renvoie aussi
  -- la ligne existante (même idiome que get_or_create_my_conversation).
  INSERT INTO public.conversations (student_id)
  VALUES (p_student_id)
  ON CONFLICT (student_id) DO UPDATE SET student_id = EXCLUDED.student_id
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.staff_get_or_create_conversation(uuid) TO authenticated;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 019 terminée : le staff peut initier une conversation (annuaire + création de fil).';
END $$;
