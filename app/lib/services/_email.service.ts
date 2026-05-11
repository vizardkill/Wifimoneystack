import { EMAIL_CONFIG, getAvailableEmailProvider, getEmailProviderConfig } from '@lib/config'
import { trackError } from '@lib/functions/_track_error.function'
import type { IEmailProvider } from '@lib/interfaces'
import { ResendEmailProvider, SESEmailProvider, SMTPEmailProvider } from '@lib/providers'
import { EmailTemplateService } from '@lib/services/_email-template.service'
import type {
  EmailAddress,
  EmailRequest,
  EmailResponse,
  EmailTemplateData,
  PasswordResetEmailData,
  ResendConfig,
  SESConfig,
  SMTPConfig,
  VerificationEmailData
} from '@lib/types'
import { EmailProvider, EmailTemplateType } from '@lib/types'

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isSESConfig = (value: unknown): value is SESConfig => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.region === 'string' &&
    typeof value.accessKeyId === 'string' &&
    typeof value.secretAccessKey === 'string' &&
    typeof value.defaultFromEmail === 'string'
  )
}

const isResendConfig = (value: unknown): value is ResendConfig => {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.apiKey === 'string' && typeof value.defaultFromEmail === 'string'
}

const isSMTPConfig = (value: unknown): value is SMTPConfig => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.host === 'string' &&
    typeof value.port === 'number' &&
    typeof value.user === 'string' &&
    typeof value.pass === 'string' &&
    typeof value.secure === 'boolean' &&
    typeof value.requireTLS === 'boolean' &&
    typeof value.connectionTimeout === 'number' &&
    typeof value.defaultFromEmail === 'string'
  )
}

/**
 * Servicio agnóstico de email que maneja múltiples proveedores
 */
export class CLS_EmailService {
  private providers: Map<EmailProvider, IEmailProvider> = new Map()
  private currentProvider: EmailProvider

  constructor() {
    this.initializeProviders()
    this.currentProvider = getAvailableEmailProvider()
  }

  /**
   * Inicializa todos los proveedores disponibles
   */
  private initializeProviders(): void {
    try {
      const smtpConfig = getEmailProviderConfig(EmailProvider.SMTP)
      if (smtpConfig.isEnabled && isSMTPConfig(smtpConfig.config)) {
        this.providers.set(EmailProvider.SMTP, new SMTPEmailProvider(smtpConfig.config))
      }
    } catch (error) {
      trackError({
        error: error as Error,
        method: 'CLS_EmailService.initializeProviders',
        controller: '_email.service',
        additionalContext: {
          provider: EmailProvider.SMTP
        }
      })
    }

    try {
      const sesConfig = getEmailProviderConfig(EmailProvider.SES)
      if (sesConfig.isEnabled && isSESConfig(sesConfig.config)) {
        this.providers.set(EmailProvider.SES, new SESEmailProvider(sesConfig.config))
      }
    } catch (error) {
      trackError({
        error: error as Error,
        method: 'CLS_EmailService.initializeProviders',
        controller: '_email.service',
        additionalContext: {
          provider: EmailProvider.SES
        }
      })
    }

    try {
      const resendConfig = getEmailProviderConfig(EmailProvider.RESEND)
      if (resendConfig.isEnabled && isResendConfig(resendConfig.config)) {
        this.providers.set(EmailProvider.RESEND, new ResendEmailProvider(resendConfig.config))
      }
    } catch (error) {
      trackError({
        error: error as Error,
        method: 'CLS_EmailService.initializeProviders',
        controller: '_email.service',
        additionalContext: {
          provider: EmailProvider.RESEND
        }
      })
    }

    if (this.providers.size === 0) {
      throw new Error('📨 [EMAIL] No email providers are available or properly configured')
    }
  }

  /**
   * Envía un email usando el proveedor configurado con fallback automático
   */
  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    let lastError: string = ''

    const primaryProvider = this.providers.get(this.currentProvider)
    if (primaryProvider) {
      try {
        const response = await this.sendWithRetry(primaryProvider, request)
        if (response.success) {
          return response
        }

        trackError({
          error: new Error(response.error || 'Fallo del proveedor primario de email'),
          method: 'CLS_EmailService.sendEmail',
          controller: '_email.service',
          title: `Fallo del proveedor primario (${this.currentProvider})`,
          description: response.error || 'El proveedor devolvió success=false en sendWithRetry',
          additionalContext: {
            provider: this.currentProvider,
            phase: 'primary-provider-response',
            providerError: response.error || 'Error desconocido',
            to: request.to.map((addr) => addr.email),
            from: request.from.email
          }
        })
        lastError = response.error || 'Error desconocido'
      } catch (error) {
        trackError({
          error: error as Error,
          method: 'CLS_EmailService.sendEmail',
          controller: '_email.service',
          additionalContext: {
            provider: this.currentProvider,
            to: request.to.map((addr) => addr.email),
            from: request.from.email
          }
        })
        lastError = error instanceof Error ? error.message : 'Error desconocido'
      }
    }

    if (EMAIL_CONFIG.enableFallback) {
      for (const [providerName, provider] of this.providers) {
        if (providerName === this.currentProvider) {
          continue
        }

        try {
          const response = await this.sendWithRetry(provider, request)
          if (response.success) {
            return response
          }
          lastError = response.error || 'Error desconocido'
        } catch (error) {
          trackError({
            error: error as Error,
            method: 'CLS_EmailService.sendEmail',
            controller: '_email.service',
            additionalContext: {
              fallbackProvider: providerName,
              primaryProvider: this.currentProvider,
              to: request.to.map((addr) => addr.email)
            }
          })
          lastError = error instanceof Error ? error.message : 'Error desconocido'
        }
      }
    }

    return {
      success: false,
      provider: this.currentProvider,
      error: `Todos los proveedores de email fallaron. Último error: ${lastError}`,
      timestamp: new Date()
    }
  }

  /**
   * Envía un email usando una plantilla predefinida
   */
  async sendTemplatedEmail(templateType: EmailTemplateType, templateData: EmailTemplateData, to: EmailAddress[], from?: EmailAddress): Promise<EmailResponse> {
    try {
      const content = await EmailTemplateService.generateEmailContent(templateType, templateData)

      const fromAddress: EmailAddress = from ?? {
        email: EMAIL_CONFIG.defaultFromEmail,
        name: EMAIL_CONFIG.defaultFromName
      }

      const request: EmailRequest = {
        from: fromAddress,
        to,
        content,
        templateType,
        templateData
      }

      return this.sendEmail(request)
    } catch (error) {
      trackError({
        error: error as Error,
        method: 'CLS_EmailService.sendTemplatedEmail',
        controller: '_email.service',
        additionalContext: {
          templateType,
          toEmails: to.map((addr) => addr.email),
          fromEmail: from?.email || EMAIL_CONFIG.defaultFromEmail
        }
      })
      const errorMessage = error instanceof Error ? error.message : 'Error al generar plantilla de email'
      return {
        success: false,
        provider: this.currentProvider,
        error: errorMessage,
        timestamp: new Date()
      }
    }
  }

  /**
   * Envía email de verificación (método de conveniencia)
   */
  async sendVerificationEmail(userName: string, email: string, validationUrl: string): Promise<EmailResponse> {
    const templateData: VerificationEmailData = {
      userName,
      validationUrl
    }

    return this.sendTemplatedEmail(EmailTemplateType.VERIFICATION, templateData, [{ email }])
  }

  /**
   * Envía email de restablecimiento de contraseña (método de conveniencia)
   */
  async sendPasswordResetEmail(email: string, resetUrl: string, userName?: string): Promise<EmailResponse> {
    const templateData: PasswordResetEmailData = {
      resetUrl,
      userName
    }

    return this.sendTemplatedEmail(EmailTemplateType.PASSWORD_RESET, templateData, [{ email }])
  }

  /**
   * Envía un email con reintentos
   */
  private async sendWithRetry(provider: IEmailProvider, request: EmailRequest): Promise<EmailResponse> {
    let lastError: string = ''

    for (let attempt = 1; attempt <= EMAIL_CONFIG.maxRetries; attempt++) {
      try {
        const response = await provider.sendEmail(request)
        if (response.success) {
          return response
        }
        lastError = response.error || 'Error desconocido'

        if (attempt < EMAIL_CONFIG.maxRetries) {
          await this.wait(EMAIL_CONFIG.retryDelay * attempt)
        }
      } catch (error) {
        trackError({
          error: error as Error,
          method: 'CLS_EmailService.sendWithRetry',
          controller: '_email.service',
          additionalContext: {
            provider: provider.provider,
            attempt,
            maxRetries: EMAIL_CONFIG.maxRetries,
            to: request.to.map((addr) => addr.email)
          }
        })
        lastError = error instanceof Error ? error.message : 'Error desconocido'

        if (attempt < EMAIL_CONFIG.maxRetries) {
          await this.wait(EMAIL_CONFIG.retryDelay * attempt)
        }
      }
    }

    return {
      success: false,
      provider: provider.provider,
      error: `Falló después de ${EMAIL_CONFIG.maxRetries} intentos. Último error: ${lastError}`,
      timestamp: new Date()
    }
  }

  /**
   * Espera un tiempo determinado
   */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Obtiene información de todos los proveedores disponibles
   */
  getProvidersInfo(): Array<{ provider: EmailProvider; info: ReturnType<IEmailProvider['getProviderInfo']>; isActive: boolean }> {
    return Array.from(this.providers.entries()).map(([providerName, provider]) => ({
      provider: providerName,
      info: provider.getProviderInfo(),
      isActive: providerName === this.currentProvider
    }))
  }

  /**
   * Cambia el proveedor activo
   */
  switchProvider(provider: EmailProvider): boolean {
    if (this.providers.has(provider)) {
      this.currentProvider = provider
      return true
    }
    return false
  }

  /**
   * Verifica si un proveedor está disponible
   */
  isProviderAvailable(provider: EmailProvider): boolean {
    return this.providers.has(provider) && this.providers.get(provider)!.isConfigured()
  }
}

// Instancia singleton del servicio de email
export const emailService = new CLS_EmailService()
