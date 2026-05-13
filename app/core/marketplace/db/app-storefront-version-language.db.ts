import type { MarketplaceAppStorefrontVersionLanguage } from '@prisma/client'

import { db } from '@/db.server'

export class AppStorefrontVersionLanguageDB {
  static async listByStorefrontVersion(storefront_version_id: string): Promise<MarketplaceAppStorefrontVersionLanguage[]> {
    return db.marketplaceAppStorefrontVersionLanguage.findMany({
      where: { storefront_version_id },
      orderBy: { sort_order: 'asc' }
    })
  }

  static async replaceByStorefrontVersion(storefront_version_id: string, language_codes: string[]): Promise<void> {
    await db.$transaction(async (tx) => {
      await tx.marketplaceAppStorefrontVersionLanguage.deleteMany({
        where: { storefront_version_id }
      })

      if (language_codes.length === 0) {
        return
      }

      await tx.marketplaceAppStorefrontVersionLanguage.createMany({
        data: language_codes.map((language_code, index) => ({
          storefront_version_id,
          language_code,
          sort_order: index
        }))
      })
    })
  }

  static async countByStorefrontVersion(storefront_version_id: string): Promise<number> {
    return db.marketplaceAppStorefrontVersionLanguage.count({
      where: { storefront_version_id }
    })
  }
}
