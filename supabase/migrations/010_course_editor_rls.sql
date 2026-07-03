-- ============================================================
-- Migration 010 — RLS éditeur de cours (formateur + admin)
-- Exécutez dans Supabase > SQL Editor
-- ============================================================

-- ── COURSES ──────────────────────────────────────────────────

-- SELECT : formateur voit ses propres cours (même brouillons)
DROP POLICY IF EXISTS "Formateur voit ses propres cours" ON public.courses;
CREATE POLICY "Formateur voit ses propres cours"
  ON public.courses FOR SELECT
  USING (instructor_id = auth.uid());

-- INSERT : formateur crée avec son propre instructor_id | admin crée librement
DROP POLICY IF EXISTS "Formateur et admin peuvent creer un cours" ON public.courses;
CREATE POLICY "Formateur et admin peuvent creer un cours"
  ON public.courses FOR INSERT
  WITH CHECK (
    (auth.uid() = instructor_id AND get_my_role() = 'formateur')
    OR get_my_role() = 'admin'
  );

-- UPDATE : formateur modifie ses cours | admin modifie tout
DROP POLICY IF EXISTS "Formateur et admin peuvent modifier un cours" ON public.courses;
CREATE POLICY "Formateur et admin peuvent modifier un cours"
  ON public.courses FOR UPDATE
  USING (
    (auth.uid() = instructor_id AND get_my_role() = 'formateur')
    OR get_my_role() = 'admin'
  );

-- DELETE : formateur supprime ses propres cours (admin a déjà sa policy via migration 006)
DROP POLICY IF EXISTS "Formateur peut supprimer son cours" ON public.courses;
CREATE POLICY "Formateur peut supprimer son cours"
  ON public.courses FOR DELETE
  USING (auth.uid() = instructor_id AND get_my_role() = 'formateur');

-- ── LESSONS ──────────────────────────────────────────────────

-- SELECT : formateur voit les leçons de ses cours (même non publiés)
DROP POLICY IF EXISTS "Formateur voit les lecons de ses cours" ON public.lessons;
CREATE POLICY "Formateur voit les lecons de ses cours"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
  );

-- INSERT
DROP POLICY IF EXISTS "Formateur et admin peuvent creer une lecon" ON public.lessons;
CREATE POLICY "Formateur et admin peuvent creer une lecon"
  ON public.lessons FOR INSERT
  WITH CHECK (
    get_my_role() = 'admin'
    OR (
      get_my_role() = 'formateur'
      AND EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
    )
  );

-- UPDATE
DROP POLICY IF EXISTS "Formateur et admin peuvent modifier une lecon" ON public.lessons;
CREATE POLICY "Formateur et admin peuvent modifier une lecon"
  ON public.lessons FOR UPDATE
  USING (
    get_my_role() = 'admin'
    OR (
      get_my_role() = 'formateur'
      AND EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
    )
  );

-- DELETE
DROP POLICY IF EXISTS "Formateur et admin peuvent supprimer une lecon" ON public.lessons;
CREATE POLICY "Formateur et admin peuvent supprimer une lecon"
  ON public.lessons FOR DELETE
  USING (
    get_my_role() = 'admin'
    OR (
      get_my_role() = 'formateur'
      AND EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
    )
  );
