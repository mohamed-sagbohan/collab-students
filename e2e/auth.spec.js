import { test, expect } from '@playwright/test'
import { STUDENT } from './helpers'

/** Parcours de connexion — toujours SANS session préexistante. */
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Connexion', () => {
  test("la page de connexion s'affiche", async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Bon retour !' })).toBeVisible()
    await expect(page.getByLabel('Adresse email')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible()
  })

  test('identifiants invalides → message d’erreur', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Adresse email').fill('inconnu@learnit.fr')
    await page.getByLabel('Mot de passe').fill('mauvais-mot-de-passe')
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page.getByRole('alert')).toContainText('Email ou mot de passe incorrect')
  })

  test('connexion apprenante → tableau de bord', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Adresse email').fill(STUDENT.email)
    await page.getByLabel('Mot de passe').fill(STUDENT.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await page.waitForURL('**/dashboard')
    await expect(page.getByRole('heading', { name: new RegExp(STUDENT.name) })).toBeVisible()
  })

  test('un visiteur non connecté est renvoyé vers /login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login')
    await expect(page.getByRole('heading', { name: 'Bon retour !' })).toBeVisible()
  })
})
