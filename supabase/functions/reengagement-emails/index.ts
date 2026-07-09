// Edge Function : relance email des élèves inactives (paliers J+3/J+7/J+14).
// Deux usages, branchés par méthode HTTP :
//  - POST : déclenché par pg_cron (voir migration 041), aucun JWT
//    utilisateur — authentifié par l'en-tête x-cron-secret. Envoie les
//    emails dus (get_students_due_reengagement) via Resend.
//  - GET  : lien de désinscription en un clic depuis l'email (pas de
//    connexion requise) — jeton HMAC(userId) plutôt qu'un vrai jeton de
//    session, vérifié en O(1) sans aller chercher l'utilisateur d'abord.
// verify_jwt = false pour cette fonction (supabase/config.toml) : les deux
// chemins gèrent leur propre authentification, ni l'un ni l'autre n'a de
// JWT Supabase standard à présenter.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function html(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  const bytes = new Uint8Array(sig)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Comparaison à temps constant — évite qu'un attaquant affine un jeton
// faux en mesurant le temps de réponse (peu probable ici, mais gratuit).
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

const MILESTONE_COPY: Record<number, { subject: string; heading: string; body: string }> = {
  3: {
    subject: 'On vous a manqué sur LearnIT !',
    heading: 'Ça fait quelques jours…',
    body: 'Vous avez commencé à progresser sur LearnIT — vos leçons vous attendent exactement là où vous les avez laissées. Reprendre ne prend que quelques minutes.',
  },
  7: {
    subject: 'Une semaine sans vous sur LearnIT',
    heading: 'Vos leçons vous attendent toujours',
    body: 'Ça fait une semaine que vous n’êtes pas passée sur LearnIT. Pas de pression — juste un rappel que votre progression est sauvegardée et prête quand vous voulez vous y remettre.',
  },
  14: {
    subject: 'Dernier rappel : votre place sur LearnIT',
    heading: 'On garde votre progression au chaud',
    body: 'Deux semaines sans nouvelles ! Si vous voulez reprendre l’informatique là où vous en étiez, tout est encore là. Sinon, pas de souci — vous pouvez vous désinscrire de ces rappels ci-dessous.',
  },
}

async function sendReengagementEmails(): Promise<Response> {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')
  const unsubscribeSecret = Deno.env.get('UNSUBSCRIBE_SECRET')
  const functionsUrl = Deno.env.get('SUPABASE_URL')
  const appUrl = Deno.env.get('APP_URL') // ex. https://learnit.fr — domaine de prod de l'app
  if (!resendKey || !fromEmail || !unsubscribeSecret || !functionsUrl || !appUrl) {
    return json({ error: 'Relance email non configurée côté serveur (secrets manquants)' }, 500)
  }

  const supabase = adminClient()
  const { data: due, error } = await supabase.rpc('get_students_due_reengagement')
  if (error) return json({ error: error.message }, 500)

  let sent = 0
  let failed = 0

  for (const student of due ?? []) {
    try {
      const copy = MILESTONE_COPY[student.milestone_days as 3 | 7 | 14]
      const sig = await hmac(unsubscribeSecret, student.user_id)
      const unsubscribeUrl =
        `${functionsUrl}/functions/v1/reengagement-emails?uid=${student.user_id}&sig=${sig}`

      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 20px;">${copy.heading}</h1>
          <p>Bonjour ${student.name ?? ''},</p>
          <p>${copy.body}</p>
          <p><a href="${appUrl}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;">Reprendre sur LearnIT</a></p>
          <p style="font-size: 12px; color: #888; margin-top: 32px;">
            Vous recevez cet email car vous êtes inscrite sur LearnIT.
            <a href="${unsubscribeUrl}">Se désinscrire de ces rappels</a>.
          </p>
        </div>
      `

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: student.email,
          subject: copy.subject,
          html: emailHtml,
        }),
      })
      if (!res.ok) throw new Error(`Resend ${res.status}`)

      const { error: logError } = await supabase.from('reengagement_log').insert({
        user_id: student.user_id,
        milestone_days: student.milestone_days,
        channel: 'email',
      })
      if (logError) throw logError

      sent++
    } catch (err) {
      failed++
      console.error('Échec relance', student.user_id, err instanceof Error ? err.message : err)
    }
  }

  return json({ sent, failed })
}

async function unsubscribe(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const uid = url.searchParams.get('uid')
  const sig = url.searchParams.get('sig')
  const unsubscribeSecret = Deno.env.get('UNSUBSCRIBE_SECRET')

  if (!uid || !sig || !unsubscribeSecret) {
    return html('<p>Lien de désinscription invalide.</p>', 400)
  }

  const expected = await hmac(unsubscribeSecret, uid)
  if (!timingSafeEqual(expected, sig)) {
    return html('<p>Lien de désinscription invalide.</p>', 400)
  }

  const { error } = await adminClient()
    .from('profiles')
    .update({ reengagement_opt_out: true })
    .eq('id', uid)
  if (error) return html('<p>Une erreur est survenue. Réessayez plus tard.</p>', 500)

  return html('<p>Vous êtes désinscrite des emails de relance LearnIT. Vous pouvez fermer cette page.</p>')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (req.method === 'GET') return await unsubscribe(req)

    if (req.method === 'POST') {
      const cronSecret = Deno.env.get('CRON_SECRET')
      const provided = req.headers.get('x-cron-secret')
      if (!cronSecret || !provided || !timingSafeEqual(provided, cronSecret)) {
        return json({ error: 'Non autorisé' }, 401)
      }
      return await sendReengagementEmails()
    }

    return json({ error: 'Méthode non supportée' }, 405)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erreur inattendue' }, 500)
  }
})
