import { UserDB } from '@/core/auth/db/user.db'
import { AppStorefrontVersionLanguageDB } from '@/core/marketplace/db/app-storefront-version-language.db'
import { AppStorefrontVersionDB } from '@/core/marketplace/db/app-storefront-version.db'
import { LanguageCatalogDB } from '@/core/marketplace/db/language-catalog.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'
import { buildStorefrontAuditMeta, writeMarketplaceAuditEvent } from '@lib/helpers/_marketplace-audit.helper'

import { CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT } from '@types'

type RequestStatus = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus
type RequestResponse = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestResponse
type Payload = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.Payload

export class CLS_SaveMarketplaceAppStorefrontDraft {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  private _draftVersion: Awaited<ReturnType<typeof AppStorefrontVersionDB.findById>> = null
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
      this._validateLanguageCodes,
      this._saveDraftScalars,
      this._replaceLanguageMembership,
      this._recalculateReadiness,
      this._writeAudit,
      this._buildResponse
    ]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo guardar el borrador de storefront.' }
    }

    return this._requestResponse
  }

  private async _verifyActorRole(): Promise<void> {
    try {
      const actor = await UserDB.getById(this._payload.actor_user_id)
      const hasMarketplaceAdminAccess = actor?.role === 'ADMIN' || actor?.role === 'SUPERADMIN'

      if (!hasMarketplaceAdminAccess) {
        this._statusRequest = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Forbidden
        this._requestResponse = {
          error: true,
          message: 'Sin permisos para guardar borradores de storefront.',
          status: CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Forbidden
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error validando permisos del actor.' }
      trackError({ error: err as Error, method: 'CLS_SaveMarketplaceAppStorefrontDraft._verifyActorRole', controller: 'marketplace' })
    }
  }

  private async _verifyAppExists(): Promise<void> {
    try {
      const app = await MarketplaceAppDB.findById(this._payload.app_id)
      if (!app) {
        this._statusRequest = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.NotFound
        this._requestResponse = {
          error: true,
          message: 'Aplicación no encontrada para guardar borrador.',
          status: CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.NotFound
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando la app para guardar borrador.' }
      trackError({ error: err as Error, method: 'CLS_SaveMarketplaceAppStorefrontDraft._verifyAppExists', controller: 'marketplace' })
    }
  }

  private async _validateLanguageCodes(): Promise<void> {
    try {
      const uniqueCodes = [...new Set(this._payload.language_codes)]
      if (uniqueCodes.length === 0) {
        this._payload.language_codes = []
        return
      }

      const validCount = await LanguageCatalogDB.countActiveByCodes(uniqueCodes)
      if (validCount !== uniqueCodes.length) {
        this._statusRequest = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Validation
        this._requestResponse = {
          error: true,
          message: 'Hay idiomas inválidos o inactivos en la selección.',
          status: CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Validation,
          field_errors: {
            language_codes: 'Selecciona únicamente idiomas activos del catálogo.'
          }
        }
        return
      }

      this._payload.language_codes = uniqueCodes
    } catch (err) {
      this._statusRequest = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error validando idiomas seleccionados.' }
      trackError({ error: err as Error, method: 'CLS_SaveMarketplaceAppStorefrontDraft._validateLanguageCodes', controller: 'marketplace' })
    }
  }

  private async _saveDraftScalars(): Promise<void> {
    try {
      this._draftVersion = await AppStorefrontVersionDB.upsertByAppKind({
        app_id: this._payload.app_id,
        kind: 'DRAFT',
        actor_user_id: this._payload.actor_user_id,
        summary: this._payload.summary,
        description: this._payload.description,
        instructions: this._payload.instructions,
        developer_name: this._payload.developer_name,
        developer_website: this._payload.developer_website,
        support_email: this._payload.support_email,
        support_url: this._payload.support_url
      })
    } catch (err) {
      this._statusRequest = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error guardando contenido del borrador.' }
      trackError({ error: err as Error, method: 'CLS_SaveMarketplaceAppStorefrontDraft._saveDraftScalars', controller: 'marketplace' })
    }
  }

  private async _replaceLanguageMembership(): Promise<void> {
    try {
      await AppStorefrontVersionLanguageDB.replaceByStorefrontVersion(this._draftVersion!.id, this._payload.language_codes)
    } catch (err) {
      this._statusRequest = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error reemplazando idiomas del borrador.' }
      trackError({ error: err as Error, method: 'CLS_SaveMarketplaceAppStorefrontDraft._replaceLanguageMembership', controller: 'marketplace' })
    }
  }

  private async _recalculateReadiness(): Promise<void> {
    try {
      this._readiness = await MarketplaceAppDB.evaluateDraftStorefrontReadiness(this._payload.app_id)
      this._draftVersion = await AppStorefrontVersionDB.updateReadiness(this._draftVersion!.id, this._readiness.ready ? 'READY' : 'INCOMPLETE')
    } catch (err) {
      this._statusRequest = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error recalculando readiness del borrador.' }
      trackError({ error: err as Error, method: 'CLS_SaveMarketplaceAppStorefrontDraft._recalculateReadiness', controller: 'marketplace' })
    }
  }

  private async _writeAudit(): Promise<void> {
    await writeMarketplaceAuditEvent({
      actor_user_id: this._payload.actor_user_id,
      app_id: this._payload.app_id,
      action: 'APP_STOREFRONT_DRAFT_SAVED',
      metadata: buildStorefrontAuditMeta({
        app_id: this._payload.app_id,
        action: 'APP_STOREFRONT_DRAFT_SAVED',
        storefront_version_id: this._draftVersion?.id,
        storefront_kind: 'DRAFT',
        readiness_status: this._readiness.ready ? 'READY' : 'INCOMPLETE',
        missing_requirements: this._readiness.missing_requirements
      })
    })
  }

  private async _buildResponse(): Promise<void> {
    this._statusRequest = CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT.RequestStatus.Completed
    this._requestResponse = {
      data: {
        app_id: this._payload.app_id,
        storefront_version_id: this._draftVersion!.id,
        readiness_status: this._readiness.ready ? 'READY' : 'INCOMPLETE',
        missing_requirements: this._readiness.missing_requirements,
        updated_at: this._draftVersion!.updated_at
      }
    }
  }
}
