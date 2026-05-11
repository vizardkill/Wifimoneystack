import type { MarketplaceUsageEvent, MarketplaceUsageEventType } from '@prisma/client'

import { db } from '@/db.server'

import type { ICreateUsageEventInput, IMarketplaceAppUsageSummary } from '@lib/interfaces'

/**
 * Data Access Object para MarketplaceUsageEvent
 */
export class AppUsageEventDB {
  /**
   * Crear un evento de uso
   */
  static async create(input: ICreateUsageEventInput): Promise<MarketplaceUsageEvent> {
    return db.marketplaceUsageEvent.create({
      data: {
        app_id: input.app_id,
        user_id: input.user_id,
        type: input.type,
        metadata: input.metadata as never
      }
    })
  }

  /**
   * Obtener resumen de uso por app (top N apps) en los últimos N días
   */
  static async getTopAppsSummary(params: { days: number; limit: number }): Promise<IMarketplaceAppUsageSummary[]> {
    const since = new Date(Date.now() - params.days * 24 * 60 * 60 * 1000)

    const events = await db.marketplaceUsageEvent.findMany({
      where: { created_at: { gte: since } },
      select: { app_id: true, type: true }
    })

    // Agrupar por app_id
    const byApp = new Map<string, Record<MarketplaceUsageEventType, number>>()
    for (const e of events) {
      if (!byApp.has(e.app_id)) {
        byApp.set(e.app_id, { DETAIL_VIEW: 0, WEB_OPEN: 0, PACKAGE_DOWNLOAD: 0, PACKAGE_INSTALL: 0 })
      }
      byApp.get(e.app_id)![e.type]++
    }

    // Obtener apps
    const appIds = [...byApp.keys()]
    if (appIds.length === 0) {
      return []
    }

    const apps = await db.marketplaceApp.findMany({
      where: { id: { in: appIds } },
      select: { id: true, name: true }
    })

    const appMap = new Map(apps.map((a) => [a.id, a.name]))

    const summaries: IMarketplaceAppUsageSummary[] = [...byApp.entries()].map(([app_id, counts]) => ({
      app_id,
      app_name: appMap.get(app_id) ?? 'Desconocida',
      detail_views: counts.DETAIL_VIEW,
      web_opens: counts.WEB_OPEN,
      downloads: counts.PACKAGE_DOWNLOAD,
      installs: counts.PACKAGE_INSTALL,
      total_events: counts.DETAIL_VIEW + counts.WEB_OPEN + counts.PACKAGE_DOWNLOAD + counts.PACKAGE_INSTALL
    }))

    return summaries.sort((a, b) => b.total_events - a.total_events).slice(0, params.limit)
  }
}
