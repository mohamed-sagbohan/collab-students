-- ============================================================
-- Migration 024 — Accusés de lecture « Vu »
-- Exécutez dans Supabase > SQL Editor (après la migration 023)
--
-- Chaque participant voit désormais où en est la lecture de
-- l'autre : la mention « Vu » s'affiche sous le dernier de ses
-- messages lu par l'autre côté.
--  - policy SELECT élargie sur chat_reads : l'apprenante voit les
--    curseurs de SA conversation (donc ceux du staff), le staff
--    voit tout — même périmètre que les messages eux-mêmes ;
--  - chat_reads ajoutée à la publication realtime : le « Vu »
--    apparaît en direct quand l'autre ouvre la discussion
--    (l'upsert du curseur part en INSERT ou en UPDATE, les deux
--    événements transportent la ligne complète, pas besoin de
--    REPLICA IDENTITY FULL).
-- Les policies INSERT/UPDATE ne bougent pas : on ne modifie
-- toujours que SON propre curseur.
-- ============================================================

-- ── 1. Policy SELECT : curseurs visibles par les participants ──

DROP POLICY IF EXISTS "Chacun voit son curseur de lecture"        ON public.chat_reads;
DROP POLICY IF EXISTS "Curseurs visibles par les participants"    ON public.chat_reads;

CREATE POLICY "Curseurs visibles par les participants"
  ON public.chat_reads FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.get_my_role() IN ('formateur', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = chat_reads.conversation_id
        AND c.student_id = auth.uid()
    )
  );

-- ── 2. Realtime ──────────────────────────────────────────────

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reads;
  RAISE NOTICE 'chat_reads ajoutee a supabase_realtime';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'chat_reads deja dans supabase_realtime';
END $$;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 024 terminée : accusés de lecture « Vu » (policy participants, realtime chat_reads).';
END $$;
