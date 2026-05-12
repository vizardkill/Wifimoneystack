import type { MarketplaceApp, MarketplaceAppStatus } from '@prisma/client'

import { db } from '@/db.server'

import type { IMarketplaceAppWithMedia, IUpsertMarketplaceAppInput } from '@lib/interfaces'

/**
 * Data Access Object para MarketplaceApp
 */
export class MarketplaceAppDB {
  /**
   * Crear o actualizar una app del marketplace
   */
  static async upsert(input: IUpsertMarketplaceAppInput): Promise<MarketplaceApp> {
    const slug =
      input.slug ??
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

    const description = input.description.trim() || input.summary
    const instructions = input.instructions.trim() || 'Sin instrucciones adicionales.'

    if (input.id) {
      return db.marketplaceApp.update({
        where: { id: input.id },
        data: {
          name: input.name,
          summary: input.summary,
          description,
          instructions,
          access_mode: input.access_mode,
          web_url: input.web_url,
          updated_by_user_id: input.actor_user_id
        }
      })
    }

    return db.marketplaceApp.create({
      data: {
        slug,
        name: input.name,
        summary: input.summary,
        description,
        instructions,
        access_mode: input.access_mode,
        web_url: input.web_url,
        created_by_user_id: input.actor_user_id
      }
    })
  }

  /**
   * Buscar app por ID con media y artefacto activo
   */
  static async findByIdWithMedia(id: string): Promise<IMarketplaceAppWithMedia | null> {
    const app = await db.marketplaceApp.findUnique({
      where: { id },
      include: {
        media: { orderBy: { sort_order: 'asc' } },
        artifacts: { where: { is_active: true }, take: 1 }
      }
    })
    if (!app) {
      return null
    }
    const { artifacts, ...rest } = app
    return { ...rest, active_artifact: artifacts[0] ?? null }
  }

  /**
   * Buscar app por slug con media y artefacto activo
   */
  static async findBySlugWithMedia(slug: string): Promise<IMarketplaceAppWithMedia | null> {
    const app = await db.marketplaceApp.findUnique({
      where: { slug },
      include: {
        media: { orderBy: { sort_order: 'asc' } },
        artifacts: { where: { is_active: true }, take: 1 }
      }
    })
    if (!app) {
      return null
    }
    const { artifacts, ...rest } = app
    return { ...rest, active_artifact: artifacts[0] ?? null }
  }

  /**
   * Buscar app por ID (sin relaciones)
   */
  static async findById(id: string): Promise<MarketplaceApp | null> {
    return db.marketplaceApp.findUnique({ where: { id } })
  }

  /**
   * Listar apps publicadas (ACTIVE) con paginación y filtros
   */
  static async listPublished(params: {
    search?: string
    access_mode?: string
    page: number
    per_page: number
  }): Promise<{ apps: MarketplaceApp[]; total: number }> {
    const where = {
      status: 'ACTIVE' as MarketplaceAppStatus,
      ...(params.access_mode ? { access_mode: params.access_mode as never } : {}),
      ...(params.search
        ? {
            OR: [{ name: { contains: params.search, mode: 'insensitive' as const } }, { summary: { contains: params.search, mode: 'insensitive' as const } }]
          }
        : {})
    }
    const skip = (params.page - 1) * params.per_page
    const [apps, total] = await Promise.all([
      db.marketplaceApp.findMany({
        where,
        skip,
        take: params.per_page,
        orderBy: { published_at: 'desc' },
        include: { media: { where: { type: 'ICON' }, take: 1 } }
      }),
      db.marketplaceApp.count({ where })
    ])
    return { apps, total }
  }

  /**
   * Listar todas las apps del admin con paginación
   */
  static async listAll(params: { page: number; per_page: number }): Promise<{ apps: MarketplaceApp[]; total: number }> {
    const skip = (params.page - 1) * params.per_page
    const [apps, total] = await Promise.all([
      db.marketplaceApp.findMany({
        skip,
        take: params.per_page,
        orderBy: { created_at: 'desc' }
      }),
      db.marketplaceApp.count()
    ])
    return { apps, total }
  }

  /**
   * Actualizar estado de publicación
   */
  static async updateStatus(id: string, status: MarketplaceAppStatus, published_at?: Date | null): Promise<MarketplaceApp> {
    return db.marketplaceApp.update({
      where: { id },
      data: { status, published_at }
    })
  }

  /**
   * Listar apps sin eventos de uso recientes
   */
  static async listWithNoRecentActivity(days: number): Promise<MarketplaceApp[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const activeApps = await db.marketplaceApp.findMany({
      where: { status: 'ACTIVE' },
      include: {
        usage_events: {
          where: { created_at: { gte: since } },
          take: 1
        }
      }
    })
    return activeApps.filter((a) => a.usage_events.length === 0).map(({ usage_events: _ue, ...app }) => app)
  }

  /**
   * Contar apps por status para KPIs
   */
  static async countByStatus(): Promise<{ DRAFT: number; ACTIVE: number; INACTIVE: number }> {
    const [draft, active, inactive] = await Promise.all([
      db.marketplaceApp.count({ where: { status: 'DRAFT' } }),
      db.marketplaceApp.count({ where: { status: 'ACTIVE' } }),
      db.marketplaceApp.count({ where: { status: 'INACTIVE' } })
    ])
    return { DRAFT: draft, ACTIVE: active, INACTIVE: inactive }
  }

  /**
   * Validar si una app cumple requisitos para publicación
   */
  static async validatePublicationRequirements(id: string): Promise<{ valid: boolean; reasons: string[] }> {
    const app = await db.marketplaceApp.findUnique({ where: { id } })

    if (!app) {
      return { valid: false, reasons: ['App no encontrada'] }
    }

    const reasons: string[] = []
    if (!app.name) {
      reasons.push('Falta el nombre')
    }
    if (!app.summary) {
      reasons.push('Falta el resumen')
    }

    return { valid: reasons.length === 0, reasons }
  }
}
