import { MetaConnectionDB } from '@/core/meta/db/meta-connection.db'

import { trackError } from '@lib/functions/_track_error.function'
import type { IMetaServiceResponse } from '@lib/interfaces'

interface Payload {
  user_id: string
}

type Response = IMetaServiceResponse<{ deleted: boolean }>

export class CLS_DeleteMetaConnection {
  constructor(private readonly _payload: Payload) {}

  public async main(): Promise<Response> {
    try {
      const deleted = await MetaConnectionDB.deleteByUserId(this._payload.user_id)
      return {
        data: {
          deleted
        }
      }
    } catch (error) {
      trackError({
        error: error as Error,
        method: 'CLS_DeleteMetaConnection.main',
        controller: 'meta',
        additionalContext: { user_id: this._payload.user_id }
      })

      return {
        error: true,
        message: 'No se pudo eliminar la conexión de Meta.'
      }
    }
  }
}
