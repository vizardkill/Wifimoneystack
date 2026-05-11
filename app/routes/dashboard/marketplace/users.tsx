import type { JSX } from 'react'

import { CheckCircle, Clock, ShieldX, XCircle } from 'lucide-react'
import { type ActionFunctionArgs, data, type LoaderFunctionArgs, redirect } from 'react-router'
import { Form, useLoaderData, useNavigation } from 'react-router'

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
  if (user.role !== 'ADMIN') {
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
  if (user.role !== 'ADMIN') {
    return data({ error: true, message: 'Sin permisos.' }, { status: 403 })
  }

  const formData = await request.formData()
  const intent = formData.get('intent') as string
  const request_id = formData.get('request_id') as string
  const reason = formData.get('reason') as string | undefined

  if (intent === 'revoke') {
    await new CLS_RevokeMarketplaceAccess({ request_id, actor_user_id: user.id, reason: reason ?? '' }).main()
  } else if (intent === 'approve' || intent === 'reject') {
    await new CLS_DecideMarketplaceAccessRequest({
      request_id,
      actor_user_id: user.id,
      decision: intent === 'approve' ? 'APPROVED' : 'REJECTED',
      reason: reason ?? ''
    }).main()
  }

  return redirect(request.url)
}

const STATUS_BADGE: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  PENDING: { label: 'Pendiente', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  APPROVED: { label: 'Aprobado', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  REJECTED: { label: 'Rechazado', icon: XCircle, color: 'text-red-600 bg-red-50' },
  REVOKED: { label: 'Revocado', icon: ShieldX, color: 'text-orange-600 bg-orange-50' }
}

export default function AdminMarketplaceUsersPage(): JSX.Element {
  const { requests, total, status_filter, error } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'REVOKED']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-[var(--color-mp-charcoal)]">Solicitudes de acceso</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <a
            key={s}
            href={s ? `?status=${s}` : '?'}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              status_filter === s ? 'bg-[var(--color-mp-charcoal)] text-white' : 'border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s || 'Todos'}
          </a>
        ))}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {requests.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">No hay solicitudes para mostrar.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const badge = STATUS_BADGE[req.status] ?? STATUS_BADGE.PENDING
            const BadgeIcon = badge.icon
            return (
              <div key={req.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--color-mp-charcoal)]">{req.user_name ?? req.user_email}</p>
                    <p className="text-sm text-muted-foreground">{req.user_email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Solicitado: {new Date(req.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>
                    <BadgeIcon className="h-3 w-3" />
                    {badge.label}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {req.status === 'PENDING' && (
                    <>
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="approve" />
                        <input type="hidden" name="request_id" value={req.id} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          Aprobar
                        </button>
                      </Form>
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="reject" />
                        <input type="hidden" name="request_id" value={req.id} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          Rechazar
                        </button>
                      </Form>
                    </>
                  )}
                  {req.status === 'APPROVED' && (
                    <Form method="post" className="inline">
                      <input type="hidden" name="intent" value="revoke" />
                      <input type="hidden" name="request_id" value={req.id} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-50 transition-colors"
                      >
                        Revocar
                      </button>
                    </Form>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
