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
  private _app: Awaited<ReturnType<typeof MarketplaceAppDB.findByIdForPublicDetail>> = null

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
      this._app = await MarketplaceAppDB.findByIdForPublicDetail(this._payload.app_id)
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
    const publishedStorefront = app.published_storefront
    const hasPublishedStorefront = publishedStorefront?.readiness_status === 'READY'

    const legacyMedia = app.media.map((media) => ({
      id: media.id,
      type: media.type,
      public_url: media.public_url,
      alt_text: media.alt_text,
      sort_order: media.sort_order
    }))

    const storefrontMedia = hasPublishedStorefront
      ? publishedStorefront.media.map((relation) => ({
          id: relation.media.id,
          type: relation.media.type,
          public_url: relation.media.public_url,
          alt_text: relation.media.alt_text,
          sort_order: relation.sort_order
        }))
      : []

    const storefrontLanguages = hasPublishedStorefront
      ? publishedStorefront.languages.map((relation) => ({
          code: relation.language.code,
          label: relation.language.label,
          sort_order: relation.sort_order
        }))
      : []

    const presentation_mode = hasPublishedStorefront ? 'STOREFRONT' : 'LEGACY'

    this._statusRequest = CONFIG_GET_MARKETPLACE_APP.RequestStatus.Completed
    this._requestResponse = {
      data: {
        id: app.id,
        slug: app.slug,
        name: app.name,
        summary: hasPublishedStorefront ? publishedStorefront.summary : app.summary,
        description: hasPublishedStorefront ? publishedStorefront.description : app.description,
        instructions: hasPublishedStorefront ? publishedStorefront.instructions : app.instructions,
        access_mode: app.access_mode,
        web_url: app.web_url,
        presentation_mode,
        media: hasPublishedStorefront ? storefrontMedia : legacyMedia,
        storefront: hasPublishedStorefront
          ? {
              summary: publishedStorefront.summary,
              description: publishedStorefront.description,
              instructions: publishedStorefront.instructions,
              developer_name: publishedStorefront.developer_name,
              developer_website: publishedStorefront.developer_website,
              support_email: publishedStorefront.support_email,
              support_url: publishedStorefront.support_url,
              languages: storefrontLanguages,
              media: storefrontMedia,
              video_url:
                storefrontMedia.find((media) => media.type === 'VIDEO' && typeof media.public_url === 'string' && media.public_url.length > 0)?.public_url ??
                null
            }
          : null,
        has_active_artifact: Boolean(app.active_artifact)
      }
    }
  }
}
