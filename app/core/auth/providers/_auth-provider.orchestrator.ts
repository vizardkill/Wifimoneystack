import { trackError } from '@lib/functions/_track_error.function'
import {
  type AuthLinkResult,
  type AuthLoginPayload,
  type AuthProviderType,
  type AuthRefreshResult,
  type AuthRegisterPayload,
  type AuthResult,
  AuthResultStatus,
  type AuthValidationResult,
  type IAuthProvider
} from '@lib/interfaces'

/**
 * Orquestador de autenticación agnóstico
 * Maneja múltiples proveedores de autenticación de forma unificada
 */
export class CLS_AuthOrchestrator {
  private _providers: Map<AuthProviderType, IAuthProvider> = new Map()

  /**
   * Registra un proveedor de autenticación
   * @param provider - Instancia del proveedor
   */
  registerProvider(provider: IAuthProvider): void {
    this._providers.set(provider.providerType, provider)
  }

  /**
   * Obtiene un proveedor específico
   * @param type - Tipo de proveedor
   * @returns IAuthProvider o undefined
   */
  getProvider(type: AuthProviderType): IAuthProvider | undefined {
    return this._providers.get(type)
  }

  /**
   * Lista todos los proveedores registrados
   * @returns Array<AuthProviderType>
   */
  getAvailableProviders(): AuthProviderType[] {
    return Array.from(this._providers.keys())
  }

  /**
   * Registra un usuario usando el proveedor especificado
   * @param payload - Datos de registro
   * @returns Promise<AuthResult>
   */
  async register(payload: AuthRegisterPayload): Promise<AuthResult> {
    try {
      const provider = this.getProvider(payload.provider_type)

      if (!provider) {
        return {
          status: AuthResultStatus.ERROR,
          error: true,
          message: `Proveedor de autenticación '${payload.provider_type}' no disponible`
        }
      }

      return await provider.register(payload)
    } catch (error) {
      trackError({
        method: 'CLS_AuthOrchestrator.register',
        error: error as Error,
        controller: 'CLS_AuthOrchestrator',
        additionalContext: {
          provider_type: payload.provider_type
        }
      })

      return {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Error interno durante el registro'
      }
    }
  }

  /**
   * Autentica un usuario usando el proveedor especificado
   * @param payload - Datos de autenticación
   * @returns Promise<AuthResult>
   */
  async authenticate(payload: AuthLoginPayload): Promise<AuthResult> {
    try {
      const provider = this.getProvider(payload.provider_type)

      if (!provider) {
        return {
          status: AuthResultStatus.ERROR,
          error: true,
          message: `Proveedor de autenticación '${payload.provider_type}' no disponible`
        }
      }

      return await provider.authenticate(payload)
    } catch (error) {
      trackError({
        method: 'CLS_AuthOrchestrator.authenticate',
        error: error as Error,
        controller: 'CLS_AuthOrchestrator',
        additionalContext: {
          provider_type: payload.provider_type
        }
      })

      return {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Error interno durante la autenticación'
      }
    }
  }

  /**
   * Valida un token usando el proveedor especificado
   * @param token - Token a validar
   * @param providerType - Tipo de proveedor
   * @returns Promise<AuthValidationResult>
   */
  async validateToken(token: string, providerType: AuthProviderType): Promise<AuthValidationResult> {
    try {
      const provider = this.getProvider(providerType)

      if (!provider) {
        return {
          valid: false,
          error: `Proveedor de autenticación '${providerType}' no disponible`
        }
      }

      return await provider.validateToken(token)
    } catch (error) {
      trackError({
        method: 'CLS_AuthOrchestrator.validateToken',
        error: error as Error,
        controller: 'CLS_AuthOrchestrator',
        additionalContext: {
          provider_type: providerType
        }
      })

      return {
        valid: false,
        error: 'Error interno durante la validación del token'
      }
    }
  }

  /**
   * Refresca un token usando el proveedor especificado
   * @param refreshToken - Token de refresh
   * @param providerType - Tipo de proveedor
   * @returns Promise<AuthRefreshResult>
   */
  async refreshToken(refreshToken: string, providerType: AuthProviderType): Promise<AuthRefreshResult> {
    try {
      const provider = this.getProvider(providerType)

      if (!provider) {
        return {
          success: false,
          error: `Proveedor de autenticación '${providerType}' no disponible`
        }
      }

      if (!provider.refreshToken) {
        return {
          success: false,
          error: `Proveedor '${providerType}' no soporta refresh de tokens`
        }
      }

      return await provider.refreshToken(refreshToken)
    } catch (error) {
      trackError({
        method: 'CLS_AuthOrchestrator.refreshToken',
        error: error as Error,
        controller: 'CLS_AuthOrchestrator',
        additionalContext: {
          provider_type: providerType
        }
      })

      return {
        success: false,
        error: 'Error interno durante el refresh del token'
      }
    }
  }

  /**
   * Vincula una cuenta existente con un proveedor
   * @param userId - ID del usuario existente
   * @param providerType - Tipo de proveedor
   * @param providerData - Datos del proveedor
   * @returns Promise<AuthLinkResult>
   */
  async linkAccount(userId: string, providerType: AuthProviderType, providerData: Record<string, unknown>): Promise<AuthLinkResult> {
    try {
      const provider = this.getProvider(providerType)

      if (!provider) {
        return {
          success: false,
          message: `Proveedor de autenticación '${providerType}' no disponible`
        }
      }

      if (!provider.linkAccount) {
        return {
          success: false,
          message: `Proveedor '${providerType}' no soporta vinculación de cuentas`
        }
      }

      return await provider.linkAccount(userId, providerData)
    } catch (error) {
      trackError({
        method: 'CLS_AuthOrchestrator.linkAccount',
        error: error as Error,
        controller: 'CLS_AuthOrchestrator',
        additionalContext: {
          provider_type: providerType,
          user_id: userId
        }
      })

      return {
        success: false,
        message: 'Error interno durante la vinculación de cuenta'
      }
    }
  }
}

// Instancia singleton del orquestador
export const authOrchestrator = new CLS_AuthOrchestrator()
