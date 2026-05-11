import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'
import { AppMediaDB } from '@/core/marketplace/db/app-media.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'

import { CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS } from '@types'

type RequestStatus = CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS.RequestStatus
type RequestResponse = CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS.RequestResponse
type Payload = CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS.Payload

export class CLS_ListPublishedMarketplaceApps {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._verifyAccess, this._fetchApps, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo listar las aplicaciones.' }
    }

    return this._requestResponse
  }

  private _apps: Awaited<ReturnType<typeof MarketplaceAppDB.listPublished>>['apps'] = []
  private _total = 0

  private async _verifyAccess(): Promise<void> {
    try {
      const request = await AccessRequestDB.findByUserId(this._payload.user_id)
      if (request?.status !== 'APPROVED') {
        this._statusRequest = CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS.RequestStatus.AccessDenied
        this._requestResponse = {
          error: true,
          message: 'No tienes acceso aprobado al marketplace.',
          status: CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS.RequestStatus.AccessDenied
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error verificando acceso.' }
      trackError({ error: err as Error, method: 'CLS_ListPublishedMarketplaceApps._verifyAccess', controller: 'marketplace' })
    }
  }

  private async _fetchApps(): Promise<void> {
    try {
      const result = await MarketplaceAppDB.listPublished({
        search: this._payload.search,
        access_mode: this._payload.access_mode,
        page: this._payload.page ?? 1,
        per_page: this._payload.per_page ?? 20
      })
      this._apps = result.apps
      this._total = result.total
    } catch (err) {
      this._statusRequest = CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando aplicaciones.' }
      trackError({ error: err as Error, method: 'CLS_ListPublishedMarketplaceApps._fetchApps', controller: 'marketplace' })
    }
  }

  private async _buildResponse(): Promise<void> {
    // Get icon for each app
    const appsWithIcons = await Promise.all(
      this._apps.map(async (app) => {
        const media = await AppMediaDB.listByApp(app.id, 'ICON')
        const screenshots = await AppMediaDB.listByApp(app.id, 'SCREENSHOT')
        return {
          id: app.id,
          slug: app.slug,
          name: app.name,
          summary: app.summary,
          access_mode: app.access_mode,
          icon_url: media[0]?.public_url ?? null,
          screenshot_count: screenshots.length
        }
      })
    )

    this._statusRequest = CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS.RequestStatus.Completed
    this._requestResponse = {
      data: {
        apps: appsWithIcons,
        total: this._total,
        page: this._payload.page ?? 1,
        per_page: this._payload.per_page ?? 20
      }
    }
  }
}
