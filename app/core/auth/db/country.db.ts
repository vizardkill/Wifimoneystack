import { db } from '@/db.server'

import type { CountryResponse } from '@lib/interfaces'

/**
 * Data Access Object para la entidad Country
 */
export class CountryDB {
  /**
   * Obtiene todos los países activos
   */
  static async getAll(): Promise<CountryResponse[]> {
    return db.country.findMany({
      where: { is_enabled: true },
      select: {
        id: true,
        name: true
      },
      orderBy: { name: 'asc' }
    })
  }

  /**
   * Obtiene un país por su ID
   */
  static async getById(id: string): Promise<CountryResponse | null> {
    return db.country.findUnique({
      where: { id },
      select: {
        id: true,
        name: true
      }
    })
  }
}
