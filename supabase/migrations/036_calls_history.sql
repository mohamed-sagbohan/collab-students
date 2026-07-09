-- ============================================================
-- Migration 036 — Historique des appels : nom de la destinataire
-- + RPC staff pour la page dédiée (toutes conversations confondues)
-- ============================================================

-- callee_name : même rationale que caller_name (migration 035) — la
-- destinataire connaît déjà son propre nom au moment d'accepter, aucune
-- lecture profiles supplémentaire nécessaire (RLS profiles restrictive
-- pour formateur, cf. schema.sql).
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS callee_name text;

-- Tri global toutes conversations (page staff) — l'index existant
-- (conversation_id, started_at DESC) ne sert que le fil par conversation.
CREATE INDEX IF NOT EXISTS calls_started_at_idx ON public.calls(started_at DESC);

-- RPC pour /formateur/appels et /admin/appels UNIQUEMENT : un appel
-- initié par le staff et jamais décroché n'a ni callee_id ni callee_name
-- (personne n'a répondu) — seul conversation_id -> student_id permet de
-- savoir de quelle étudiante il s'agissait, et formateur ne peut pas lire
-- profiles directement (RLS). D'où le join server-side en SECURITY
-- DEFINER, comme get_staff_conversations (migration 017).
CREATE OR REPLACE FUNCTION public.get_staff_calls(
  p_call_type text    DEFAULT NULL,
  p_status    text    DEFAULT NULL,
  p_search    text    DEFAULT NULL,
  p_limit     integer DEFAULT 30,
  p_offset    integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total integer;
  v_rows  jsonb;
BEGIN
  IF public.get_my_role() NOT IN ('formateur', 'admin') THEN
    RAISE EXCEPTION 'Réservé au staff';
  END IF;

  SELECT count(*) INTO v_total
  FROM public.calls c
  JOIN public.conversations conv ON conv.id = c.conversation_id
  JOIN public.profiles stu ON stu.id = conv.student_id
  WHERE (p_call_type IS NULL OR c.call_type = p_call_type)
    AND (p_status IS NULL OR c.status = p_status)
    AND (p_search IS NULL OR stu.name ILIKE '%' || p_search || '%');

  SELECT COALESCE(jsonb_agg(row_data ORDER BY started_at DESC), '[]'::jsonb) INTO v_rows
  FROM (
    SELECT c.started_at, jsonb_build_object(
      'id', c.id, 'conversation_id', c.conversation_id,
      'student_id', conv.student_id, 'student_name', stu.name,
      'call_type', c.call_type, 'status', c.status,
      'started_at', c.started_at, 'answered_at', c.answered_at, 'ended_at', c.ended_at,
      'caller_id', c.caller_id, 'caller_name', c.caller_name,
      'callee_id', c.callee_id, 'callee_name', c.callee_name,
      'caller_is_student', (c.caller_id = conv.student_id)
    ) AS row_data
    FROM public.calls c
    JOIN public.conversations conv ON conv.id = c.conversation_id
    JOIN public.profiles stu ON stu.id = conv.student_id
    WHERE (p_call_type IS NULL OR c.call_type = p_call_type)
      AND (p_status IS NULL OR c.status = p_status)
      AND (p_search IS NULL OR stu.name ILIKE '%' || p_search || '%')
    ORDER BY c.started_at DESC
    LIMIT GREATEST(p_limit, 0) OFFSET GREATEST(p_offset, 0)
  ) sub;

  RETURN jsonb_build_object('total', v_total, 'calls', v_rows);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_staff_calls(text, text, text, integer, integer) TO authenticated;
