import { test, expect } from '@playwright/test'
import { STAFF_STATE } from './helpers'

/** Parcours formateur — session pré-établie, tests en lecture seule. */
test.use({ storageState: STAFF_STATE })

test.describe('Espace formateur', () => {
  test('le tableau de bord formateur se charge avec sa navigation', async ({ page }) => {
    await page.goto('/formateur')
    await expect(page.getByRole('link', { name: /Messagerie/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Suivi en direct/ })).toBeVisible()
  })

  test('la messagerie staff se charge', async ({ page }) => {
    await page.goto('/formateur/messagerie')
    await expect(page.getByRole('heading', { name: 'Questions des apprenants' })).toBeVisible()
  })

  test('l’espace admin est interdit à un formateur', async ({ page }) => {
    await page.goto('/admin')
    // ProtectedRoute renvoie vers / puis RootPage redirige selon le rôle.
    await page.waitForURL('**/formateur')
  })
})
