// Edge Function : identifiants TURN Cloudflare à durée de vie limitée.
// Le secret de l'App Cloudflare Realtime (CLOUDFLARE_TURN_APP_SECRET)
// n'existe QUE côté serveur (secret Supabase) — jamais dans le bundle
// front. Tout utilisateur authentifié (apprenante ou staff) peut en
// demander, un appel se faisant toujours entre les deux.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// 4h : largement au-delà de la durée d'un appel réel, tout en restant
// un identifiant à courte durée de vie (pas un secret permanent exposé).
const TTL_SECONDS = 4 * 60 * 60

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Non authentifié' }, 401)

    // Vérifie uniquement qu'il s'agit d'une session valide — pas de
    // restriction de rôle, apprenante et staff appellent l'un l'autre.
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user }, error: authError } = await callerClient.auth.getUser()
    if (authError || !user) return json({ error: 'Non authentifié' }, 401)

    const appId = Deno.env.get('CLOUDFLARE_TURN_APP_ID')
    const appSecret = Deno.env.get('CLOUDFLARE_TURN_APP_SECRET')
    if (!appId || !appSecret) return json({ error: 'TURN non configuré côté serveur' }, 500)

    const cfRes = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${appId}/credentials/generate`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${appSecret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttl: TTL_SECONDS }),
      },
    )
    if (!cfRes.ok) {
      return json({ error: `Cloudflare TURN : ${cfRes.status}` }, 502)
    }
    const { iceServers } = await cfRes.json()
    return json({ iceServers })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erreur inattendue' }, 500)
  }
})
