-- ============================================================
-- Migration 034 — Appels audio/vidéo (apprenante ↔ staff)
-- Exécutez dans Supabase > SQL Editor (après la migration 033)
--
-- Modèle : 1-à-1 uniquement (WebRTC pur, sans serveur média). La
-- table `calls` ne porte QUE le cycle de vie de l'appel (sonnerie,
-- acceptation, fin) — elle est visible en realtime par l'apprenante
-- concernée ET tout le staff (même modèle que conversations/
-- chat_messages), pour que n'importe quel membre du staff en ligne
-- voie sonner un appel entrant, même sans avoir cette conversation
-- ouverte dans Messagerie.
--
-- Le SDP offer/answer et les candidats ICE, eux, transitent en
-- broadcast sur le canal `chat-conv-<conversation_id>` déjà autorisé
-- par la migration 018 (mêmes participants) — comme l'indicateur
-- « en train d'écrire » : aucune nouvelle policy realtime requise.
--
-- Course entre plusieurs membres du staff : answer_call fait un
-- UPDATE conditionné à status='ringing' — seul le premier à cliquer
-- « décrocher » voit sa mise à jour appliquée (0 ligne affectée pour
-- les autres, gérée côté client comme « déjà répondu par un collègue »).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.calls (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  caller_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  callee_id       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  call_type       text NOT NULL CHECK (call_type IN ('audio', 'video')),
  status          text NOT NULL DEFAULT 'ringing'
                    CHECK (status IN ('ringing', 'accepted', 'declined', 'missed', 'ended', 'failed')),
  started_at      timestamptz DEFAULT now() NOT NULL,
  answered_at     timestamptz,
  ended_at        timestamptz
);

CREATE INDEX IF NOT EXISTS calls_conversation_idx ON public.calls(conversation_id, started_at DESC);

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Calls visibles par l apprenante ou le staff" ON public.calls;
DROP POLICY IF EXISTS "Demarrer un appel"                           ON public.calls;
DROP POLICY IF EXISTS "Repondre ou terminer un appel"               ON public.calls;

CREATE POLICY "Calls visibles par l apprenante ou le staff"
  ON public.calls FOR SELECT
  USING (
    public.get_my_role() IN ('formateur', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = calls.conversation_id AND c.student_id = auth.uid()
    )
  );

-- L'appelant est soit l'apprenante de sa propre conversation, soit
-- n'importe quel membre du staff (qui peut appeler n'importe quelle
-- apprenante, comme il peut déjà lui écrire).
CREATE POLICY "Demarrer un appel"
  ON public.calls FOR INSERT
  WITH CHECK (
    caller_id = auth.uid()
    AND (
      public.get_my_role() IN ('formateur', 'admin')
      OR EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = calls.conversation_id AND c.student_id = auth.uid()
      )
    )
  );

CREATE POLICY "Repondre ou terminer un appel"
  ON public.calls FOR UPDATE
  USING (
    public.get_my_role() IN ('formateur', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = calls.conversation_id AND c.student_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE ON public.calls TO authenticated;

-- Realtime : l'INSERT (sonnerie) doit atteindre le staff même sans
-- avoir la conversation ouverte (postgres_changes global, comme
-- chat-staff) et l'apprenante concernée (toujours à l'écoute via le
-- widget de chat).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'calls'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
  END IF;
END $$;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 034 terminée : table calls (cycle de vie) prête, publiée en realtime.';
END $$;
