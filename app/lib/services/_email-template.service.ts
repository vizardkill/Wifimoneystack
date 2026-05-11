import { render } from '@react-email/render'

import { PasswordResetTemplate } from '@lib/templates/emails/_reset_pass_email_template'
import { VerifyEmailTemplate } from '@lib/templates/emails/_verify_email_template'
import { WelcomeTemplate } from '@lib/templates/emails/_welcome_email_template'
import { EmailTemplateType } from '@lib/types'
import type { EmailContent, EmailTemplateData, PasswordResetEmailData, VerificationEmailData, WelcomeEmailData } from '@lib/types'

export class EmailTemplateService {
  static async generateEmailContent(type: EmailTemplateType.VERIFICATION, data: VerificationEmailData): Promise<EmailContent>
  static async generateEmailContent(type: EmailTemplateType.PASSWORD_RESET, data: PasswordResetEmailData): Promise<EmailContent>
  static async generateEmailContent(type: EmailTemplateType.WELCOME, data: WelcomeEmailData): Promise<EmailContent>
  // General overload for callers with runtime-dynamic types (e.g. sendTemplatedEmail)
  static async generateEmailContent(type: EmailTemplateType, data: EmailTemplateData): Promise<EmailContent>
  static async generateEmailContent(type: EmailTemplateType, data: EmailTemplateData): Promise<EmailContent> {
    switch (type) {
      case EmailTemplateType.VERIFICATION:
        return EmailTemplateService.generateVerificationEmail(data as VerificationEmailData)
      case EmailTemplateType.PASSWORD_RESET:
        return EmailTemplateService.generatePasswordResetEmail(data as PasswordResetEmailData)
      case EmailTemplateType.WELCOME:
        return EmailTemplateService.generateWelcomeEmail(data as WelcomeEmailData)
      default:
        throw new Error(`Tipo de plantilla no soportado: ${String(type)}`)
    }
  }

  private static async generateVerificationEmail(data: VerificationEmailData): Promise<EmailContent> {
    const html = await render(
      VerifyEmailTemplate({
        userName: data.userName,
        validationUrl: data.validationUrl
      })
    )

    const text = `¡Hola ${data.userName}! Gracias por registrarte. Visita ${data.validationUrl} para verificar tu cuenta.`

    return {
      subject: 'Confirma tu correo electrónico - WMC Marketplace',
      html,
      text
    }
  }

  private static async generatePasswordResetEmail(data: PasswordResetEmailData): Promise<EmailContent> {
    const html = await render(
      PasswordResetTemplate({
        resetUrl: data.resetUrl
      })
    )

    const text = `Restablece tu contraseña visitando: ${data.resetUrl}`

    return {
      subject: 'Restablece tu contraseña - WMC Marketplace',
      html,
      text
    }
  }

  private static async generateWelcomeEmail(data: WelcomeEmailData): Promise<EmailContent> {
    const html = await render(
      WelcomeTemplate({
        userName: data.userName,
        dashboardUrl: data.dashboardUrl
      })
    )

    const text = `¡Bienvenido ${data.userName}! Tu cuenta ha sido verificada. Accede a tu dashboard: ${data.dashboardUrl}`

    return {
      subject: '¡Bienvenido al Marketplace!',
      html,
      text
    }
  }
}
