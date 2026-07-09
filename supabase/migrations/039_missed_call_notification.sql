-- ============================================================
-- Migration 039 — Notification « Appel manqué » (élève)
-- Exécutez dans Supabase > SQL Editor (après la migration 038)
--
-- Même mécanisme que trigger_chat_message_notification (migration
-- 017) : trigger AFTER UPDATE sur `calls`, une ligne dans
-- `notifications` quand le statut passe à 'missed' — surfacée par la
-- cloche existante (NotificationBell.jsx, déjà montée pour l'élève).
--
-- Scope volontairement élève uniquement : le staff n'a pas de cloche
-- de notifications (AdminLayout ne monte pas NotificationBell — même
-- raison que pour le chat, cf. commentaire dans 017_chat.sql). Son
-- signal équivalent est déjà le badge de sidebar
-- (useStaffMissedCallsBadge, migrations 036-037) — pas de ligne
-- `notifications` orpheline pour un staff qui n'a rien pour l'afficher.
-- ============================================================

CREATE OR REPLACE FUNCTION public.trigger_missed_call_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_student_id uuid;
BEGIN
  -- Ne réagit qu'à la TRANSITION vers 'missed' (pas à un appel déjà
  -- manqué qu'on retoucherait pour une autre raison).
  IF NEW.status <> 'missed' OR OLD.status <> 'ringing' THEN
    RETURN NEW;
  END IF;

  SELECT student_id INTO v_student_id
  FROM public.conversations WHERE id = NEW.conversation_id;

  -- Un appel étudiante → staff resté sans réponse ne notifie personne
  -- ici (pas de cloche côté staff, voir en-tête).
  IF v_student_id IS NULL OR NEW.caller_id = v_student_id THEN
    RETURN NEW;
  END IF;

  -- Anti-spam : une seule notification d'appel manqué non lue à la
  -- fois (même logique que le chat, migration 017).
  IF EXISTS (
    SELECT 1 FROM public.notifications
    WHERE user_id = v_student_id AND type = 'missed_call' AND read = false
  ) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (
    v_student_id,
    'missed_call',
    'Appel manqué',
    'Vous avez manqué un appel ' || CASE WHEN NEW.call_type = 'video' THEN 'vidéo' ELSE 'audio' END
      || ' de ' || COALESCE(NEW.caller_name, 'l’équipe') || '.',
    '/dashboard?appels=ouvert'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_call_missed_notify ON public.calls;
CREATE TRIGGER on_call_missed_notify
  AFTER UPDATE ON public.calls
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_missed_call_notification();

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 039 terminée : notification "Appel manqué" (élève) branchée.';
END $$;
