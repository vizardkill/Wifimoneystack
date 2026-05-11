import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'
import { writeMarketplaceAuditEvent } from '@lib/helpers/_marketplace-audit.helper'

import { CONFIG_UPSERT_MARKETPLACE_APP } from '@types'

type RequestStatus = CONFIG_UPSERT_MARKETPLACE_APP.RequestStatus
type RequestResponse = CONFIG_UPSERT_MARKETPLACE_APP.RequestResponse
type Payload = CONFIG_UPSERT_MARKETPLACE_APP.Payload

export class CLS_UpsertMarketplaceApp {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_UPSERT_MARKETPLACE_APP.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null
  private _appId = ''
  private _appSlug = ''

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._upsertApp, this._writeAudit, this._buildSuccess]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_UPSERT_MARKETPLACE_APP.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_UPSERT_MARKETPLACE_APP.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo guardar la aplicación.' }
    }

    return this._requestResponse
  }

  private async _upsertApp(): Promise<void> {
    try {
      const app = await MarketplaceAppDB.upsert(this._payload)
      this._appId = app.id
      this._appSlug = app.slug
    } catch (err) {
      this._statusRequest = CONFIG_UPSERT_MARKETPLACE_APP.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error guardando la aplicación.' }
      trackError({ error: err as Error, method: 'CLS_UpsertMarketplaceApp._upsertApp', controller: 'marketplace' })
    }
  }

  private async _writeAudit(): Promise<void> {
    const action = this._payload.id ? 'APP_UPDATED' : 'APP_CREATED'
    await writeMarketplaceAuditEvent({
      actor_user_id: this._payload.actor_user_id,
      app_id: this._appId,
      action: action,
      metadata: { app_id: this._appId, slug: this._appSlug }
    })
  }

  private async _buildSuccess(): Promise<void> {
    this._statusRequest = CONFIG_UPSERT_MARKETPLACE_APP.RequestStatus.Completed
    this._requestResponse = { data: { app_id: this._appId, slug: this._appSlug } }
  }
}
