-- ============================================================
-- Migration 030 — Présence scalable + messagerie staff paginée
-- Exécutez dans Supabase > SQL Editor (après la migration 029)
-- ⚠️ Déployez le front EN MÊME TEMPS : la forme de retour de
--    get_staff_conversations change (objet au lieu d'un tableau).
--
-- Problèmes d'échelle corrigés :
--  1. Présence : le canal partagé où CHAQUE apprenante connectée
--     diffusait sa présence à tout le monde (coût N²) est remplacé
--     par un heartbeat en base (user_presence, upsert toutes les
--     2 min côté front). Le canal realtime chat-presence ne sert
--     plus qu'au staff (peu nombreux) pour que le widget apprenante
--     affiche « un membre de l'équipe est en ligne ».
--     « En ligne » = vu il y a moins de 3 minutes.
--  2. Messagerie staff : get_staff_conversations agrégait TOUTES
--     les conversations sans limite. Le RPC devient paginé
--     (limit/offset) avec recherche par nom côté SQL, et renvoie
--     les compteurs (actives/archivées/non-lus totaux) — le badge
--     de la sidebar n'a plus besoin de charger la liste.
-- ============================================================

-- ── 1. Table user_presence (heartbeat) ───────────────────────

CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id      uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_seen_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff lit la presence"           ON public.user_presence;
DROP POLICY IF EXISTS "Chacun cree sa presence"         ON public.user_presence;
DROP POLICY IF EXISTS "Chacun met a jour sa presence"   ON public.user_presence;

CREATE POLICY "Staff lit la presence"
  ON public.user_presence FOR SELECT
  USING (public.get_my_role() IN ('formateur', 'admin'));

CREATE POLICY "Chacun cree sa presence"
  ON public.user_presence FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Chacun met a jour sa presence"
  ON public.user_presence FOR UPDATE
  USING (user_id = auth.uid());

-- ── 2. get_staff_conversations : paginé + recherche + compteurs ──
-- L'ancienne version sans argument doit disparaître (sinon PostgREST
-- ne sait plus quelle surcharge appeler).

DROP FUNCTION IF EXISTS public.get_staff_conversations();

CREATE OR REPLACE FUNCTION public.get_staff_conversations(
  p_archived boolean DEFAULT false,
  p_search   text    DEFAULT NULL,
  p_limit    integer DEFAULT 30,
  p_offset   integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_count   integer;
  v_archived_count integer;
  v_unread_total   integer;
  v_total          integer;
  v_rows           jsonb;
BEGIN
  IF public.get_my_role() NOT IN ('formateur', 'admin') THEN
    RAISE EXCEPTION 'Réservé au staff';
  END IF;

  -- Compteurs d'onglets (toutes conversations non vides).
  SELECT
    count(*) FILTER (WHERE c.archived_at IS NULL),
    count(*) FILTER (WHERE c.archived_at IS NOT NULL)
  INTO v_active_count, v_archived_count
  FROM public.conversations c
  WHERE c.last_message_at IS NOT NULL;

  -- Non-lus totaux de l'appelant (fils actifs) — badge de la sidebar.
  SELECT count(*)
  INTO v_unread_total
  FROM public.chat_messages m
  JOIN public.conversations c ON c.id = m.conversation_id
  LEFT JOIN public.chat_reads r
    ON r.conversation_id = c.id AND r.user_id = auth.uid()
  WHERE c.archived_at IS NULL
    AND m.sender_id <> auth.uid()
    AND m.created_at > COALESCE(r.last_read_at, 'epoch'::timestamptz);

  -- Total correspondant au filtre courant (pour la pagination).
  SELECT count(*)
  INTO v_total
  FROM public.conversations c
  JOIN public.profiles p ON p.id = c.student_id
  WHERE c.last_message_at IS NOT NULL
    AND (CASE WHEN p_archived THEN c.archived_at IS NOT NULL ELSE c.archived_at IS NULL END)
    AND (p_search IS NULL OR p.name ILIKE '%' || p_search || '%');

  -- Page demandée.
  SELECT COALESCE(jsonb_agg(row_data ORDER BY last_message_at DESC), '[]'::jsonb)
  INTO v_rows
  FROM (
    SELECT
      c.last_message_at,
      jsonb_build_object(
        'id',              c.id,
        'student_id',      c.student_id,
        'student_name',    p.name,
        'last_message_at', c.last_message_at,
        'archived',        (c.archived_at IS NOT NULL),
        'online',          COALESCE(up.last_seen_at > now() - interval '3 minutes', false),
        'last_message',    (
          SELECT jsonb_build_object(
                   'body',       m.body,
                   'sender_id',  m.sender_id,
                   'created_at', m.created_at,
                   'audio_path', m.audio_path,
                   'image_path', m.image_path
                 )
          FROM public.chat_messages m
          WHERE m.conversation_id = c.id
            AND NOT EXISTS (
              SELECT 1 FROM public.chat_message_hides h
              WHERE h.message_id = m.id AND h.user_id = auth.uid()
            )
          ORDER BY m.created_at DESC
          LIMIT 1
        ),
        'unread_count',    (
          SELECT count(*)
          FROM public.chat_messages m
          WHERE m.conversation_id = c.id
            AND m.sender_id <> auth.uid()
            AND m.created_at > COALESCE(r.last_read_at, 'epoch'::timestamptz)
        )
      ) AS row_data
    FROM public.conversations c
    JOIN public.profiles p ON p.id = c.student_id
    LEFT JOIN public.chat_reads r
      ON r.conversation_id = c.id AND r.user_id = auth.uid()
    LEFT JOIN public.user_presence up ON up.user_id = c.student_id
    WHERE c.last_message_at IS NOT NULL
      AND (CASE WHEN p_archived THEN c.archived_at IS NOT NULL ELSE c.archived_at IS NULL END)
      AND (p_search IS NULL OR p.name ILIKE '%' || p_search || '%')
    ORDER BY c.last_message_at DESC
    LIMIT GREATEST(p_limit, 0) OFFSET GREATEST(p_offset, 0)
  ) sub;

  RETURN jsonb_build_object(
    'active_count',   v_active_count,
    'archived_count', v_archived_count,
    'unread_total',   v_unread_total,
    'total',          v_total,
    'conversations',  v_rows
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_staff_conversations(boolean, text, integer, integer) TO authenticated;

-- ── 3. Annuaire : pastille « en ligne » depuis le heartbeat ──

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

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id',     p.id,
      'name',   p.name,
      'online', COALESCE(up.last_seen_at > now() - interval '3 minutes', false)
    ) ORDER BY p.name
  ), '[]'::jsonb)
  INTO v_result
  FROM public.profiles p
  LEFT JOIN public.user_presence up ON up.user_id = p.id
  WHERE p.role = 'apprenante';

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_students_directory() TO authenticated;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 030 terminée : présence par heartbeat (user_presence) + messagerie staff paginée avec compteurs.';
END $$;
