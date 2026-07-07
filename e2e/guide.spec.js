import { test, expect } from '@playwright/test'

/** Guide d'utilisation — page publique, sans session. */
test.describe("Guide d'utilisation", () => {
  test("accessible depuis l'accueil, sommaire fonctionnel", async ({ page }) => {
    await page.goto('/')
    await page.getByRole('banner').getByRole('link', { name: "Guide d'utilisation" }).click()
    await expect(page.getByRole('heading', { name: /Bien démarrer/ })).toBeVisible()

    // Le sommaire ancre vers l'étape correspondante.
    await page.getByRole('link', { name: 'Créez votre compte' }).click()
    await expect(page.getByRole('heading', { name: 'Créez votre compte' })).toBeVisible()

    // Le CTA final propose l'inscription.
    await expect(page.getByRole('link', { name: /Créer mon compte/ })).toBeVisible()
  })
})
