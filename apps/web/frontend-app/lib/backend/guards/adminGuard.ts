/**
 * Guard de administrador para la ruta /analytics.
 *
 * Para probar localmente, usa el email: admin@fluxy.dev
 * En producción, reemplaza o agrega tu email real a ADMIN_EMAILS.
 */
export const ADMIN_EMAILS = [
  'admin@fluxy.dev', // Email de prueba — remover en producción
]

/**
 * Verifica si el email pertenece a un administrador de Fluxy.
 * @param email - Email del usuario autenticado (de Supabase)
 */
export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
