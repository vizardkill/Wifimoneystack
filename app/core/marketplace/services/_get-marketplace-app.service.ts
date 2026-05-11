import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'
import { AppUsageEventDB } from '@/core/marketplace/db/app-usage-event.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'

import { CONFIG_GET_MARKETPLACE_APP } from '@types'

type RequestStatus = CONFIG_GET_MARKETPLACE_APP.RequestStatus
type RequestResponse = CONFIG_GET_MARKETPLACE_APP.RequestResponse
type Payload = CONFIG_GET_MARKETPLACE_APP.Payload

export class CLS_GetMarketplaceApp {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_GET_MARKETPLACE_APP.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._verifyAccess, this._fetchApp, this._recordView, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_GET_MARKETPLACE_APP.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_APP.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo cargar la aplicación.' }
    }

    return this._requestResponse
  }

  private _app: Awaited<ReturnType<typeof MarketplaceAppDB.findByIdWithMedia>> = null

  private async _verifyAccess(): Promise<void> {
    try {
      const request = await AccessRequestDB.findByUserId(this._payload.user_id)
      if (request?.status !== 'APPROVED') {
        this._statusRequest = CONFIG_GET_MARKETPLACE_APP.RequestStatus.AccessDenied
        this._requestResponse = {
          error: true,
          message: 'No tienes acceso aprobado al marketplace.',
          status: CONFIG_GET_MARKETPLACE_APP.RequestStatus.AccessDenied
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_APP.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error verificando acceso.' }
      trackError({ error: err as Error, method: 'CLS_GetMarketplaceApp._verifyAccess', controller: 'marketplace' })
    }
  }

  private async _fetchApp(): Promise<void> {
    try {
      this._app = await MarketplaceAppDB.findByIdWithMedia(this._payload.app_id)
      if (this._app?.status !== 'ACTIVE') {
        this._statusRequest = CONFIG_GET_MARKETPLACE_APP.RequestStatus.NotFound
        this._requestResponse = { error: true, message: 'Aplicación no encontrada o no disponible.' }
      }
    } catch (err) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_APP.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando la aplicación.' }
      trackError({ error: err as Error, method: 'CLS_GetMarketplaceApp._fetchApp', controller: 'marketplace' })
    }
  }

  private async _recordView(): Promise<void> {
    try {
      if (this._app) {
        await AppUsageEventDB.create({
          app_id: this._app.id,
          user_id: this._payload.user_id,
          type: 'DETAIL_VIEW'
        })
      }
    } catch {
      // Usage tracking failure must not block detail view
    }
  }

  private async _buildResponse(): Promise<void> {
    const app = this._app!
    this._statusRequest = CONFIG_GET_MARKETPLACE_APP.RequestStatus.Completed
    this._requestResponse = {
      data: {
        id: app.id,
        slug: app.slug,
        name: app.name,
        summary: app.summary,
        description: app.description,
        instructions: app.instructions,
        access_mode: app.access_mode,
        web_url: app.web_url,
        media: app.media.map((m) => ({
          id: m.id,
          type: m.type,
          public_url: m.public_url,
          alt_text: m.alt_text,
          sort_order: m.sort_order
        })),
        has_active_artifact: app.active_artifact !== null
      }
    }
  }
}
