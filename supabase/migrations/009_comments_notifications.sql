-- ============================================================
-- Migration 009 — Commentaires + Notifications
-- Exécutez dans Supabase > SQL Editor
-- ============================================================

-- ── 1. Commentaires ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id  uuid REFERENCES public.lessons(id)  ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES auth.users(id)       ON DELETE CASCADE NOT NULL,
  parent_id  uuid REFERENCES public.comments(id)  ON DELETE CASCADE,
  content    text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_lesson_idx ON public.comments(lesson_id);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON public.comments(parent_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Commentaires visibles par tous les connectes" ON public.comments;
DROP POLICY IF EXISTS "Utilisateur peut poster un commentaire"        ON public.comments;
DROP POLICY IF EXISTS "Utilisateur peut supprimer son commentaire"    ON public.comments;

CREATE POLICY "Commentaires visibles par tous les connectes"
  ON public.comments FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Utilisateur peut poster un commentaire"
  ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur peut supprimer son commentaire"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id OR get_my_role() IN ('formateur', 'admin'));

-- ── 2. Notifications ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type       text NOT NULL,     -- badge | comment_reply | new_course
  title      text NOT NULL,
  body       text,
  link       text,
  read       boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Utilisateur voit ses propres notifications"      ON public.notifications;
DROP POLICY IF EXISTS "Utilisateur peut marquer ses notifications lues" ON public.notifications;

CREATE POLICY "Utilisateur voit ses propres notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur peut marquer ses notifications lues"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ── 3. Realtime ──────────────────────────────────────────────

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  RAISE NOTICE 'comments ajoutee a supabase_realtime';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'comments deja dans supabase_realtime';
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  RAISE NOTICE 'notifications ajoutee a supabase_realtime';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'notifications deja dans supabase_realtime';
END $$;

-- ── 4. Trigger : badge obtenu → notification ─────────────────

CREATE OR REPLACE FUNCTION public.trigger_badge_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_badge public.badges%ROWTYPE;
BEGIN
  SELECT * INTO v_badge FROM public.badges WHERE id = NEW.badge_id;
  IF v_badge.id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.notifications(user_id, type, title, body, link)
  VALUES (
    NEW.user_id,
    'badge',
    'Nouveau badge : ' || v_badge.name,
    v_badge.description,
    '/dashboard'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_badge_awarded_notify ON public.user_badges;
CREATE TRIGGER on_badge_awarded_notify
  AFTER INSERT ON public.user_badges
  FOR EACH ROW EXECUTE FUNCTION public.trigger_badge_notification();

-- ── 5. Trigger : réponse commentaire → notification ──────────

CREATE OR REPLACE FUNCTION public.trigger_comment_reply_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_parent_user_id uuid;
  v_replier_name   text;
  v_course_id      uuid;
BEGIN
  IF NEW.parent_id IS NULL THEN RETURN NEW; END IF;

  SELECT user_id INTO v_parent_user_id
  FROM public.comments WHERE id = NEW.parent_id;

  -- Pas de notification si on répond à soi-même
  IF v_parent_user_id = NEW.user_id THEN RETURN NEW; END IF;

  SELECT name INTO v_replier_name FROM public.profiles WHERE id = NEW.user_id;

  SELECT course_id INTO v_course_id FROM public.lessons WHERE id = NEW.lesson_id;

  INSERT INTO public.notifications(user_id, type, title, body, link)
  VALUES (
    v_parent_user_id,
    'comment_reply',
    COALESCE(v_replier_name, 'Quelqu''un') || ' a repondu a votre commentaire',
    LEFT(NEW.content, 120),
    '/cours/' || v_course_id || '/lecons/' || NEW.lesson_id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_comment_reply_notify ON public.comments;
CREATE TRIGGER on_comment_reply_notify
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.trigger_comment_reply_notification();
