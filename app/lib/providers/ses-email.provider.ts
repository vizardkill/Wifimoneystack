import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'

import { BaseEmailProvider } from '@lib/interfaces'
import type { EmailProvider, EmailRequest, EmailResponse, SESConfig } from '@lib/types'

/**
 * Implementación del proveedor AWS SES
 */
export class SESEmailProvider extends BaseEmailProvider {
  readonly provider = 'SES' as EmailProvider
  private sesClient: SESClient
  private config: SESConfig

  constructor(config: SESConfig) {
    super()
    this.config = config
    this.sesClient = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    })
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      const invalidEmails = request.to.filter((addr) => !this.validateEmail(addr.email))
      if (invalidEmails.length > 0) {
        return this.createErrorResponse(`Invalid email addresses: ${invalidEmails.map((e) => e.email).join(', ')}`)
      }

      const params = {
        Source: request.from.name ? `${request.from.name} <${request.from.email}>` : request.from.email,
        Destination: {
          ToAddresses: request.to.map((addr) => (addr.name ? `${addr.name} <${addr.email}>` : addr.email)),
          ...(request.cc &&
            request.cc.length > 0 && {
              CcAddresses: request.cc.map((addr) => (addr.name ? `${addr.name} <${addr.email}>` : addr.email))
            }),
          ...(request.bcc &&
            request.bcc.length > 0 && {
              BccAddresses: request.bcc.map((addr) => (addr.name ? `${addr.name} <${addr.email}>` : addr.email))
            })
        },
        Message: {
          Subject: {
            Data: request.content.subject
          },
          Body: {
            Html: {
              Data: request.content.html
            },
            ...(request.content.text && {
              Text: {
                Data: request.content.text
              }
            })
          }
        }
      }

      const command = new SendEmailCommand(params)
      const result = await this.sesClient.send(command)

      return this.createSuccessResponse(result.MessageId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al enviar email con SES'
      return this.createErrorResponse(errorMessage)
    }
  }

  isConfigured(): boolean {
    return !!(this.config.accessKeyId && this.config.secretAccessKey && this.config.region && this.config.defaultFromEmail)
  }

  getProviderInfo(): { name: string; version?: string; limits?: { dailyLimit?: number; monthlyLimit?: number; rateLimit?: number } } {
    return {
      name: 'Amazon SES',
      version: '3.x',
      limits: {
        dailyLimit: 200,
        rateLimit: 1
      }
    }
  }
}
