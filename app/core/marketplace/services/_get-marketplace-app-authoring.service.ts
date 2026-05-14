import { Prisma } from '@prisma/client'

import { UserDB } from '@/core/auth/db/user.db'
import { AppMediaDB } from '@/core/marketplace/db/app-media.db'
import { AppStorefrontVersionDB } from '@/core/marketplace/db/app-storefront-version.db'
import { LanguageCatalogDB } from '@/core/marketplace/db/language-catalog.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'

import { CONFIG_GET_MARKETPLACE_APP_AUTHORING } from '@types'

import { resolveMarketplaceMediaUrl } from './_resolve-marketplace-media-url.helper'

type RequestStatus = CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus
type RequestResponse = CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestResponse
type Payload = CONFIG_GET_MARKETPLACE_APP_AUTHORING.Payload

export class CLS_GetMarketplaceAppAuthoring {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  private _app: Awaited<ReturnType<typeof MarketplaceAppDB.findByIdWithMedia>> = null
  private _draftStorefront: Awaited<ReturnType<typeof AppStorefrontVersionDB.findByAppAndKindWithRelations>> = null
  private _publishedStorefront: Awaited<ReturnType<typeof AppStorefrontVersionDB.findByAppAndKindWithRelations>> = null
  private _mediaLibrary: Awaited<ReturnType<typeof AppMediaDB.listByApp>> = []
  private _languageCatalog: Awaited<ReturnType<typeof LanguageCatalogDB.listActive>> = []
  private _draftReadiness: Awaited<ReturnType<typeof MarketplaceAppDB.evaluateDraftStorefrontReadiness>> = {
    ready: false,
    missing_requirements: []
  }

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._verifyActorRole, this._fetchApp, this._ensureDraftVersion, this._fetchAuthoringData, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo cargar el workspace de authoring.' }
    }

    return this._requestResponse
  }

  private async _verifyActorRole(): Promise<void> {
    try {
      const user = await UserDB.getById(this._payload.actor_user_id)
      const hasMarketplaceAdminAccess = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

      if (!hasMarketplaceAdminAccess) {
        this._statusRequest = CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.Forbidden
        this._requestResponse = {
          error: true,
          message: 'Sin permisos para acceder al authoring de vitrinas.',
          status: CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.Forbidden
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error validando permisos del actor.' }
      trackError({ error: err as Error, method: 'CLS_GetMarketplaceAppAuthoring._verifyActorRole', controller: 'marketplace' })
    }
  }

  private async _fetchApp(): Promise<void> {
    try {
      this._app = await MarketplaceAppDB.findByIdWithMedia(this._payload.app_id)

      if (!this._app) {
        this._statusRequest = CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.NotFound
        this._requestResponse = {
          error: true,
          message: 'Aplicación no encontrada para authoring.',
          status: CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.NotFound
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando la app para authoring.' }
      trackError({ error: err as Error, method: 'CLS_GetMarketplaceAppAuthoring._fetchApp', controller: 'marketplace' })
    }
  }

  private async _ensureDraftVersion(): Promise<void> {
    try {
      await AppStorefrontVersionDB.ensureDraft(this._payload.app_id, this._payload.actor_user_id)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
        this._statusRequest = CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.Error
        this._requestResponse = {
          error: true,
          message: 'El esquema de base de datos no está actualizado para storefront authoring. Ejecuta: npx prisma migrate deploy && npm run prisma:seed'
        }
        trackError({ error: err, method: 'CLS_GetMarketplaceAppAuthoring._ensureDraftVersion', controller: 'marketplace' })
        return
      }

      this._statusRequest = CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error preparando el borrador de storefront.' }
      trackError({ error: err as Error, method: 'CLS_GetMarketplaceAppAuthoring._ensureDraftVersion', controller: 'marketplace' })
    }
  }

  private async _fetchAuthoringData(): Promise<void> {
    try {
      const [draftStorefront, publishedStorefront, mediaLibrary, languageCatalog, draftReadiness] = await Promise.all([
        AppStorefrontVersionDB.findByAppAndKindWithRelations(this._payload.app_id, 'DRAFT'),
        AppStorefrontVersionDB.findByAppAndKindWithRelations(this._payload.app_id, 'PUBLISHED'),
        AppMediaDB.listByApp(this._payload.app_id),
        LanguageCatalogDB.listActive(),
        MarketplaceAppDB.evaluateDraftStorefrontReadiness(this._payload.app_id)
      ])

      this._draftStorefront = draftStorefront
      this._publishedStorefront = publishedStorefront
      this._mediaLibrary = mediaLibrary
      this._languageCatalog = languageCatalog
      this._draftReadiness = draftReadiness
    } catch (err) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando datos de storefront.' }
      trackError({ error: err as Error, method: 'CLS_GetMarketplaceAppAuthoring._fetchAuthoringData', controller: 'marketplace' })
    }
  }

  private async _buildResponse(): Promise<void> {
    const app = this._app!
    const draft = this._draftStorefront
    const published = this._publishedStorefront

    this._statusRequest = CONFIG_GET_MARKETPLACE_APP_AUTHORING.RequestStatus.Completed
    this._requestResponse = {
      data: {
        app: {
          id: app.id,
          slug: app.slug,
          name: app.name,
          status: app.status,
          access_mode: app.access_mode,
          web_url: app.web_url,
          summary: app.summary,
          description: app.description,
          instructions: app.instructions,
          has_active_artifact: app.active_artifact !== null
        },
        draft_storefront: {
          id: draft?.id ?? null,
          readiness_status: this._draftReadiness.ready ? 'READY' : 'INCOMPLETE',
          summary: draft?.summary ?? '',
          description: draft?.description ?? '',
          instructions: draft?.instructions ?? '',
          developer_name: draft?.developer_name ?? '',
          developer_website: draft?.developer_website ?? '',
          support_email: draft?.support_email ?? null,
          support_url: draft?.support_url ?? null,
          language_codes: draft?.languages.map((item) => item.language_code) ?? [],
          missing_requirements: this._draftReadiness.missing_requirements,
          updated_at: draft?.updated_at ?? null
        },
        published_storefront: published
          ? {
              id: published.id,
              published_at: published.published_at,
              summary: published.summary,
              description: published.description,
              instructions: published.instructions,
              developer_name: published.developer_name,
              developer_website: published.developer_website,
              support_email: published.support_email,
              support_url: published.support_url,
              language_codes: published.languages.map((item) => item.language_code),
              media: published.media.map((item) => ({
                id: item.media.id,
                type: item.media.type,
                public_url: resolveMarketplaceMediaUrl(item.media.public_url),
                alt_text: item.media.alt_text,
                sort_order: item.sort_order
              }))
            }
          : null,
        draft_media:
          draft?.media.map((item) => ({
            id: item.media.id,
            type: item.media.type,
            public_url: resolveMarketplaceMediaUrl(item.media.public_url),
            alt_text: item.media.alt_text,
            sort_order: item.sort_order,
            storage_key: item.media.storage_key ?? ''
          })) ?? [],
        media_library: this._mediaLibrary.map((media) => ({
          id: media.id,
          type: media.type,
          public_url: resolveMarketplaceMediaUrl(media.public_url),
          alt_text: media.alt_text,
          sort_order: media.sort_order,
          storage_key: media.storage_key ?? ''
        })),
        language_catalog: this._languageCatalog.map((language) => ({
          code: language.code,
          label: language.label,
          sort_order: language.sort_order,
          is_active: language.is_active
        }))
      }
    }
  }
}
