import type { UserAuthProvider } from '@prisma/client'

import { db } from '@/db.server'

import type { GoogleProviderData, UserAuthProviderData } from '@lib/interfaces'

/**
 * Data Access Object para proveedores de autenticación de usuarios
 */
export class UserAuthProviderDB {
  /**
   * Obtiene todos los proveedores de autenticación para un usuario
   */
  static async getByUserId(userId: string): Promise<UserAuthProvider[]> {
    return db.userAuthProvider.findMany({
      where: { user_id: userId },
      orderBy: { is_primary: 'desc' }
    })
  }

  /**
   * Obtiene un proveedor específico para un usuario
   */
  static async getByUserIdAndProvider(userId: string, providerType: string): Promise<UserAuthProvider | null> {
    return db.userAuthProvider.findUnique({
      where: {
        user_id_provider_type: {
          user_id: userId,
          provider_type: providerType
        }
      }
    })
  }

  /**
   * Obtiene un proveedor por tipo e ID externo del proveedor
   */
  static async getByProviderTypeAndProviderId(providerType: string, providerId: string): Promise<UserAuthProvider | null> {
    return db.userAuthProvider.findFirst({
      where: {
        provider_type: providerType,
        provider_id: providerId
      }
    })
  }

  /**
   * Crea un nuevo proveedor de autenticación para un usuario
   */
  static async create(data: UserAuthProviderData): Promise<UserAuthProvider> {
    return db.userAuthProvider.create({
      data: {
        user_id: data.user_id,
        provider_type: data.provider_type,
        provider_id: data.provider_id,
        ...(data.provider_data !== null && data.provider_data !== undefined ? { provider_data: data.provider_data } : {}),
        is_primary: data.is_primary ?? false
      }
    })
  }

  /**
   * Actualiza los datos de un proveedor de autenticación
   */
  static async update(
    userId: string,
    providerType: string,
    updateData: Omit<Partial<UserAuthProviderData>, 'user_id' | 'provider_type'>
  ): Promise<UserAuthProvider> {
    const dataToUpdate: Record<string, unknown> = {}
    if (updateData.provider_id !== undefined) {
      dataToUpdate.provider_id = updateData.provider_id
    }
    if (updateData.provider_data !== undefined && updateData.provider_data !== null) {
      dataToUpdate.provider_data = updateData.provider_data
    }
    if (updateData.is_primary !== undefined) {
      dataToUpdate.is_primary = updateData.is_primary
    }

    return db.userAuthProvider.update({
      where: {
        user_id_provider_type: {
          user_id: userId,
          provider_type: providerType
        }
      },
      data: dataToUpdate
    })
  }

  /**
   * Vincula una cuenta de Google a un usuario existente
   */
  static async linkGoogleAccount(userId: string, googleData: GoogleProviderData): Promise<UserAuthProvider> {
    const existingProvider = await this.getByUserIdAndProvider(userId, 'google')

    if (existingProvider) {
      return this.update(userId, 'google', {
        provider_id: googleData.google_id,
        provider_data: {
          email: googleData.email,
          picture: googleData.picture,
          verified_email: googleData.verified_email,
          locale: googleData.locale
        }
      })
    }

    return this.create({
      user_id: userId,
      provider_type: 'google',
      provider_id: googleData.google_id,
      provider_data: {
        email: googleData.email,
        picture: googleData.picture,
        verified_email: googleData.verified_email,
        locale: googleData.locale
      },
      is_primary: false
    })
  }

  /**
   * Verifica si un usuario tiene un método de autenticación específico
   */
  static async hasProvider(userId: string, providerType: string): Promise<boolean> {
    const provider = await this.getByUserIdAndProvider(userId, providerType)
    return provider !== null
  }

  /**
   * Obtiene el proveedor primario de un usuario
   */
  static async getPrimaryProvider(userId: string): Promise<UserAuthProvider | null> {
    return db.userAuthProvider.findFirst({
      where: {
        user_id: userId,
        is_primary: true
      }
    })
  }

  /**
   * Establece un proveedor como primario (desactivando otros)
   */
  static async setPrimaryProvider(userId: string, providerType: string): Promise<void> {
    await db.$transaction(async (tx) => {
      await tx.userAuthProvider.updateMany({
        where: { user_id: userId, is_primary: true },
        data: { is_primary: false }
      })

      await tx.userAuthProvider.update({
        where: {
          user_id_provider_type: {
            user_id: userId,
            provider_type: providerType
          }
        },
        data: { is_primary: true }
      })
    })
  }
}
