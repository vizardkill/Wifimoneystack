import type { JSX } from 'react'

import { CheckCircle, Clock, ShieldX, XCircle } from 'lucide-react'
import { type ActionFunctionArgs, data, type LoaderFunctionArgs, redirect } from 'react-router'
import { Form, Link, useActionData, useLoaderData, useNavigation } from 'react-router'

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
    error: result.error ? result.message : null
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

const STATUS_BADGE: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  PENDING: { label: 'Pendiente', icon: Clock, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  APPROVED: { label: 'Aprobado', icon: CheckCircle, color: 'text-green-700 bg-green-50 border-green-200' },
  REJECTED: { label: 'Rechazado', icon: XCircle, color: 'text-red-700 bg-red-50 border-red-200' },
  REVOKED: { label: 'Revocado', icon: ShieldX, color: 'text-orange-700 bg-orange-50 border-orange-200' }
}

export default function AdminMarketplaceUsersPage(): JSX.Element {
  const actionData = useActionData<typeof action>()
  const { requests, total, status_filter, error } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const actionStatus = actionData && 'status' in actionData ? actionData.status : undefined

  const statuses = ['', 'PENDING', 'APPROVED', 'REJECTED', 'REVOKED']

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Solicitudes de acceso</h1>
            <p className="mt-1 text-sm text-slate-600">Revisa, aprueba, vuelve a aprobar, rechaza o revoca permisos de acceso al marketplace.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {total} registros
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Link
              key={status}
              to={status ? `?status=${status}` : '?'}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                status_filter === status ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status || 'Todos'}
            </Link>
          ))}
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {actionData?.error && (
        <div
          className={`rounded-xl border p-4 text-sm ${actionStatus === 'conflict' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-red-200 bg-red-50 text-red-700'}`}
        >
          {actionData.message}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-slate-500 shadow-sm">No hay solicitudes para mostrar.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const badge = STATUS_BADGE[req.status] ?? STATUS_BADGE.PENDING
            const BadgeIcon = badge.icon

            return (
              <article key={req.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{req.user_name ?? req.user_email}</p>
                    <p className="text-sm text-slate-500">{req.user_email}</p>
                    <p className="mt-1 text-xs text-slate-500">Solicitado: {new Date(req.created_at).toLocaleDateString('es-ES')}</p>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.color}`}>
                    <BadgeIcon className="h-3 w-3" />
                    {badge.label}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(req.status === 'PENDING' || req.status === 'REJECTED' || req.status === 'REVOKED') && (
                    <Form method="post" className="inline">
                      <input type="hidden" name="intent" value="approve" />
                      <input type="hidden" name="request_id" value={req.id} />
                      <input type="hidden" name="expected_updated_at" value={new Date(req.updated_at).toISOString()} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      >
                        {req.status === 'PENDING' ? 'Aprobar' : 'Volver a aprobar'}
                      </button>
                    </Form>
                  )}

                  {req.status === 'PENDING' && (
                    <Form method="post" className="inline">
                      <input type="hidden" name="intent" value="reject" />
                      <input type="hidden" name="request_id" value={req.id} />
                      <input type="hidden" name="expected_updated_at" value={new Date(req.updated_at).toISOString()} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </Form>
                  )}

                  {req.status === 'APPROVED' && (
                    <Form method="post" className="inline">
                      <input type="hidden" name="intent" value="revoke" />
                      <input type="hidden" name="request_id" value={req.id} />
                      <input type="hidden" name="expected_updated_at" value={new Date(req.updated_at).toISOString()} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-50 disabled:opacity-50"
                      >
                        Revocar
                      </button>
                    </Form>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
