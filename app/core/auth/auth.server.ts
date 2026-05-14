import { AuthProviderFactory } from '@/core/auth/providers/_auth-provider.factory'
import { authOrchestrator } from '@/core/auth/providers/_auth-provider.orchestrator'
import { CLS_GoogleProvider } from '@/core/auth/providers/google/google.provider'
import { CLS_ForgotPassword } from '@/core/auth/services/_forgot-password.service'
import { CLS_LinkGoogleAccount } from '@/core/auth/services/_link-google-account.service'
import { CLS_LoginUser } from '@/core/auth/services/_login.service'
import { CLS_ListAdminAccounts, CLS_PromoteUserToAdmin } from '@/core/auth/services/_promote-admin-user.service'
import { CLS_ResendVerificationEmail } from '@/core/auth/services/_resend-verification.service'
import { CLS_ResetPassword } from '@/core/auth/services/_reset-password.service'
import { CLS_RegisterUser } from '@/core/auth/services/_signup.service'
import { CLS_VerifyEmail } from '@/core/auth/services/_verification.service'

import { trackError } from '@lib/functions/_track_error.function'
import { type AuthLoginPayload, AuthProviderType, type AuthRegisterPayload, type AuthResult, type AuthValidationResult } from '@lib/interfaces'

import {
  type CONFIG_FORGOT_PASSWORD,
  type CONFIG_LINK_GOOGLE_ACCOUNT,
  type CONFIG_LIST_ADMIN_ACCOUNTS,
  type CONFIG_LOGIN_USER,
  type CONFIG_PROMOTE_USER_TO_ADMIN,
  type CONFIG_REGISTER_USER,
  type CONFIG_RESET_PASSWORD,
  type CONFIG_VERIFY_EMAIL
} from '@types'

type RegistrationResponse = Pick<AuthResult, 'error' | 'status' | 'data'> | CONFIG_REGISTER_USER.RequestResponse

const ensureMarketplaceAccessRequested = async (response: RegistrationResponse): Promise<void> => {
  const userId = response.data?.user?.id

  if (response.error || typeof userId !== 'string' || userId.length === 0) {
    return
  }

  try {
    const { CLS_RequestMarketplaceAccess } = await import('@/core/marketplace/marketplace.server')
    await new CLS_RequestMarketplaceAccess({ user_id: userId }).main()
  } catch (error) {
    trackError({
      method: 'ensureMarketplaceAccessRequested',
      controller: 'auth-server',
      error: error as Error,
      additionalContext: { user_id: userId }
    })
  }
}

/**
 * Servidor de autenticación principal
 * Exporta controladores agnósticos para usar en rutas
 */
export class AuthServer {
  private static _initialized = false

  /**
   * Inicializa todos los proveedores de autenticación
   */
  static initialize(): void {
    if (this._initialized) {
      return
    }

    const jwtProvider = AuthProviderFactory.getProvider(AuthProviderType.JWT)
    authOrchestrator.registerProvider(jwtProvider)

    const googleProvider = AuthProviderFactory.getProvider(AuthProviderType.GOOGLE)
    authOrchestrator.registerProvider(googleProvider)

    this._initialized = true
  }

  /**
   * Obtiene los proveedores disponibles
   */
  static getAvailableProviders(): AuthProviderType[] {
    this.initialize()
    return authOrchestrator.getAvailableProviders()
  }
}

export const signUpController = async (payload: CONFIG_REGISTER_USER.Payload): Promise<CONFIG_REGISTER_USER.RequestResponse> => {
  const result = new CLS_RegisterUser(payload)
  const response = await result.main()
  await ensureMarketplaceAccessRequested(response)
  return response
}

export const loginController = async (payload: CONFIG_LOGIN_USER.Payload): Promise<CONFIG_LOGIN_USER.RequestResponse> => {
  const result = new CLS_LoginUser(payload)
  const response = await result.main()
  return response
}

export const verifyEmailController = async (token: string): Promise<CONFIG_VERIFY_EMAIL.RequestResponse> => {
  const result = new CLS_VerifyEmail(token)
  const response = await result.main()
  return response
}

export const resendVerificationEmailController = async (email: string): Promise<CONFIG_VERIFY_EMAIL.RequestResponse> => {
  const result = new CLS_ResendVerificationEmail(email)
  const response = await result.main()
  return response
}

export const forgotPasswordController = async (email: string): Promise<CONFIG_FORGOT_PASSWORD.RequestResponse> => {
  const result = new CLS_ForgotPassword(email)
  return result.main()
}

export const resetPasswordController = async (payload: CONFIG_RESET_PASSWORD.Payload): Promise<CONFIG_RESET_PASSWORD.RequestResponse> => {
  const result = new CLS_ResetPassword(payload)
  return result.execute()
}

export const listAdminAccountsController = async (payload: CONFIG_LIST_ADMIN_ACCOUNTS.Payload): Promise<CONFIG_LIST_ADMIN_ACCOUNTS.RequestResponse> => {
  const result = new CLS_ListAdminAccounts(payload)
  return result.main()
}

export const promoteUserToAdminController = async (payload: CONFIG_PROMOTE_USER_TO_ADMIN.Payload): Promise<CONFIG_PROMOTE_USER_TO_ADMIN.RequestResponse> => {
  const result = new CLS_PromoteUserToAdmin(payload)
  return result.main()
}

/**
 * Controlador agnóstico para registro de usuarios
 * @param payload - Datos de registro
 * @returns Promise<AuthResult>
 */
export const registerUserAgnosticController = async (payload: AuthRegisterPayload): Promise<AuthResult> => {
  AuthServer.initialize()
  const response = await authOrchestrator.register(payload)
  await ensureMarketplaceAccessRequested(response)
  return response
}

/**
 * Controlador agnóstico para autenticación de usuarios
 * @param payload - Datos de autenticación
 * @returns Promise<AuthResult>
 */
export const authenticateUserAgnosticController = async (payload: AuthLoginPayload): Promise<AuthResult> => {
  AuthServer.initialize()
  return authOrchestrator.authenticate(payload)
}

/**
 * Controlador agnóstico para validación de tokens
 * @param token - Token a validar
 * @param providerType - Tipo de proveedor
 * @returns Promise<AuthValidationResult>
 */
export const validateTokenAgnosticController = async (token: string, providerType: AuthProviderType): Promise<AuthValidationResult> => {
  AuthServer.initialize()
  return authOrchestrator.validateToken(token, providerType)
}

/**
 * Controlador específico para Google OAuth
 * Genera URL de autorización
 * @param state - Estado para CSRF
 * @returns string - URL de autorización
 */
export const getGoogleAuthUrlController = (state: string): string => {
  AuthServer.initialize()
  const googleProvider = authOrchestrator.getProvider(AuthProviderType.GOOGLE) as CLS_GoogleProvider
  return googleProvider.generateAuthUrl(state)
}

/**
 * Controlador específico para Google OAuth
 * Intercambia código por tokens
 * @param code - Código de autorización
 * @returns Promise<GoogleUserProfile | null>
 */
export const exchangeGoogleCodeController = async (code: string): Promise<unknown> => {
  AuthServer.initialize()
  const googleProvider = authOrchestrator.getProvider(AuthProviderType.GOOGLE) as CLS_GoogleProvider
  return googleProvider.exchangeCodeForTokens(code)
}

/**
 * Controlador para vincular una cuenta de Google a un usuario existente
 * @param payload - Datos de vinculación
 * @returns Promise<AuthResult>
 */
export const linkGoogleAccountController = async (payload: CONFIG_LINK_GOOGLE_ACCOUNT.Payload): Promise<CONFIG_LINK_GOOGLE_ACCOUNT.RequestResponse> => {
  const service = new CLS_LinkGoogleAccount(payload)
  return service.main()
}

// Exportar tipos para uso en otros módulos
export type { AuthProviderType, AuthRegisterPayload, AuthLoginPayload, AuthResult, AuthValidationResult }
export { AuthResultStatus } from '../../lib/interfaces/_auth-provider.interfaces'

// Exportar proveedores específicos si son necesarios
export { CLS_GoogleProvider }

// Exportar orquestador para casos avanzados
export { authOrchestrator }
