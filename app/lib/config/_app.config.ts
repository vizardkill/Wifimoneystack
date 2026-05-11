/**
 * URL pública de la aplicación.
 *
 * Usar APP_URL como única fuente de verdad para construir enlaces en emails
 * (verificación, reseteo de contraseña, etc.).
 *
 * Esto desacopla el bind address del servidor (0.0.0.0 en Cloud Run) del
 * dominio público real.
 *
 * Ejemplos de valor en producción: https://marketplace.wifimoney.com
 * Ejemplos de valor en desarrollo: http://localhost:3000
 */
export function getAppBaseUrl(): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '')
  }

  // Fallback para compatibilidad con la configuración antigua
  const protocol = process.env.HOST_PROTOCOL
  const host = process.env.HOST_NAME
  // HOST_PORT may carry a leading colon (e.g. ":8080") — strip it before appending
  const rawPort = typeof process.env.HOST_PORT === 'string' ? process.env.HOST_PORT.replace(/^:/, '') : ''
  const portSuffix = rawPort ? `:${rawPort}` : ''
  return `${protocol}://${host}${portSuffix}`
}
