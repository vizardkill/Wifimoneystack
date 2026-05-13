import { AppMediaDB } from '@/core/marketplace/db/app-media.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'

import { CONFIG_LIST_ADMIN_MARKETPLACE_APPS } from '@types'

type RequestStatus = CONFIG_LIST_ADMIN_MARKETPLACE_APPS.RequestStatus
type RequestResponse = CONFIG_LIST_ADMIN_MARKETPLACE_APPS.RequestResponse
type Payload = CONFIG_LIST_ADMIN_MARKETPLACE_APPS.Payload

export class CLS_ListAdminMarketplaceApps {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_LIST_ADMIN_MARKETPLACE_APPS.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  private _apps: Awaited<ReturnType<typeof MarketplaceAppDB.listAll>>['apps'] = []
  private _total = 0

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._fetchApps, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_LIST_ADMIN_MARKETPLACE_APPS.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_LIST_ADMIN_MARKETPLACE_APPS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo listar las apps del administrador.' }
    }

    return this._requestResponse
  }

  private async _fetchApps(): Promise<void> {
    try {
      const page = this._payload.page ?? 1
      const perPage = this._payload.per_page ?? 100

      const result = await MarketplaceAppDB.listAll({
        page,
        per_page: perPage
      })

      this._apps = result.apps
      this._total = result.total
    } catch (err) {
      this._statusRequest = CONFIG_LIST_ADMIN_MARKETPLACE_APPS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando el catálogo admin.' }
      trackError({ error: err as Error, method: 'CLS_ListAdminMarketplaceApps._fetchApps', controller: 'marketplace' })
    }
  }

  private async _buildResponse(): Promise<void> {
    const appsWithIcons = await Promise.all(
      this._apps.map(async (app) => {
        const media = await AppMediaDB.listByApp(app.id, 'ICON')

        return {
          id: app.id,
          slug: app.slug,
          name: app.name,
          status: app.status,
          access_mode: app.access_mode,
          icon_url: media[0]?.public_url ?? null
        }
      })
    )

    this._statusRequest = CONFIG_LIST_ADMIN_MARKETPLACE_APPS.RequestStatus.Completed
    this._requestResponse = {
      data: {
        apps: appsWithIcons,
        total: this._total,
        page: this._payload.page ?? 1,
        per_page: this._payload.per_page ?? 100
      }
    }
  }
}
