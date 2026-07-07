import { test as setup } from '@playwright/test'
import { STUDENT, STAFF, STUDENT_STATE, STAFF_STATE, login } from './helpers'

/**
 * Ouvre une session par rôle et sauvegarde le storage (jeton Supabase en
 * localStorage) : les fichiers de tests démarrent déjà connectés.
 */

setup('session apprenante', async ({ page }) => {
  await login(page, STUDENT)
  await page.waitForURL('**/dashboard')
  await page.context().storageState({ path: STUDENT_STATE })
})

setup('session formateur', async ({ page }) => {
  await login(page, STAFF)
  await page.waitForURL('**/formateur')
  await page.context().storageState({ path: STAFF_STATE })
})
