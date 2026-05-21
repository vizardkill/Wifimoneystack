import { MetaConnectionDB } from '@/core/meta/db/meta-connection.db'
import { validateMetaAdAccountConnection } from '@/core/meta/meta-api.server'
import { toPublicMetaConnection } from '@/core/meta/meta-presenters.server'

import { trackError } from '@lib/functions/_track_error.function'
import type { IMetaConnectionPublic, IMetaServiceResponse, IUpsertMetaConnectionInput } from '@lib/interfaces'
import { encryptToken } from '@lib/token-crypto'

interface ResponseData {
  connection: IMetaConnectionPublic
}

type Response = IMetaServiceResponse<ResponseData>

export class CLS_UpsertMetaConnection {
  constructor(private readonly _payload: IUpsertMetaConnectionInput) {}

  public async main(): Promise<Response> {
    const validation = await validateMetaAdAccountConnection({
      accessToken: this._payload.access_token,
      adAccountId: this._payload.ad_account_id,
      businessId: this._payload.business_id
    })

    if (!validation.ok) {
      return {
        error: true,
        message: validation.message
      }
    }

    try {
      const encryptedAccessToken = encryptToken(this._payload.access_token)
      const savedConnection = await MetaConnectionDB.upsert({
        user_id: this._payload.user_id,
        encrypted_access_token: encryptedAccessToken,
        ad_account_id: validation.account.ad_account_id,
        business_id: validation.account.business_id,
        token_label: this._payload.token_label,
        status: 'ACTIVE',
        account_name: validation.account.account_name,
        account_currency: validation.account.account_currency,
        timezone_name: validation.account.timezone_name,
        timezone_offset_hours: validation.account.timezone_offset_hours,
        last_validated_at: new Date(),
        last_error: null,
        metadata: {
          meta_account_node_id: validation.account.meta_account_node_id
        }
      })

      return {
        data: {
          connection: toPublicMetaConnection(savedConnection)
        }
      }
    } catch (error) {
      trackError({
        error: error as Error,
        method: 'CLS_UpsertMetaConnection.main',
        controller: 'meta',
        additionalContext: {
          user_id: this._payload.user_id,
          ad_account_id: this._payload.ad_account_id
        }
      })

      return {
        error: true,
        message: 'No se pudo guardar la conexión de Meta.'
      }
    }
  }
}
