import type { MarketplaceLanguageCatalog } from '@prisma/client'

import { db } from '@/db.server'

export class LanguageCatalogDB {
  static async listAll(): Promise<MarketplaceLanguageCatalog[]> {
    return db.marketplaceLanguageCatalog.findMany({
      orderBy: [{ sort_order: 'asc' }, { label: 'asc' }]
    })
  }

  static async listActive(): Promise<MarketplaceLanguageCatalog[]> {
    return db.marketplaceLanguageCatalog.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { label: 'asc' }]
    })
  }

  static async findByCodes(codes: string[], only_active = true): Promise<MarketplaceLanguageCatalog[]> {
    if (codes.length === 0) {
      return []
    }

    return db.marketplaceLanguageCatalog.findMany({
      where: {
        code: { in: codes },
        ...(only_active ? { is_active: true } : {})
      },
      orderBy: [{ sort_order: 'asc' }, { label: 'asc' }]
    })
  }

  static async countActiveByCodes(codes: string[]): Promise<number> {
    if (codes.length === 0) {
      return 0
    }

    return db.marketplaceLanguageCatalog.count({
      where: {
        code: { in: codes },
        is_active: true
      }
    })
  }
}
