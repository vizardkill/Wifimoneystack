import { UserDB } from '@/core/auth/db/user.db'
import { AppStorefrontVersionMediaDB } from '@/core/marketplace/db/app-storefront-version-media.db'
import { AppStorefrontVersionDB } from '@/core/marketplace/db/app-storefront-version.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'
import { buildStorefrontAuditMeta, writeMarketplaceAuditEvent } from '@lib/helpers/_marketplace-audit.helper'

import { CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA } from '@types'

type RequestStatus = CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestStatus
type RequestResponse = CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestResponse
type Payload = CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.Payload

export class CLS_ReorderMarketplaceAppStorefrontMedia {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  private _draftVersionId = ''
  private _readiness: Awaited<ReturnType<typeof MarketplaceAppDB.evaluateDraftStorefrontReadiness>> = {
    ready: false,
    missing_requirements: []
  }

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._verifyActorRole, this._validatePayload, this._reorderMedia, this._recalculateReadiness, this._writeAudit, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo reordenar la media del storefront.' }
    }

    return this._requestResponse
  }

  private async _verifyActorRole(): Promise<void> {
    try {
      const actor = await UserDB.getById(this._payload.actor_user_id)
      const hasMarketplaceAdminAccess = actor?.role === 'ADMIN' || actor?.role === 'SUPERADMIN'

      if (!hasMarketplaceAdminAccess) {
        this._statusRequest = CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestStatus.Forbidden
        this._requestResponse = {
          error: true,
          message: 'Sin permisos para reordenar media de storefront.',
          status: CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestStatus.Forbidden
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error validando permisos del actor.' }
      trackError({ error: err as Error, method: 'CLS_ReorderMarketplaceAppStorefrontMedia._verifyActorRole', controller: 'marketplace' })
    }
  }

  private async _validatePayload(): Promise<void> {
    const uniqueMediaIds = [...new Set(this._payload.ordered_media_ids)]
    if (uniqueMediaIds.length === 0) {
      this._statusRequest = CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestStatus.Validation
      this._requestResponse = {
        error: true,
        message: 'No se recibieron elementos para reordenar.',
        status: CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestStatus.Validation
      }
      return
    }

    this._payload.ordered_media_ids = uniqueMediaIds
  }

  private async _reorderMedia(): Promise<void> {
    try {
      const draft = await AppStorefrontVersionDB.ensureDraft(this._payload.app_id, this._payload.actor_user_id)
      this._draftVersionId = draft.id

      await AppStorefrontVersionMediaDB.reorderByMediaIds(draft.id, this._payload.ordered_media_ids)
    } catch (err) {
      this._statusRequest = CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error reordenando media de storefront.' }
      trackError({ error: err as Error, method: 'CLS_ReorderMarketplaceAppStorefrontMedia._reorderMedia', controller: 'marketplace' })
    }
  }

  private async _recalculateReadiness(): Promise<void> {
    try {
      this._readiness = await MarketplaceAppDB.evaluateDraftStorefrontReadiness(this._payload.app_id)
      await AppStorefrontVersionDB.updateReadiness(this._draftVersionId, this._readiness.ready ? 'READY' : 'INCOMPLETE')
    } catch (err) {
      this._statusRequest = CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error recalculando readiness tras reordenar media.' }
      trackError({ error: err as Error, method: 'CLS_ReorderMarketplaceAppStorefrontMedia._recalculateReadiness', controller: 'marketplace' })
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
        storefront_version_id: this._draftVersionId,
        storefront_kind: 'DRAFT',
        readiness_status: this._readiness.ready ? 'READY' : 'INCOMPLETE',
        missing_requirements: this._readiness.missing_requirements,
        media_ids: this._payload.ordered_media_ids
      })
    })
  }

  private async _buildResponse(): Promise<void> {
    this._statusRequest = CONFIG_REORDER_MARKETPLACE_APP_STOREFRONT_MEDIA.RequestStatus.Completed
    this._requestResponse = {
      data: {
        app_id: this._payload.app_id,
        ordered_media_ids: this._payload.ordered_media_ids,
        readiness_status: this._readiness.ready ? 'READY' : 'INCOMPLETE',
        missing_requirements: this._readiness.missing_requirements
      }
    }
  }
}
