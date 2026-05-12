import { UserDB } from '@/core/auth/db/user.db'
import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'
import { AppUsageEventDB } from '@/core/marketplace/db/app-usage-event.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'
import { MarketplaceAuditEventDB } from '@/core/marketplace/db/marketplace-audit-event.db'

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
  private _kpisVariation7d: NonNullable<CONFIG_GET_MARKETPLACE_DASHBOARD.RequestResponse['data']>['kpis_variation_7d'] = {
    new_users_7d: 0,
    access_decisions_7d: 0,
    apps_activated_7d: 0,
    apps_deactivated_7d: 0
  }
  private _topApps: NonNullable<CONFIG_GET_MARKETPLACE_DASHBOARD.RequestResponse['data']>['top_apps'] = []
  private _noActivityApps: NonNullable<CONFIG_GET_MARKETPLACE_DASHBOARD.RequestResponse['data']>['no_activity_apps'] = []

  private async _fetchData(): Promise<void> {
    const days = this._payload.days ?? 30
    const since7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    try {
      const [accessCounts, appCounts, topApps, noActivityApps, newUsers7d, accessDecisions7d, appsActivated7d, appsDeactivated7d] = await Promise.all([
        AccessRequestDB.countByStatus(),
        MarketplaceAppDB.countByStatus(),
        AppUsageEventDB.getTopAppsSummary({ days, limit: 10 }),
        MarketplaceAppDB.listWithNoRecentActivity(days),
        UserDB.countCreatedSince(since7Days),
        AccessRequestDB.countDecisionsSince(since7Days),
        MarketplaceAuditEventDB.countByActionsSince({
          actions: ['APP_PUBLISHED'],
          since: since7Days
        }),
        MarketplaceAuditEventDB.countByActionsSince({
          actions: ['APP_UNPUBLISHED'],
          since: since7Days
        })
      ])

      this._kpis = {
        total_requests: accessCounts.PENDING + accessCounts.APPROVED + accessCounts.REJECTED + accessCounts.REVOKED,
        pending_requests: accessCounts.PENDING,
        approved_users: accessCounts.APPROVED,
        rejected_requests: accessCounts.REJECTED,
        revoked_users: accessCounts.REVOKED,
        total_apps: appCounts.DRAFT + appCounts.ACTIVE + appCounts.INACTIVE,
        active_apps: appCounts.ACTIVE,
        draft_apps: appCounts.DRAFT,
        inactive_apps: appCounts.INACTIVE
      }

      this._kpisVariation7d = {
        new_users_7d: newUsers7d,
        access_decisions_7d: accessDecisions7d,
        apps_activated_7d: appsActivated7d,
        apps_deactivated_7d: appsDeactivated7d
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
        kpis_variation_7d: this._kpisVariation7d,
        top_apps: this._topApps,
        no_activity_apps: this._noActivityApps
      }
    }
  }
}
