/**
 * @file auth.interfaces.ts
 * @description Interfaces y tipos para el sistema de autenticación
 */
import type { Prisma } from '@prisma/client'

import { type AuthLoginPayload, type AuthRegisterPayload } from '@lib/interfaces/_auth-provider.interfaces'

/**
 * Datos de proveedor de autenticación
 */
export interface UserAuthProviderData {
  user_id: string
  provider_type: string
  provider_id?: string | null
  provider_data?: Prisma.InputJsonValue | null
  is_primary?: boolean
}

/**
 * Datos específicos del proveedor Google
 */
export interface GoogleProviderData {
  google_id: string
  email: string
  picture?: string
  verified_email: boolean
  locale?: string
}

/**
 * Datos de usuario para creación
 */
export interface CreateUserData {
  email: string
  password: string
  first_name: string
  last_name: string
  role?: 'USER' | 'ADMIN' | 'SUPERADMIN'
  email_verified?: boolean
  is_active?: boolean
}

/**
 * Datos de usuario para actualización
 */
export interface UpdateUserData {
  email?: string
  password?: string
  first_name?: string
  last_name?: string
  role?: 'USER' | 'ADMIN' | 'SUPERADMIN'
  email_verified?: boolean
  is_active?: boolean
}

/**
 * Respuesta simplificada de país
 */
export interface CountryResponse {
  id: string
  name: string
}

/**
 * Payload específico para Google OAuth Provider
 */
export interface GoogleRegisterPayload extends AuthRegisterPayload {
  provider_data: {
    google_id: string
    access_token: string
    refresh_token?: string
    id_token?: string
    profile?: {
      picture?: string
      verified_email?: boolean
      locale?: string
    }
  }
}

export interface GoogleLoginPayload extends AuthLoginPayload {
  provider_data: {
    google_id: string
    access_token: string
    refresh_token?: string
    id_token?: string
    profile?: {
      picture?: string
      verified_email?: boolean
      locale?: string
    }
  }
}

/**
 * Datos del usuario de Google
 */
export interface GoogleUserProfile {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture?: string
  locale?: string
  accessToken?: string
}

/**
 * Payload específico para JWT Provider
 */
export interface JWTRegisterPayload extends AuthRegisterPayload {
  password: string
}

export interface JWTLoginPayload extends AuthLoginPayload {
  password: string
}
