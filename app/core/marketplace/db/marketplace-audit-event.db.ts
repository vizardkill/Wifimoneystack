import type { MarketplaceAuditAction, MarketplaceAuditEvent } from '@prisma/client'

import { db } from '@/db.server'

import type { ICreateAuditEventInput } from '@lib/interfaces'

/**
 * Data Access Object para MarketplaceAuditEvent
 */
export class MarketplaceAuditEventDB {
  /**
   * Crear un evento de auditoría
   */
  static async create(input: ICreateAuditEventInput): Promise<MarketplaceAuditEvent> {
    return db.marketplaceAuditEvent.create({
      data: {
        actor_user_id: input.actor_user_id,
        target_user_id: input.target_user_id,
        app_id: input.app_id,
        action: input.action,
        reason: input.reason,
        metadata: input.metadata as never
      }
    })
  }

  /**
   * Listar eventos de auditoría con filtros
   */
  static async list(params: {
    actor_user_id?: string
    target_user_id?: string
    app_id?: string
    action?: MarketplaceAuditAction
    page?: number
    per_page?: number
  }): Promise<MarketplaceAuditEvent[]> {
    const page = params.page ?? 1
    const per_page = params.per_page ?? 20
    return db.marketplaceAuditEvent.findMany({
      where: {
        ...(params.actor_user_id ? { actor_user_id: params.actor_user_id } : {}),
        ...(params.target_user_id ? { target_user_id: params.target_user_id } : {}),
        ...(params.app_id ? { app_id: params.app_id } : {}),
        ...(params.action ? { action: params.action } : {})
      },
      skip: (page - 1) * per_page,
      take: per_page,
      orderBy: { created_at: 'desc' }
    })
  }

  /**
   * Contar eventos por acciones desde una fecha dada.
   */
  static async countByActionsSince(params: { actions: MarketplaceAuditAction[]; since: Date }): Promise<number> {
    return db.marketplaceAuditEvent.count({
      where: {
        action: { in: params.actions },
        created_at: { gte: params.since }
      }
    })
  }

  static async countStorefrontActionsSince(since: Date): Promise<number> {
    return db.marketplaceAuditEvent.count({
      where: {
        action: {
          in: ['APP_STOREFRONT_DRAFT_SAVED', 'APP_STOREFRONT_PUBLISHED', 'APP_STOREFRONT_MEDIA_UPDATED']
        },
        created_at: { gte: since }
      }
    })
  }
}
