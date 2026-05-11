import { trackError } from '@lib/functions/_track_error.function'
import { emailService } from '@lib/services/_email.service'

/**
 * Envía un email de verificación usando el sistema agnóstico de email
 * @deprecated Usa emailService.sendVerificationEmail() directamente
 */
export async function sendVerificationEmail(userName: string, email: string, validationUrl: string): Promise<void> {
  const response = await emailService.sendVerificationEmail(userName, email, validationUrl)

  if (!response.success) {
    trackError({
      error: new Error(response.error || 'No se pudo enviar el correo de verificación.'),
      method: 'sendVerificationEmail',
      controller: '_send_email.function',
      additionalContext: {
        userName,
        email,
        provider: response.provider,
        timestamp: response.timestamp.toISOString()
      }
    })
    throw new Error(response.error || 'No se pudo enviar el correo de verificación.')
  }
}

/**
 * Envía un email de restablecimiento de contraseña usando el sistema agnóstico de email
 * @deprecated Usa emailService.sendPasswordResetEmail() directamente
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const response = await emailService.sendPasswordResetEmail(email, resetUrl)

  if (!response.success) {
    trackError({
      error: new Error(response.error || 'No se pudo enviar el correo de restablecimiento de contraseña.'),
      method: 'sendPasswordResetEmail',
      controller: '_send_email.function',
      additionalContext: {
        email,
        provider: response.provider,
        timestamp: response.timestamp.toISOString()
      }
    })
    throw new Error(response.error || 'No se pudo enviar el correo de restablecimiento de contraseña.')
  }
}
