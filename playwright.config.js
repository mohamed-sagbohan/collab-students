import { defineConfig, devices } from '@playwright/test'

/**
 * Tests E2E des parcours critiques (connexion, apprentissage, staff).
 *
 * Les tests tournent contre le serveur Vite local (démarré automatiquement)
 * et la base Supabase du .env, avec les comptes de test dédiés
 * (supabase/create_test_users.sql). Ils sont conçus pour être quasi
 * exclusivement en LECTURE : pas d'envoi de message, pas de soumission de
 * quiz, pas de validation de leçon — rien qui pollue les données.
 *
 *   npm run test:e2e        → lance tous les tests (headless)
 *   npm run test:e2e:ui     → mode interactif pour déboguer
 */
export default defineConfig({
  testDir: './e2e',
  // Comptes de test partagés entre fichiers : on sérialise pour éviter
  // les interférences (marquage de notifications, curseurs de lecture…).
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  timeout: 45_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    locale: 'fr-FR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    // Ouvre une session par rôle et la sauvegarde (e2e/.auth/*.json) :
    // les autres tests démarrent déjà connectés, sans re-login.
    { name: 'setup', testMatch: /auth\.setup\.js/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
})
