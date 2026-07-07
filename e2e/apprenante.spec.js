import { test, expect } from '@playwright/test'
import { STUDENT, STUDENT_STATE } from './helpers'

/** Parcours apprenante — session pré-établie, tests en lecture seule. */
test.use({ storageState: STUDENT_STATE })

test.describe('Espace apprenante', () => {
  test('le tableau de bord affiche la progression', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: new RegExp(STUDENT.name) })).toBeVisible()
    await expect(page.getByText('Leçons au programme')).toBeVisible()
    await expect(page.getByText('Leçons complétées')).toBeVisible()
  })

  test('le catalogue liste les cours publiés', async ({ page }) => {
    await page.goto('/cours')
    await expect(page.getByRole('heading', { name: 'Catalogue de cours' })).toBeVisible()
    // Au moins une carte de cours (les cours seed sont publiés).
    await expect(page.locator('a[href^="/cours/"]').first()).toBeVisible()
  })

  test('un cours affiche son programme, une leçon se lit', async ({ page }) => {
    await page.goto('/cours')
    await page.locator('a[href^="/cours/"]').first().click()
    await expect(page.getByRole('heading', { name: 'Programme du cours' })).toBeVisible()

    // Ouvre la première leçon accessible (les verrouillées ne sont pas des liens).
    await page.locator('a[href*="/lecons/"]').first().click()
    await expect(page.getByText('min de lecture')).toBeVisible()
    await expect(page.locator('.lesson-content')).toBeVisible()
    // Le pied de validation est présent (complétée, ou bouton avec ses règles).
    await expect(
      page.getByText('Leçon complétée !').or(page.getByText('Vous avez terminé cette leçon ?'))
    ).toBeVisible()
  })

  test('le widget de chat s’ouvre et se ferme', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Ouvrir la discussion avec le support' }).click()
    const dialog = page.getByRole('dialog', { name: 'Discussion avec le support' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('textbox')).toBeVisible()
    await dialog.getByRole('button', { name: 'Fermer la discussion' }).click()
    await expect(dialog).toBeHidden()
  })

  test('la page Mes résultats répond', async ({ page }) => {
    await page.goto('/resultats')
    await expect(page.getByRole('heading', { name: 'Mes résultats' })).toBeVisible()
  })

  test('l’espace formateur est interdit à une apprenante', async ({ page }) => {
    await page.goto('/formateur')
    // ProtectedRoute renvoie vers / puis RootPage redirige selon le rôle.
    await page.waitForURL('**/dashboard')
  })
})
