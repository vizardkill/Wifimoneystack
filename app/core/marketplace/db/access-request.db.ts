import type { MarketplaceAccessRequest, MarketplaceAccessStatus } from '@prisma/client'

import { db } from '@/db.server'

import type { ICreateAccessRequestInput, IMarketplaceAccessRequestWithUser } from '@lib/interfaces'

/**
 * Data Access Object para MarketplaceAccessRequest
 */
export class AccessRequestDB {
  /**
   * Crear una nueva solicitud de acceso
   */
  static async create(input: ICreateAccessRequestInput): Promise<MarketplaceAccessRequest> {
    return db.marketplaceAccessRequest.create({
      data: {
        user_id: input.user_id,
        company_name: input.company_name,
        business_url: input.business_url,
        business_type: input.business_type,
        request_notes: input.request_notes
      }
    })
  }

  /**
   * Buscar solicitud por user_id
   */
  static async findByUserId(user_id: string): Promise<MarketplaceAccessRequest | null> {
    return db.marketplaceAccessRequest.findUnique({ where: { user_id } })
  }

  /**
   * Buscar solicitud por id
   */
  static async findById(id: string): Promise<MarketplaceAccessRequest | null> {
    return db.marketplaceAccessRequest.findUnique({ where: { id } })
  }

  /**
   * Listar solicitudes con datos de usuario, con filtro por status y paginación
   */
  static async listWithUser(params: {
    status?: MarketplaceAccessStatus
    page: number
    per_page: number
  }): Promise<{ requests: IMarketplaceAccessRequestWithUser[]; total: number }> {
    const where = params.status ? { status: params.status } : {}
    const skip = (params.page - 1) * params.per_page

    const [requests, total] = await Promise.all([
      db.marketplaceAccessRequest.findMany({
        where,
        skip,
        take: params.per_page,
        orderBy: { created_at: 'desc' }
      }),
      db.marketplaceAccessRequest.count({ where })
    ])

    // Fetch user info separately
    const userIds = requests.map((r) => r.user_id)
    const users = await db.user
      .findMany({
        where: { id: { in: userIds } },
        select: { id: true, first_name: true, last_name: true, email: true }
      })
      .catch(() => [] as Array<{ id: string; first_name: string; last_name: string; email: string }>)

    const userMap = new Map<string, { id: string; name: string | null; email: string }>(
      users.map((u) => [
        u.id,
        {
          id: u.id,
          name: [u.first_name, u.last_name].filter(Boolean).join(' ') || null,
          email: u.email
        }
      ])
    )

    const enriched: IMarketplaceAccessRequestWithUser[] = requests.map((r) => ({
      ...r,
      user: userMap.get(r.user_id) ?? { id: r.user_id, name: null, email: '', avatar_url: null }
    }))

    return { requests: enriched, total }
  }

  /**
   * Contar solicitudes por estado para KPIs del dashboard.
   */
  static async countByStatus(): Promise<{ PENDING: number; APPROVED: number; REJECTED: number; REVOKED: number }> {
    const [pending, approved, rejected, revoked] = await Promise.all([
      db.marketplaceAccessRequest.count({ where: { status: 'PENDING' } }),
      db.marketplaceAccessRequest.count({ where: { status: 'APPROVED' } }),
      db.marketplaceAccessRequest.count({ where: { status: 'REJECTED' } }),
      db.marketplaceAccessRequest.count({ where: { status: 'REVOKED' } })
    ])

    return {
      PENDING: pending,
      APPROVED: approved,
      REJECTED: rejected,
      REVOKED: revoked
    }
  }

  /**
   * Contar decisiones administrativas (approve/reject/revoke) en ventana temporal.
   */
  static async countDecisionsSince(since: Date): Promise<number> {
    return db.marketplaceAccessRequest.count({
      where: {
        OR: [{ status: 'APPROVED' }, { status: 'REJECTED' }, { status: 'REVOKED' }],
        decided_at: { gte: since }
      }
    })
  }

  /**
   * Actualizar estado de una solicitud (decisión admin)
   */
  static async updateDecision(params: {
    id: string
    status: MarketplaceAccessStatus
    decided_by_user_id: string
    decision_reason?: string
    revoked_at?: Date
  }): Promise<MarketplaceAccessRequest> {
    return db.marketplaceAccessRequest.update({
      where: { id: params.id },
      data: {
        status: params.status,
        decided_by_user_id: params.decided_by_user_id,
        decision_reason: params.decision_reason,
        decided_at: new Date(),
        revoked_at: params.revoked_at
      }
    })
  }

  /**
   * Actualizar decisión con guardas de concurrencia (first-write-wins).
   * Si la fila ya cambió (status/updated_at), no actualiza y retorna updated=false.
   */
  static async updateDecisionIfCurrent(params: {
    id: string
    status: MarketplaceAccessStatus
    decided_by_user_id: string
    decision_reason?: string
    revoked_at?: Date
    expected_status?: MarketplaceAccessStatus
    expected_updated_at?: Date
  }): Promise<{ updated: boolean; record: MarketplaceAccessRequest | null }> {
    const where = {
      id: params.id,
      ...(params.expected_status ? { status: params.expected_status } : {}),
      ...(params.expected_updated_at ? { updated_at: params.expected_updated_at } : {})
    }

    const result = await db.marketplaceAccessRequest.updateMany({
      where,
      data: {
        status: params.status,
        decided_by_user_id: params.decided_by_user_id,
        decision_reason: params.decision_reason,
        decided_at: new Date(),
        revoked_at: params.revoked_at
      }
    })

    if (result.count === 0) {
      return { updated: false, record: null }
    }

    const record = await this.findById(params.id)
    return { updated: true, record }
  }
}
