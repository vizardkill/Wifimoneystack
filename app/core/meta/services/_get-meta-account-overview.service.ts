import { MetaConnectionDB } from '@/core/meta/db/meta-connection.db'
import { fetchMetaAccountOverview, shouldMarkMetaConnectionForReconnect } from '@/core/meta/meta-api.server'
import { toPublicMetaConnection } from '@/core/meta/meta-presenters.server'

import { trackError } from '@lib/functions/_track_error.function'
import type { IMetaAccountOverview, IMetaConnectionPublic, IMetaServiceResponse } from '@lib/interfaces'
import { decryptToken } from '@lib/token-crypto'

interface Payload {
  user_id: string
  since: string
  until: string
}

interface ResponseData {
  connection: IMetaConnectionPublic
  overview: IMetaAccountOverview
}

type Response = IMetaServiceResponse<ResponseData>

export class CLS_GetMetaAccountOverview {
  constructor(private readonly _payload: Payload) {}

  public async main(): Promise<Response> {
    try {
      const connection = await MetaConnectionDB.findByUserId(this._payload.user_id)
      if (!connection) {
        return { error: true, message: 'Primero debes conectar una cuenta de Meta.' }
      }

      const accessToken = decryptToken(connection.encrypted_access_token)
      const overviewResult = await fetchMetaAccountOverview({
        accessToken,
        adAccountId: connection.ad_account_id,
        since: this._payload.since,
        until: this._payload.until
      })

      if (!overviewResult.ok) {
        const nextStatus: 'ACTIVE' | 'RECONNECT_REQUIRED' = shouldMarkMetaConnectionForReconnect(overviewResult) ? 'RECONNECT_REQUIRED' : 'ACTIVE'
        await MetaConnectionDB.updateValidationState({
          user_id: this._payload.user_id,
          status: nextStatus,
          last_error: overviewResult.message
        })

        return {
          error: true,
          message: overviewResult.message
        }
      }

      const updatedConnection =
        (await MetaConnectionDB.updateValidationState({
          user_id: this._payload.user_id,
          status: 'ACTIVE',
          last_error: null,
          last_validated_at: new Date()
        })) ?? connection

      const overview = {
        ...overviewResult.overview,
        account_name: overviewResult.overview.account_name ?? updatedConnection.account_name,
        account_currency: overviewResult.overview.account_currency ?? updatedConnection.account_currency
      }

      return {
        data: {
          connection: toPublicMetaConnection(updatedConnection),
          overview
        }
      }
    } catch (error) {
      trackError({
        error: error as Error,
        method: 'CLS_GetMetaAccountOverview.main',
        controller: 'meta',
        additionalContext: {
          user_id: this._payload.user_id,
          since: this._payload.since,
          until: this._payload.until
        }
      })

      return { error: true, message: 'No se pudo consultar el resumen de Meta.' }
    }
  }
}
