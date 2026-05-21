import type { UserMetaConnection } from '@prisma/client'

import type { IMetaConnectionPublic } from '@lib/interfaces'

export function toPublicMetaConnection(connection: UserMetaConnection): IMetaConnectionPublic {
  return {
    id: connection.id,
    token_label: connection.token_label,
    ad_account_id: connection.ad_account_id,
    business_id: connection.business_id,
    status: connection.status as IMetaConnectionPublic['status'],
    account_name: connection.account_name,
    account_currency: connection.account_currency,
    timezone_name: connection.timezone_name,
    timezone_offset_hours: connection.timezone_offset_hours,
    last_validated_at: connection.last_validated_at,
    last_error: connection.last_error,
    created_at: connection.created_at,
    updated_at: connection.updated_at
  }
}
