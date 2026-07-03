-- ============================================================
-- LearnIT — Création des utilisateurs de test
-- Exécutez dans Supabase > SQL Editor
--
--   Apprenant  : etudiant@learnit.fr    / Etudiant1234!
--   Formateur  : formateur@learnit.fr   / Formateur1234!
-- ============================================================

DO $$
DECLARE
  v_student    UUID;
  v_instructor UUID;
BEGIN

  -- ══════════════════════════════════════════════════════════
  -- APPRENANT
  -- ══════════════════════════════════════════════════════════
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'etudiant@learnit.fr') THEN
    SELECT id INTO v_student FROM auth.users WHERE email = 'etudiant@learnit.fr';
    RAISE NOTICE 'Apprenant déjà existant, ID récupéré.';
  ELSE
    v_student := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_student,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'etudiant@learnit.fr',
      crypt('Etudiant1234!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Marie Dupont"}',
      NOW(), NOW(),
      '', '', '', ''
    );
    RAISE NOTICE '✅ Apprenant créé : etudiant@learnit.fr';
  END IF;

  INSERT INTO public.profiles (id, name, role)
  VALUES (v_student, 'Marie Dupont', 'apprenante')
  ON CONFLICT (id) DO UPDATE SET role = 'apprenante', name = 'Marie Dupont';

  -- ══════════════════════════════════════════════════════════
  -- FORMATEUR
  -- ══════════════════════════════════════════════════════════
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'formateur@learnit.fr') THEN
    SELECT id INTO v_instructor FROM auth.users WHERE email = 'formateur@learnit.fr';
    RAISE NOTICE 'Formateur déjà existant, ID récupéré.';
  ELSE
    v_instructor := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_instructor,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'formateur@learnit.fr',
      crypt('Formateur1234!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Jean Martin"}',
      NOW(), NOW(),
      '', '', '', ''
    );
    RAISE NOTICE '✅ Formateur créé : formateur@learnit.fr';
  END IF;

  INSERT INTO public.profiles (id, name, role)
  VALUES (v_instructor, 'Jean Martin', 'formateur')
  ON CONFLICT (id) DO UPDATE SET role = 'formateur', name = 'Jean Martin';

  RAISE NOTICE '🎉 Utilisateurs de test prêts.';
END $$;
