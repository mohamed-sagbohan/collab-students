import { supabase } from './supabase'

/**
 * Cycle de vie sûr d'un canal realtime — règle : UN topic = UN canal.
 *
 * Depuis supabase-js 2.110, `supabase.channel(topic)` renvoie l'instance
 * EXISTANTE si le topic est déjà occupé (avant : une instance neuve à
 * chaque appel). Deux pièges mortels en découlent :
 *
 *  1. Si l'instance existante est déjà souscrite, tout
 *     `.on('postgres_changes' | 'presence')` jette
 *     « cannot add … after subscribe() » et `.subscribe()` jette
 *     « tried to subscribe multiple times » — c'était le crash
 *     « Unexpected Application Error! » au rechargement, quand deux
 *     composants (widget chat + widget appels) montaient le même topic.
 *
 *  2. Le retrait d'un canal (`removeChannel`) est ASYNCHRONE : le leave
 *     attend la réponse du serveur, puis purge la liste interne PAR TOPIC
 *     (pas par identité). Créer un canal pendant qu'un homonyme se démonte
 *     fait donc éjecter le canal neuf de la liste au retour du leave.
 *
 * La seule séquence sûre : attendre la fin du démontage de tout homonyme,
 * PUIS créer + binder + souscrire d'un seul tenant. C'est ce que fait
 * acquireChannel. Chaque topic de l'appli doit avoir UN seul propriétaire
 * monté à la fois (un résiduel du même topic est traité comme mourant et
 * retiré) ; pour partager un canal entre composants, passer par un
 * singleton compté par référence (voir useChatPresence).
 *
 * @param {string} topic  Nom du canal (sans le préfixe `realtime:`).
 * @param {object} [config] Config passée à supabase.channel().
 * @param {(channel) => void} bind Ajoute TOUS les bindings (appelé juste avant subscribe).
 * @param {(status: string) => void} [onStatus] Callback de statut de subscribe().
 * @returns {{ getChannel: () => object|null, send: (msg) => Promise, remove: () => void }}
 */
export function acquireChannel(topic, config, bind, onStatus) {
  let channel = null
  let removed = false

  const ready = (async () => {
    // Attend le démontage de toute instance résiduelle du même topic
    // (removeChannel d'un montage précédent encore en vol).
    const stale = supabase.getChannels().filter((c) => c.topic === `realtime:${topic}`)
    await Promise.all(stale.map((c) => supabase.removeChannel(c).catch(() => {})))
    // Les canaux privés exigent un jeton realtime à jour ; inoffensif
    // pour les canaux publics.
    try {
      await supabase.realtime.setAuth()
    } catch { /* le subscribe échouera avec un statut explicite */ }
    if (removed) return
    channel = supabase.channel(topic, config)
    bind(channel)
    channel.subscribe(onStatus)
  })()

  return {
    /** Le canal n'existe qu'une fois la séquence d'acquisition finie —
        les appels précoces reçoivent null (à ignorer). */
    getChannel: () => channel,
    /** Envoi broadcast tolérant : ignoré tant que le canal n'est pas prêt. */
    send: (msg) => (channel ? channel.send(msg) : Promise.resolve('error')),
    remove: () => {
      removed = true
      void ready.then(() => {
        if (channel) {
          void supabase.removeChannel(channel)
          channel = null
        }
      })
    },
  }
}
