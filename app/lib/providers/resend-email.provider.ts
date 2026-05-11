import { Resend } from 'resend'

import { BaseEmailProvider } from '@lib/interfaces'
import type { EmailProvider, EmailRequest, EmailResponse, ResendConfig } from '@lib/types/_email.types'

/**
 * Implementación del proveedor Resend
 */
export class ResendEmailProvider extends BaseEmailProvider {
  readonly provider = 'RESEND' as EmailProvider
  private config: ResendConfig
  private resend: Resend

  constructor(config: ResendConfig) {
    super()
    this.config = config
    this.resend = new Resend(config.apiKey)
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      const invalidEmails = request.to.filter((addr) => !this.validateEmail(addr.email))
      if (invalidEmails.length > 0) {
        return this.createErrorResponse(`Invalid email addresses: ${invalidEmails.map((e) => e.email).join(', ')}`)
      }

      const payload = {
        from: request.from.name ? `${request.from.name} <${request.from.email}>` : request.from.email,
        to: request.to.map((addr) => (addr.name ? `${addr.name} <${addr.email}>` : addr.email)),
        subject: request.content.subject,
        html: request.content.html,
        ...(request.content.text && { text: request.content.text }),
        ...(request.cc &&
          request.cc.length > 0 && {
            cc: request.cc.map((addr) => (addr.name ? `${addr.name} <${addr.email}>` : addr.email))
          }),
        ...(request.bcc &&
          request.bcc.length > 0 && {
            bcc: request.bcc.map((addr) => (addr.name ? `${addr.name} <${addr.email}>` : addr.email))
          }),
        ...(request.attachments &&
          request.attachments.length > 0 && {
            attachments: request.attachments.map((a) => ({
              filename: a.filename,
              content: a.content
            }))
          })
      }

      const { data, error } = await this.resend.emails.send(payload)

      if (error) {
        return this.createErrorResponse(`Error de Resend: ${error.message}`)
      }

      return this.createSuccessResponse(data.id || 'resend-success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al enviar email con Resend'
      return this.createErrorResponse(errorMessage)
    }
  }

  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.defaultFromEmail)
  }

  getProviderInfo(): { name: string; version?: string; limits?: { dailyLimit?: number; monthlyLimit?: number; rateLimit?: number } } {
    return {
      name: 'Resend',
      version: '1.x',
      limits: {
        dailyLimit: 100,
        monthlyLimit: 3000,
        rateLimit: 10
      }
    }
  }
}
