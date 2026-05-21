import { type ActionFunctionArgs, data, type LoaderFunctionArgs } from 'react-router'

import { getMarketplaceAuthorizedRequestUser } from '@/core/auth/authenticated-user.server'

import { validateRequest } from '@lib/helpers/_parse-request.helper'
import { UpsertMetaConnectionSchema } from '@lib/schemas'

export async function loader({ request }: LoaderFunctionArgs) {
  const auth = await getMarketplaceAuthorizedRequestUser(request)
  if (!auth.ok) {
    return data({ error: true, message: auth.message }, { status: auth.status })
  }

  const { CLS_GetMetaConnection } = await import('@/core/meta/meta.server')
  const result = await new CLS_GetMetaConnection({ user_id: auth.user.id }).main()
  return data(result, { status: result.error ? 400 : 200 })
}

export async function action({ request }: ActionFunctionArgs) {
  const auth = await getMarketplaceAuthorizedRequestUser(request)
  if (!auth.ok) {
    return data({ error: true, message: auth.message }, { status: auth.status })
  }

  if (request.method === 'DELETE') {
    const { CLS_DeleteMetaConnection } = await import('@/core/meta/meta.server')
    const result = await new CLS_DeleteMetaConnection({ user_id: auth.user.id }).main()
    return data(result, { status: result.error ? 400 : 200 })
  }

  if (request.method !== 'POST') {
    return data({ error: true, message: 'Método no soportado.' }, { status: 405 })
  }

  const validation = await validateRequest(request, UpsertMetaConnectionSchema)
  if (!validation.success) {
    return validation.response
  }

  const { CLS_UpsertMetaConnection } = await import('@/core/meta/meta.server')
  const result = await new CLS_UpsertMetaConnection({
    user_id: auth.user.id,
    access_token: validation.data.access_token,
    ad_account_id: validation.data.ad_account_id,
    business_id: validation.data.business_id,
    token_label: validation.data.token_label
  }).main()

  return data(result, { status: result.error ? 400 : 200 })
}
