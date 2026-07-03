// Edge Function : suppression d'un compte utilisateur par un admin.
// Nécessite service_role (jamais exposée côté client) pour appeler
// auth.admin.deleteUser — la suppression cascade sur public.profiles.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { userId } = await req.json()
    if (!userId) return json({ error: 'userId manquant' }, 400)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Non authentifié' }, 401)

    // Client scopé à l'appelant, uniquement pour vérifier son identité et son rôle.
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser()
    if (callerError || !caller) return json({ error: 'Non authentifié' }, 401)

    const { data: role, error: roleError } = await callerClient.rpc('get_my_role')
    if (roleError || role !== 'admin') return json({ error: 'Accès réservé aux administrateurs' }, 403)

    if (caller.id === userId) {
      return json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, 400)
    }

    // Client service_role : seul habilité à supprimer un compte auth.users.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    )

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteError) return json({ error: deleteError.message }, 400)

    return json({ success: true })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erreur inattendue' }, 500)
  }
})
