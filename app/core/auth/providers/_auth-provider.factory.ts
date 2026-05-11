import { CLS_GoogleProvider } from '@/core/auth/providers/google/google.provider'
import { CLS_JWTProvider } from '@/core/auth/providers/jwt/jwt.provider'

import { AuthProviderType, type IAuthProvider } from '@lib/interfaces'

/**
 * Factory para crear instancias de proveedores de autenticación
 * Patrón Factory + Singleton para cada provider
 */
export class AuthProviderFactory {
  private static _instances: Map<AuthProviderType, IAuthProvider> = new Map()

  /**
   * Obtiene o crea una instancia del provider solicitado (Singleton)
   * @param type - Tipo de proveedor de autenticación
   * @returns IAuthProvider
   */
  static getProvider(type: AuthProviderType): IAuthProvider {
    if (!this._instances.has(type)) {
      this._instances.set(type, this._createProvider(type))
    }

    return this._instances.get(type)!
  }

  /**
   * Crea una nueva instancia del provider según el tipo
   * @param type - Tipo de proveedor
   * @returns IAuthProvider
   */
  private static _createProvider(type: AuthProviderType): IAuthProvider {
    switch (type) {
      case AuthProviderType.JWT:
        return new CLS_JWTProvider()

      case AuthProviderType.GOOGLE:
        return new CLS_GoogleProvider()

      default:
        throw new Error(`Provider type '${type}' no está implementado`)
    }
  }

  /**
   * Registra todos los providers disponibles
   * @returns Array<AuthProviderType>
   */
  static getAllProviders(): AuthProviderType[] {
    return [AuthProviderType.JWT, AuthProviderType.GOOGLE]
  }

  /**
   * Limpia las instancias
   */
  static clearInstances(): void {
    this._instances.clear()
  }
}
