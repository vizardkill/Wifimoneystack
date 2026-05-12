import type { MarketplaceAccessStatus } from '@prisma/client'

import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'

import { trackError } from '@lib/functions/_track_error.function'

import { CONFIG_LIST_MARKETPLACE_ACCESS_REQUESTS } from '@types'

type RequestStatus = CONFIG_LIST_MARKETPLACE_ACCESS_REQUESTS.RequestStatus
type RequestResponse = CONFIG_LIST_MARKETPLACE_ACCESS_REQUESTS.RequestResponse
type Payload = CONFIG_LIST_MARKETPLACE_ACCESS_REQUESTS.Payload

export class CLS_ListMarketplaceAccessRequests {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_LIST_MARKETPLACE_ACCESS_REQUESTS.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._fetchRequests, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_LIST_MARKETPLACE_ACCESS_REQUESTS.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_LIST_MARKETPLACE_ACCESS_REQUESTS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudieron cargar las solicitudes de acceso.' }
    }

    return this._requestResponse
  }

  private _result: Awaited<ReturnType<typeof AccessRequestDB.listWithUser>> = { requests: [], total: 0 }

  private async _fetchRequests(): Promise<void> {
    try {
      this._result = await AccessRequestDB.listWithUser({
        status: this._payload.status_filter as MarketplaceAccessStatus | undefined,
        page: this._payload.page ?? 1,
        per_page: this._payload.per_page ?? 20
      })
    } catch (err) {
      this._statusRequest = CONFIG_LIST_MARKETPLACE_ACCESS_REQUESTS.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando solicitudes de acceso.' }
      trackError({ error: err as Error, method: 'CLS_ListMarketplaceAccessRequests._fetchRequests', controller: 'marketplace' })
    }
  }

  private async _buildResponse(): Promise<void> {
    this._statusRequest = CONFIG_LIST_MARKETPLACE_ACCESS_REQUESTS.RequestStatus.Completed
    this._requestResponse = {
      data: {
        requests: this._result.requests.map((r) => ({
          id: r.id,
          user_id: r.user_id,
          user_email: r.user.email,
          user_name: r.user.name,
          status: r.status,
          company_name: r.company_name,
          business_url: r.business_url,
          created_at: r.created_at,
          decided_at: r.decided_at,
          updated_at: r.updated_at
        })),
        total: this._result.total,
        page: this._payload.page ?? 1,
        per_page: this._payload.per_page ?? 20
      }
    }
  }
}
