import type { MarketplaceSubscriptionStatus, MarketplaceUserSubscription } from '@prisma/client'

import { db } from '@/db.server'

export class MarketplaceSubscriptionDB {
  static async findByUserId(user_id: string): Promise<MarketplaceUserSubscription | null> {
    return db.marketplaceUserSubscription.findUnique({ where: { user_id } })
  }

  static async createFromApproval(params: { user_id: string; starts_at: Date; expires_at: Date }): Promise<MarketplaceUserSubscription> {
    return db.marketplaceUserSubscription.create({
      data: {
        user_id: params.user_id,
        status: 'ACTIVE',
        starts_at: params.starts_at,
        expires_at: params.expires_at
      }
    })
  }

  static async updateStatus(params: { user_id: string; status: MarketplaceSubscriptionStatus }): Promise<MarketplaceUserSubscription | null> {
    try {
      return await db.marketplaceUserSubscription.update({
        where: { user_id: params.user_id },
        data: {
          status: params.status
        }
      })
    } catch {
      return null
    }
  }
}
