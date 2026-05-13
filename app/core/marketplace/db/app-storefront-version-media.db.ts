import type { MarketplaceMediaType, Prisma } from '@prisma/client'

import { db } from '@/db.server'

type StorefrontVersionMediaWithMedia = Prisma.MarketplaceAppStorefrontVersionMediaGetPayload<{
  include: { media: true }
}>

export class AppStorefrontVersionMediaDB {
  static async listByStorefrontVersion(storefront_version_id: string): Promise<StorefrontVersionMediaWithMedia[]> {
    return db.marketplaceAppStorefrontVersionMedia.findMany({
      where: { storefront_version_id },
      include: { media: true },
      orderBy: { sort_order: 'asc' }
    })
  }

  static async replaceByStorefrontVersion(storefront_version_id: string, media_ids: string[]): Promise<void> {
    await db.$transaction(async (tx) => {
      await tx.marketplaceAppStorefrontVersionMedia.deleteMany({
        where: { storefront_version_id }
      })

      if (media_ids.length === 0) {
        return
      }

      await tx.marketplaceAppStorefrontVersionMedia.createMany({
        data: media_ids.map((media_id, index) => ({
          storefront_version_id,
          media_id,
          sort_order: index
        }))
      })
    })
  }

  static async attachMedia(storefront_version_id: string, media_id: string): Promise<void> {
    const currentCount = await db.marketplaceAppStorefrontVersionMedia.count({ where: { storefront_version_id } })

    await db.marketplaceAppStorefrontVersionMedia.upsert({
      where: {
        storefront_version_id_media_id: {
          storefront_version_id,
          media_id
        }
      },
      create: {
        storefront_version_id,
        media_id,
        sort_order: currentCount
      },
      update: {}
    })
  }

  static async detachMedia(storefront_version_id: string, media_id: string): Promise<void> {
    await db.marketplaceAppStorefrontVersionMedia.deleteMany({
      where: {
        storefront_version_id,
        media_id
      }
    })

    const current = await db.marketplaceAppStorefrontVersionMedia.findMany({
      where: { storefront_version_id },
      orderBy: { sort_order: 'asc' }
    })

    await Promise.all(
      current.map((item, index) =>
        db.marketplaceAppStorefrontVersionMedia.update({
          where: { id: item.id },
          data: { sort_order: index }
        })
      )
    )
  }

  static async reorderByMediaIds(storefront_version_id: string, ordered_media_ids: string[]): Promise<void> {
    await db.$transaction(
      ordered_media_ids.map((media_id, index) =>
        db.marketplaceAppStorefrontVersionMedia.updateMany({
          where: {
            storefront_version_id,
            media_id
          },
          data: { sort_order: index }
        })
      )
    )
  }

  static async countByStorefrontVersionAndType(storefront_version_id: string, media_type: MarketplaceMediaType): Promise<number> {
    return db.marketplaceAppStorefrontVersionMedia.count({
      where: {
        storefront_version_id,
        media: {
          type: media_type
        }
      }
    })
  }
}
