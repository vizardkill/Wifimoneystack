import { AppUsageEventDB } from '@/core/marketplace/db/app-usage-event.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'
import { db } from '@/db.server'

import { trackError } from '@lib/functions/_track_error.function'

import { CONFIG_GET_MARKETPLACE_DASHBOARD } from '@types'

type RequestStatus = CONFIG_GET_MARKETPLACE_DASHBOARD.RequestStatus
type RequestResponse = CONFIG_GET_MARKETPLACE_DASHBOARD.RequestResponse
type Payload = CONFIG_GET_MARKETPLACE_DASHBOARD.Payload

export class CLS_GetMarketplaceDashboard {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_GET_MARKETPLACE_DASHBOARD.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._fetchData, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_GET_MARKETPLACE_DASHBOARD.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_DASHBOARD.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo cargar el dashboard.' }
    }

    return this._requestResponse
  }

  private _kpis: NonNullable<CONFIG_GET_MARKETPLACE_DASHBOARD.RequestResponse['data']>['kpis'] = {
    total_requests: 0,
    pending_requests: 0,
    approved_users: 0,
    rejected_requests: 0,
    revoked_users: 0,
    total_apps: 0,
    active_apps: 0,
    draft_apps: 0,
    inactive_apps: 0
  }
  private _topApps: NonNullable<CONFIG_GET_MARKETPLACE_DASHBOARD.RequestResponse['data']>['top_apps'] = []
  private _noActivityApps: NonNullable<CONFIG_GET_MARKETPLACE_DASHBOARD.RequestResponse['data']>['no_activity_apps'] = []

  private async _fetchData(): Promise<void> {
    const days = this._payload.days ?? 30
    try {
      const [pending, approved, rejected, revoked, appCounts, topApps, noActivityApps] = await Promise.all([
        db.marketplaceAccessRequest.count({ where: { status: 'PENDING' } }),
        db.marketplaceAccessRequest.count({ where: { status: 'APPROVED' } }),
        db.marketplaceAccessRequest.count({ where: { status: 'REJECTED' } }),
        db.marketplaceAccessRequest.count({ where: { status: 'REVOKED' } }),
        MarketplaceAppDB.countByStatus(),
        AppUsageEventDB.getTopAppsSummary({ days, limit: 10 }),
        MarketplaceAppDB.listWithNoRecentActivity(days)
      ])

      this._kpis = {
        total_requests: pending + approved + rejected + revoked,
        pending_requests: pending,
        approved_users: approved,
        rejected_requests: rejected,
        revoked_users: revoked,
        total_apps: appCounts.DRAFT + appCounts.ACTIVE + appCounts.INACTIVE,
        active_apps: appCounts.ACTIVE,
        draft_apps: appCounts.DRAFT,
        inactive_apps: appCounts.INACTIVE
      }
      this._topApps = topApps.map((a) => ({
        app_id: a.app_id,
        app_name: a.app_name,
        detail_views: a.detail_views,
        web_opens: a.web_opens,
        downloads: a.downloads,
        installs: a.installs,
        total_events: a.total_events
      }))
      this._noActivityApps = noActivityApps.map((a) => ({
        id: a.id,
        name: a.name,
        status: a.status,
        published_at: a.published_at
      }))
    } catch (err) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_DASHBOARD.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando datos del dashboard.' }
      trackError({ error: err as Error, method: 'CLS_GetMarketplaceDashboard._fetchData', controller: 'marketplace' })
    }
  }

  private async _buildResponse(): Promise<void> {
    this._statusRequest = CONFIG_GET_MARKETPLACE_DASHBOARD.RequestStatus.Completed
    this._requestResponse = {
      data: {
        kpis: this._kpis,
        top_apps: this._topApps,
        no_activity_apps: this._noActivityApps
      }
    }
  }
}
