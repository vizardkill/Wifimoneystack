import { MetaConnectionDB } from '@/core/meta/db/meta-connection.db'
import { toPublicMetaConnection } from '@/core/meta/meta-presenters.server'

import { trackError } from '@lib/functions/_track_error.function'
import type { IMetaConnectionPublic, IMetaServiceResponse } from '@lib/interfaces'

interface Payload {
  user_id: string
}

type Response = IMetaServiceResponse<{ connection: IMetaConnectionPublic | null }>

export class CLS_GetMetaConnection {
  constructor(private readonly _payload: Payload) {}

  public async main(): Promise<Response> {
    try {
      const connection = await MetaConnectionDB.findByUserId(this._payload.user_id)
      return {
        data: {
          connection: connection ? toPublicMetaConnection(connection) : null
        }
      }
    } catch (error) {
      trackError({
        error: error as Error,
        method: 'CLS_GetMetaConnection.main',
        controller: 'meta',
        additionalContext: { user_id: this._payload.user_id }
      })

      return { error: true, message: 'No se pudo cargar la conexión de Meta.' }
    }
  }
}
