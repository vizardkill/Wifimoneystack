import type { EmailProvider, EmailRequest, EmailResponse } from '@lib/types/_email.types'

/**
 * Interfaz base para proveedores de email
 * Permite implementar diferentes servicios de email de forma agnóstica
 */
export interface IEmailProvider {
  readonly provider: EmailProvider

  /**
   * Envía un email usando el proveedor específico
   */
  sendEmail(request: EmailRequest): Promise<EmailResponse>

  /**
   * Verifica si el proveedor está configurado correctamente
   */
  isConfigured(): boolean

  /**
   * Valida el formato de email
   */
  validateEmail(email: string): boolean

  /**
   * Obtiene información del proveedor
   */
  getProviderInfo(): {
    name: string
    version?: string
    limits?: {
      dailyLimit?: number
      monthlyLimit?: number
      rateLimit?: number
    }
  }
}

/**
 * Clase base abstracta para proveedores de email
 */
export abstract class BaseEmailProvider implements IEmailProvider {
  abstract readonly provider: EmailProvider

  abstract sendEmail(request: EmailRequest): Promise<EmailResponse>

  abstract isConfigured(): boolean

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  abstract getProviderInfo(): {
    name: string
    version?: string
    limits?: {
      dailyLimit?: number
      monthlyLimit?: number
      rateLimit?: number
    }
  }

  /**
   * Crea la respuesta estándar de error
   */
  protected createErrorResponse(error: string): EmailResponse {
    return {
      success: false,
      provider: this.provider,
      error,
      timestamp: new Date()
    }
  }

  /**
   * Crea la respuesta estándar de éxito
   */
  protected createSuccessResponse(messageId?: string): EmailResponse {
    return {
      success: true,
      provider: this.provider,
      messageId,
      timestamp: new Date()
    }
  }
}
