import { UserDB } from '@/core/auth/db/user.db'
import { AppStorefrontVersionDB } from '@/core/marketplace/db/app-storefront-version.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'
import { buildStorefrontAuditMeta, writeMarketplaceAuditEvent } from '@lib/helpers/_marketplace-audit.helper'

import { CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT } from '@types'

type RequestStatus = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus
type RequestResponse = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestResponse
type Payload = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.Payload

export class CLS_PublishMarketplaceAppStorefront {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  private _publishedVersion: Awaited<ReturnType<typeof AppStorefrontVersionDB.findById>> = null
  private _readiness: Awaited<ReturnType<typeof MarketplaceAppDB.evaluateDraftStorefrontReadiness>> = {
    ready: false,
    missing_requirements: []
  }

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._verifyActorRole, this._verifyAppExists, this._validateDraftReadiness, this._publishDraft, this._writeAudit, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo publicar el storefront.' }
    }

    return this._requestResponse
  }

  private async _verifyActorRole(): Promise<void> {
    try {
      const actor = await UserDB.getById(this._payload.actor_user_id)
      const hasMarketplaceAdminAccess = actor?.role === 'ADMIN' || actor?.role === 'SUPERADMIN'

      if (!hasMarketplaceAdminAccess) {
        this._statusRequest = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.Forbidden
        this._requestResponse = {
          error: true,
          message: 'Sin permisos para publicar storefront.',
          status: CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.Forbidden
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error validando permisos del actor.' }
      trackError({ error: err as Error, method: 'CLS_PublishMarketplaceAppStorefront._verifyActorRole', controller: 'marketplace' })
    }
  }

  private async _verifyAppExists(): Promise<void> {
    try {
      const app = await MarketplaceAppDB.findById(this._payload.app_id)
      if (!app) {
        this._statusRequest = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.NotFound
        this._requestResponse = {
          error: true,
          message: 'Aplicación no encontrada para publicar storefront.',
          status: CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.NotFound
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando la app para publicar storefront.' }
      trackError({ error: err as Error, method: 'CLS_PublishMarketplaceAppStorefront._verifyAppExists', controller: 'marketplace' })
    }
  }

  private async _validateDraftReadiness(): Promise<void> {
    try {
      this._readiness = await MarketplaceAppDB.evaluateDraftStorefrontReadiness(this._payload.app_id)

      const draft = await AppStorefrontVersionDB.findByAppAndKind(this._payload.app_id, 'DRAFT')
      if (!draft) {
        this._statusRequest = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.NotFound
        this._requestResponse = {
          error: true,
          message: 'No existe un borrador de storefront para publicar.',
          status: CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.NotFound
        }
        return
      }

      await AppStorefrontVersionDB.updateReadiness(draft.id, this._readiness.ready ? 'READY' : 'INCOMPLETE')

      if (!this._readiness.ready) {
        this._statusRequest = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.ValidationFailed
        this._requestResponse = {
          error: true,
          message: `Faltan requisitos para publicar: ${this._readiness.missing_requirements.join(', ')}.`,
          status: CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.ValidationFailed
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error validando readiness del borrador.' }
      trackError({ error: err as Error, method: 'CLS_PublishMarketplaceAppStorefront._validateDraftReadiness', controller: 'marketplace' })
    }
  }

  private async _publishDraft(): Promise<void> {
    try {
      this._publishedVersion = await AppStorefrontVersionDB.replacePublishedFromDraft({
        app_id: this._payload.app_id,
        actor_user_id: this._payload.actor_user_id,
        published_at: new Date()
      })
    } catch (err) {
      this._statusRequest = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error promoviendo borrador a versión pública.' }
      trackError({ error: err as Error, method: 'CLS_PublishMarketplaceAppStorefront._publishDraft', controller: 'marketplace' })
    }
  }

  private async _writeAudit(): Promise<void> {
    await writeMarketplaceAuditEvent({
      actor_user_id: this._payload.actor_user_id,
      app_id: this._payload.app_id,
      action: 'APP_STOREFRONT_PUBLISHED',
      metadata: buildStorefrontAuditMeta({
        app_id: this._payload.app_id,
        action: 'APP_STOREFRONT_PUBLISHED',
        storefront_version_id: this._publishedVersion?.id,
        storefront_kind: 'PUBLISHED',
        readiness_status: 'READY',
        missing_requirements: []
      })
    })
  }

  private async _buildResponse(): Promise<void> {
    this._statusRequest = CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT.RequestStatus.Completed
    this._requestResponse = {
      data: {
        app_id: this._payload.app_id,
        published_storefront_version_id: this._publishedVersion!.id,
        published_at: this._publishedVersion!.published_at ?? new Date()
      }
    }
  }
}
