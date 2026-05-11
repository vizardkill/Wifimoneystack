import * as nodemailer from 'nodemailer'
import type { SendMailOptions, Transporter } from 'nodemailer'

import { BaseEmailProvider } from '@lib/interfaces'
import { EmailProvider, type EmailRequest, type EmailResponse, type SMTPConfig } from '@lib/types/_email.types'

export class SMTPEmailProvider extends BaseEmailProvider {
  readonly provider = EmailProvider.SMTP
  private config: SMTPConfig
  private transporter: Transporter

  constructor(config: SMTPConfig) {
    super()
    this.config = config
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      requireTLS: config.requireTLS ?? false,
      ...(config.clientHostname
        ? {
            name: config.clientHostname
          }
        : {}),
      auth: {
        user: config.user,
        pass: config.pass
      },
      connectionTimeout: config.connectionTimeout ?? 10000
    })
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      const invalidEmails = request.to.filter((addr) => !this.validateEmail(addr.email))
      if (invalidEmails.length > 0) {
        return this.createErrorResponse(`Invalid email addresses: ${invalidEmails.map((e) => e.email).join(', ')}`)
      }

      const payload: SendMailOptions = {
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
              content: a.content,
              contentType: a.contentType
            }))
          })
      }

      const info = await this.transporter.sendMail(payload)
      return this.createSuccessResponse(info.messageId)
    } catch (error) {
      const smtpError = error as Error & {
        code?: string
        responseCode?: number
        response?: string
        command?: string
      }

      const details: string[] = []
      if (smtpError.code) {
        details.push(`code=${smtpError.code}`)
      }
      if (typeof smtpError.responseCode === 'number') {
        details.push(`responseCode=${smtpError.responseCode}`)
      }
      if (smtpError.command) {
        details.push(`command=${smtpError.command}`)
      }
      if (smtpError.response) {
        details.push(`response=${smtpError.response}`)
      }

      const baseMessage = smtpError.message || 'Error desconocido al enviar email con SMTP'
      const errorMessage = details.length > 0 ? `${baseMessage} (${details.join(', ')})` : baseMessage
      return this.createErrorResponse(errorMessage)
    }
  }

  isConfigured(): boolean {
    return this.config.host.length > 0 && this.config.user.length > 0 && this.config.pass.length > 0 && this.config.defaultFromEmail.length > 0
  }

  getProviderInfo(): { name: string; version?: string; limits?: { dailyLimit?: number; monthlyLimit?: number; rateLimit?: number } } {
    return {
      name: 'SMTP',
      version: 'nodemailer',
      limits: {}
    }
  }
}
