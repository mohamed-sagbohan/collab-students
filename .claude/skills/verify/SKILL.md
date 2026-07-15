---
name: verify
description: Recette de vérification runtime de l'app (SPA Vite + React + Supabase déployée sur Vercel)
---

# Vérifier un changement dans collab-students

## Build + lancement

```powershell
npm run build          # ~25 s ; génère aussi le service worker PWA (dist/sw.js)
npm run preview        # sert dist/ sur http://localhost:4173 (lancer en arrière-plan)
```

## Piloter l'app

Pas de dépendance à installer : `playwright-core` est déjà là (via `@playwright/test`).
Écrire un script `.mjs` jetable **à la racine du projet** (pas dans le scratchpad,
sinon l'import de `playwright-core` ne se résout pas), le lancer avec `node`, le
supprimer après.

```js
import { chromium } from 'playwright-core'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:4173/', { waitUntil: 'load' })
```

## Pièges connus

- **Jamais `waitUntil: 'networkidle'`** : le widget Turnstile (Cloudflare) sur
  /login maintient le réseau actif en permanence → timeout garanti. Utiliser
  `'load'` + `page.waitForTimeout(...)` pour laisser React hydrater.
- **Impossible de se connecter en local/e2e** : le CAPTCHA Turnstile est actif
  en prod et bloque les logins automatisés (voulu). Vérifier les parcours
  connectés autrement (lecture du code + parcours anonyme).
- Les en-têtes de `vercel.json` (CSP, X-Robots-Tag…) ne sont **pas** appliqués
  par `vite preview` — valider le JSON, tester les en-têtes en prod après deploy.
- `vite preview` sert `dist/` : rebuilder avant de re-vérifier un changement.
- Les e2e Playwright officiels : `npm run test:e2e` (mais c'est le rôle de CI,
  pas de la vérification runtime).
