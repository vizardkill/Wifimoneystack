import type { MarketplaceAppMedia, MarketplaceMediaType } from '@prisma/client'

import { db } from '@/db.server'

/**
 * Data Access Object para MarketplaceAppMedia
 */
export class AppMediaDB {
  /**
   * Crear un registro de media
   */
  static async create(input: {
    app_id: string
    type: MarketplaceMediaType
    storage_key?: string | null
    public_url?: string
    alt_text?: string
    sort_order?: number
  }): Promise<MarketplaceAppMedia> {
    return db.marketplaceAppMedia.create({
      data: {
        app_id: input.app_id,
        type: input.type,
        storage_key: input.storage_key ?? null,
        public_url: input.public_url,
        alt_text: input.alt_text,
        sort_order: input.sort_order ?? 0
      }
    })
  }

  static async findById(id: string): Promise<MarketplaceAppMedia | null> {
    return db.marketplaceAppMedia.findUnique({ where: { id } })
  }

  /**
   * Listar media de una app por tipo
   */
  static async listByApp(app_id: string, type?: MarketplaceMediaType): Promise<MarketplaceAppMedia[]> {
    return db.marketplaceAppMedia.findMany({
      where: { app_id, ...(type ? { type } : {}) },
      orderBy: { sort_order: 'asc' }
    })
  }

  static async listByIds(media_ids: string[]): Promise<MarketplaceAppMedia[]> {
    if (media_ids.length === 0) {
      return []
    }

    return db.marketplaceAppMedia.findMany({
      where: { id: { in: media_ids } },
      orderBy: { sort_order: 'asc' }
    })
  }

  static async countByAppAndType(app_id: string, type: MarketplaceMediaType): Promise<number> {
    return db.marketplaceAppMedia.count({
      where: { app_id, type }
    })
  }

  /**
   * Eliminar un registro de media
   */
  static async delete(id: string): Promise<void> {
    await db.marketplaceAppMedia.delete({ where: { id } })
  }

  /**
   * Actualizar orden de media
   */
  static async updateSortOrder(id: string, sort_order: number): Promise<MarketplaceAppMedia> {
    return db.marketplaceAppMedia.update({ where: { id }, data: { sort_order } })
  }
}
