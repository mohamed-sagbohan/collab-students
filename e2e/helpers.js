/** Comptes de test dédiés — créés par supabase/create_test_users.sql. */
export const STUDENT = { email: 'etudiant@learnit.fr', password: 'Etudiant1234!', name: 'Marie Dupont' }
export const STAFF = { email: 'formateur@learnit.fr', password: 'Formateur1234!', name: 'Jean Martin' }

export const STUDENT_STATE = 'e2e/.auth/student.json'
export const STAFF_STATE = 'e2e/.auth/staff.json'

/** Remplit et soumet le formulaire de connexion. */
export async function login(page, { email, password }) {
  await page.goto('/login')
  await page.getByLabel('Adresse email').fill(email)
  await page.getByLabel('Mot de passe').fill(password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
}
