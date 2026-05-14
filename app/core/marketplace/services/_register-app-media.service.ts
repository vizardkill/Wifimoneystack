import { UserDB } from '@/core/auth/db/user.db'
import { AppMediaDB } from '@/core/marketplace/db/app-media.db'
import { AppStorefrontVersionMediaDB } from '@/core/marketplace/db/app-storefront-version-media.db'
import { AppStorefrontVersionDB } from '@/core/marketplace/db/app-storefront-version.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'
import { buildStorefrontAuditMeta, writeMarketplaceAuditEvent } from '@lib/helpers/_marketplace-audit.helper'

import { CONFIG_REGISTER_MARKETPLACE_APP_MEDIA } from '@types'

type RequestStatus = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus
type RequestResponse = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestResponse
type Payload = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.Payload

export class CLS_RegisterMarketplaceAppMedia {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  private _registeredMedia: Awaited<ReturnType<typeof AppMediaDB.findById>> = null
  private _draftVersionId = ''
  private _readiness: Awaited<ReturnType<typeof MarketplaceAppDB.evaluateDraftStorefrontReadiness>> = {
    ready: false,
    missing_requirements: []
  }

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [
      this._verifyActorRole,
      this._verifyAppExists,
      this._validatePayload,
      this._registerRawMedia,
      this._attachToDraftIfRequested,
      this._recalculateReadiness,
      this._writeAudit,
      this._buildResponse
    ]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo registrar media para storefront.' }
    }

    return this._requestResponse
  }

  private async _verifyActorRole(): Promise<void> {
    try {
      const actor = await UserDB.getById(this._payload.actor_user_id)
      const hasMarketplaceAdminAccess = actor?.role === 'ADMIN' || actor?.role === 'SUPERADMIN'

      if (!hasMarketplaceAdminAccess) {
        this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Forbidden
        this._requestResponse = {
          error: true,
          message: 'Sin permisos para registrar media de storefront.',
          status: CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Forbidden
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error validando permisos del actor.' }
      trackError({ error: err as Error, method: 'CLS_RegisterMarketplaceAppMedia._verifyActorRole', controller: 'marketplace' })
    }
  }

  private async _verifyAppExists(): Promise<void> {
    try {
      const app = await MarketplaceAppDB.findById(this._payload.app_id)
      if (!app) {
        this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.NotFound
        this._requestResponse = {
          error: true,
          message: 'Aplicación no encontrada para registrar media.',
          status: CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.NotFound
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando la app para registrar media.' }
      trackError({ error: err as Error, method: 'CLS_RegisterMarketplaceAppMedia._verifyAppExists', controller: 'marketplace' })
    }
  }

  private async _validatePayload(): Promise<void> {
    if (this._payload.media_type === 'VIDEO') {
      if (!this._payload.external_video_url) {
        this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Validation
        this._requestResponse = {
          error: true,
          message: 'La URL externa es obligatoria para videos.',
          status: CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Validation,
          field_errors: {
            external_video_url: 'Ingresa una URL de video válida.'
          }
        }
      }
      return
    }

    if (!this._payload.storage_key) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Validation
      this._requestResponse = {
        error: true,
        message: 'La llave de storage es obligatoria para iconos y capturas.',
        status: CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Validation,
        field_errors: {
          storage_key: 'Proporciona la llave del archivo subido.'
        }
      }
    }
  }

  private async _registerRawMedia(): Promise<void> {
    try {
      const currentCount = await AppMediaDB.countByAppAndType(this._payload.app_id, this._payload.media_type)

      const media = await AppMediaDB.create({
        app_id: this._payload.app_id,
        type: this._payload.media_type,
        storage_key: this._payload.media_type === 'VIDEO' ? null : this._payload.storage_key,
        public_url: this._payload.media_type === 'VIDEO' ? this._payload.external_video_url : this._payload.public_url,
        alt_text: this._payload.alt_text,
        sort_order: currentCount
      })

      this._registeredMedia = media
    } catch (err) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error registrando media en la librería de la app.' }
      trackError({ error: err as Error, method: 'CLS_RegisterMarketplaceAppMedia._registerRawMedia', controller: 'marketplace' })
    }
  }

  private async _attachToDraftIfRequested(): Promise<void> {
    const shouldAttach = this._payload.attach_to_draft !== false

    if (!shouldAttach) {
      return
    }

    try {
      const draftVersion = await AppStorefrontVersionDB.ensureDraft(this._payload.app_id, this._payload.actor_user_id)
      this._draftVersionId = draftVersion.id

      if (this._registeredMedia?.type === 'ICON') {
        const draftMedia = await AppStorefrontVersionMediaDB.listByStorefrontVersion(draftVersion.id)
        const currentIcons = draftMedia.filter((item) => item.media.type === 'ICON')

        await Promise.all(currentIcons.map((item) => AppStorefrontVersionMediaDB.detachMedia(draftVersion.id, item.media_id)))
      }

      await AppStorefrontVersionMediaDB.attachMedia(draftVersion.id, this._registeredMedia!.id)
    } catch (err) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error adjuntando media al borrador de storefront.' }
      trackError({ error: err as Error, method: 'CLS_RegisterMarketplaceAppMedia._attachToDraftIfRequested', controller: 'marketplace' })
    }
  }

  private async _recalculateReadiness(): Promise<void> {
    try {
      this._readiness = await MarketplaceAppDB.evaluateDraftStorefrontReadiness(this._payload.app_id)

      if (this._draftVersionId.length > 0) {
        await AppStorefrontVersionDB.updateReadiness(this._draftVersionId, this._readiness.ready ? 'READY' : 'INCOMPLETE')
      }
    } catch (err) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error recalculando readiness tras registrar media.' }
      trackError({ error: err as Error, method: 'CLS_RegisterMarketplaceAppMedia._recalculateReadiness', controller: 'marketplace' })
    }
  }

  private async _writeAudit(): Promise<void> {
    await writeMarketplaceAuditEvent({
      actor_user_id: this._payload.actor_user_id,
      app_id: this._payload.app_id,
      action: 'APP_STOREFRONT_MEDIA_UPDATED',
      metadata: buildStorefrontAuditMeta({
        app_id: this._payload.app_id,
        action: 'APP_STOREFRONT_MEDIA_UPDATED',
        storefront_version_id: this._draftVersionId || undefined,
        storefront_kind: 'DRAFT',
        readiness_status: this._readiness.ready ? 'READY' : 'INCOMPLETE',
        missing_requirements: this._readiness.missing_requirements,
        media_ids: this._registeredMedia ? [this._registeredMedia.id] : []
      })
    })
  }

  private async _buildResponse(): Promise<void> {
    this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_MEDIA.RequestStatus.Completed
    this._requestResponse = {
      data: {
        app_id: this._payload.app_id,
        media: {
          id: this._registeredMedia!.id,
          type: this._registeredMedia!.type,
          storage_key: this._registeredMedia!.storage_key ?? '',
          public_url: this._registeredMedia!.public_url,
          alt_text: this._registeredMedia!.alt_text,
          sort_order: this._registeredMedia!.sort_order
        },
        attached_to_draft: this._payload.attach_to_draft !== false,
        readiness_status: this._readiness.ready ? 'READY' : 'INCOMPLETE',
        missing_requirements: this._readiness.missing_requirements
      }
    }
  }
}
