import type { JSX } from 'react'

import { type ActionFunctionArgs, data, type LoaderFunctionArgs, redirect } from 'react-router'
import { useActionData, useLoaderData, useNavigation } from 'react-router'

import { MarketplaceAdminUsersShell } from '@modules/marketplace/admin/users'

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_ListMarketplaceAccessRequests } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }
  const hasMarketplaceAdminAccess = user.role === 'ADMIN' || user.role === 'SUPERADMIN'
  if (!hasMarketplaceAdminAccess) {
    throw redirect('/dashboard')
  }

  const url = new URL(request.url)
  const statusFilter = url.searchParams.get('status') ?? undefined
  const page = Number(url.searchParams.get('page') ?? '1')

  const result = await new CLS_ListMarketplaceAccessRequests({
    status_filter: statusFilter,
    page,
    per_page: 20
  }).main()

  return data({
    requests: result.data?.requests ?? [],
    total: result.data?.total ?? 0,
    page: result.data?.page ?? 1,
    per_page: result.data?.per_page ?? 20,
    status_filter: statusFilter ?? '',
    actor_id: user.id,
    error: result.error ? (result.message ?? 'No se pudieron listar las solicitudes.') : null
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_DecideMarketplaceAccessRequest, CLS_RevokeMarketplaceAccess } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }
  const hasMarketplaceAdminAccess = user.role === 'ADMIN' || user.role === 'SUPERADMIN'
  if (!hasMarketplaceAdminAccess) {
    return data({ error: true, message: 'Sin permisos.' }, { status: 403 })
  }

  const formData = await request.formData()
  const intent = formData.get('intent') as string
  const request_id = formData.get('request_id') as string
  const reason = formData.get('reason') as string | undefined
  const expectedUpdatedAtRaw = formData.get('expected_updated_at') as string | null
  const expectedUpdatedAtCandidate = expectedUpdatedAtRaw ? new Date(expectedUpdatedAtRaw) : undefined
  const expected_updated_at = expectedUpdatedAtCandidate && !Number.isNaN(expectedUpdatedAtCandidate.getTime()) ? expectedUpdatedAtCandidate : undefined

  let result: { error?: boolean; message?: string; status?: string } | null = null

  if (intent === 'revoke') {
    result = await new CLS_RevokeMarketplaceAccess({
      request_id,
      actor_user_id: user.id,
      reason: reason ?? '',
      expected_updated_at
    }).main()
  } else if (intent === 'approve' || intent === 'reject') {
    result = await new CLS_DecideMarketplaceAccessRequest({
      request_id,
      actor_user_id: user.id,
      decision: intent === 'approve' ? 'APPROVED' : 'REJECTED',
      reason: reason ?? '',
      expected_updated_at
    }).main()
  }

  if (result?.error) {
    const isConflict = result.status === 'conflict'
    return data(
      {
        error: true,
        message: result.message ?? (isConflict ? 'La solicitud fue actualizada por otro administrador.' : 'No se pudo completar la acción.'),
        status: result.status
      },
      { status: isConflict ? 409 : 400 }
    )
  }

  return redirect(request.url)
}

export default function AdminMarketplaceUsersPage(): JSX.Element {
  const actionData = useActionData<typeof action>()
  const { requests, total, status_filter, error } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const actionStatus = actionData && typeof actionData === 'object' && 'status' in actionData ? actionData.status : undefined
  const normalizedActionStatus = typeof actionStatus === 'string' ? actionStatus : undefined
  const actionError = actionData?.error === true ? (typeof actionData.message === 'string' ? actionData.message : 'No se pudo completar la acción.') : null

  return (
    <MarketplaceAdminUsersShell
      requests={requests}
      total={total}
      statusFilter={status_filter}
      loaderError={error}
      actionError={actionError}
      actionStatus={normalizedActionStatus}
      isSubmitting={isSubmitting}
    />
  )
}
