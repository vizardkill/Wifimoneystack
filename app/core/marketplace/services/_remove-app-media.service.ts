import { UserDB } from '@/core/auth/db/user.db'
import { AppMediaDB } from '@/core/marketplace/db/app-media.db'
import { AppStorefrontVersionMediaDB } from '@/core/marketplace/db/app-storefront-version-media.db'
import { AppStorefrontVersionDB } from '@/core/marketplace/db/app-storefront-version.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'
import { buildStorefrontAuditMeta, writeMarketplaceAuditEvent } from '@lib/helpers/_marketplace-audit.helper'

import { CONFIG_REMOVE_MARKETPLACE_APP_MEDIA } from '@types'

type RequestStatus = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus
type RequestResponse = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestResponse
type Payload = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.Payload

export class CLS_RemoveMarketplaceAppMedia {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  private _draftVersionId = ''
  private _detachedFromDraft = false
  private _removedFromLibrary = false
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
      this._validateMediaOwnership,
      this._detachFromDraftIfRequested,
      this._removeFromLibraryIfRequested,
      this._recalculateReadiness,
      this._writeAudit,
      this._buildResponse
    ]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo remover media del storefront.' }
    }

    return this._requestResponse
  }

  private async _verifyActorRole(): Promise<void> {
    try {
      const actor = await UserDB.getById(this._payload.actor_user_id)
      const hasMarketplaceAdminAccess = actor?.role === 'ADMIN' || actor?.role === 'SUPERADMIN'

      if (!hasMarketplaceAdminAccess) {
        this._statusRequest = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.Forbidden
        this._requestResponse = {
          error: true,
          message: 'Sin permisos para remover media de storefront.',
          status: CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.Forbidden
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error validando permisos del actor.' }
      trackError({ error: err as Error, method: 'CLS_RemoveMarketplaceAppMedia._verifyActorRole', controller: 'marketplace' })
    }
  }

  private async _validateMediaOwnership(): Promise<void> {
    try {
      const media = await AppMediaDB.findById(this._payload.media_id)
      if (media?.app_id !== this._payload.app_id) {
        this._statusRequest = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.NotFound
        this._requestResponse = {
          error: true,
          message: 'Media no encontrada para esta app.',
          status: CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.NotFound
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error validando media de la app.' }
      trackError({ error: err as Error, method: 'CLS_RemoveMarketplaceAppMedia._validateMediaOwnership', controller: 'marketplace' })
    }
  }

  private async _detachFromDraftIfRequested(): Promise<void> {
    const shouldDetachFromDraft = this._payload.detach_from_draft !== false

    if (!shouldDetachFromDraft) {
      return
    }

    try {
      const draft = await AppStorefrontVersionDB.ensureDraft(this._payload.app_id, this._payload.actor_user_id)
      this._draftVersionId = draft.id

      await AppStorefrontVersionMediaDB.detachMedia(draft.id, this._payload.media_id)
      this._detachedFromDraft = true
    } catch (err) {
      this._statusRequest = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error removiendo media del borrador.' }
      trackError({ error: err as Error, method: 'CLS_RemoveMarketplaceAppMedia._detachFromDraftIfRequested', controller: 'marketplace' })
    }
  }

  private async _removeFromLibraryIfRequested(): Promise<void> {
    if (!this._payload.remove_from_library) {
      return
    }

    try {
      await AppMediaDB.delete(this._payload.media_id)
      this._removedFromLibrary = true
    } catch (err) {
      this._statusRequest = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error removiendo media de la librería de app.' }
      trackError({ error: err as Error, method: 'CLS_RemoveMarketplaceAppMedia._removeFromLibraryIfRequested', controller: 'marketplace' })
    }
  }

  private async _recalculateReadiness(): Promise<void> {
    try {
      this._readiness = await MarketplaceAppDB.evaluateDraftStorefrontReadiness(this._payload.app_id)

      if (this._draftVersionId.length > 0) {
        await AppStorefrontVersionDB.updateReadiness(this._draftVersionId, this._readiness.ready ? 'READY' : 'INCOMPLETE')
      }
    } catch (err) {
      this._statusRequest = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error recalculando readiness tras remover media.' }
      trackError({ error: err as Error, method: 'CLS_RemoveMarketplaceAppMedia._recalculateReadiness', controller: 'marketplace' })
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
        media_ids: [this._payload.media_id]
      })
    })
  }

  private async _buildResponse(): Promise<void> {
    this._statusRequest = CONFIG_REMOVE_MARKETPLACE_APP_MEDIA.RequestStatus.Completed
    this._requestResponse = {
      data: {
        app_id: this._payload.app_id,
        media_id: this._payload.media_id,
        detached_from_draft: this._detachedFromDraft,
        removed_from_library: this._removedFromLibrary,
        readiness_status: this._readiness.ready ? 'READY' : 'INCOMPLETE',
        missing_requirements: this._readiness.missing_requirements
      }
    }
  }
}
