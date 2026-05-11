import { type User } from '@prisma/client'

/**
 * Interface común para todos los proveedores de autenticación
 * Permite agregar nuevos proveedores sin romper el código existente
 */
export interface IAuthProvider {
  /**
   * Tipo de proveedor de autenticación
   */
  readonly providerType: AuthProviderType

  /**
   * Registra un nuevo usuario usando este proveedor
   * @param payload - Datos del usuario para registro
   * @returns Promise<AuthResult>
   */
  register(payload: AuthRegisterPayload): Promise<AuthResult>

  /**
   * Autentica un usuario existente usando este proveedor
   * @param payload - Datos de autenticación
   * @returns Promise<AuthResult>
   */
  authenticate(payload: AuthLoginPayload): Promise<AuthResult>

  /**
   * Valida un token o credencial de este proveedor
   * @param token - Token a validar
   * @returns Promise<AuthValidationResult>
   */
  validateToken(token: string): Promise<AuthValidationResult>

  /**
   * Refresca un token si es necesario
   * @param refreshToken - Token de refresh
   * @returns Promise<AuthRefreshResult>
   */
  refreshToken?(refreshToken: string): Promise<AuthRefreshResult>

  /**
   * Vincula una cuenta existente con este proveedor
   * @param userId - ID del usuario existente
   * @param providerData - Datos del proveedor
   * @returns Promise<AuthLinkResult>
   */
  linkAccount?(userId: string, providerData: unknown): Promise<AuthLinkResult>
}

/**
 * Tipos de proveedores de autenticación soportados
 */
export enum AuthProviderType {
  JWT = 'jwt',
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  FACEBOOK = 'facebook',
  APPLE = 'apple'
}

/**
 * Estados de resultado de autenticación
 */
export enum AuthResultStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PENDING_VERIFICATION = 'pending_verification',
  PARTIAL_SUCCESS = 'partial_success', // Cuenta creada pero falló envío de email
  REQUIRES_MFA = 'requires_mfa'
}

/**
 * Payload base para registro
 */
export interface AuthRegisterPayload {
  first_name: string
  last_name: string
  email: string
  country_id: string
  provider_type: AuthProviderType
  provider_data?: unknown // Datos específicos del proveedor
}

/**
 * Payload base para login
 */
export interface AuthLoginPayload {
  email?: string
  provider_type: AuthProviderType
  provider_data?: unknown // Datos específicos del proveedor (OAuth tokens, etc.)
}

/**
 * Resultado de operaciones de autenticación
 */
export interface AuthResult {
  status: AuthResultStatus
  error: boolean
  message: string
  field?: string
  suggestion?: string
  data?: {
    user?: Partial<User>
    token?: string
    refresh_token?: string
    expires_in?: number
    provider_data?: unknown
  }
}

/**
 * Resultado de validación de token
 */
export interface AuthValidationResult {
  valid: boolean
  user?: Partial<User>
  error?: string
  expires_at?: Date
}

/**
 * Resultado de refresh de token
 */
export interface AuthRefreshResult {
  success: boolean
  token?: string
  expires_in?: number
  error?: string
}

/**
 * Resultado de vinculación de cuenta
 */
export interface AuthLinkResult {
  success: boolean
  message: string
  error?: string
}

/**
 * Configuración del proveedor de autenticación
 */
export interface AuthProviderConfig {
  enabled: boolean
  config: Record<string, unknown>
}
