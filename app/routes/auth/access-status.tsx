import type { JSX } from 'react'

import { CheckCircle, Clock, ShieldX, XCircle } from 'lucide-react'
import { type LoaderFunctionArgs, redirect } from 'react-router'
import { Form, useLoaderData } from 'react-router'

import { CLS_GetMarketplaceAccessStatus } from '@/core/marketplace/marketplace.server'

import { getAccessStatusMessage } from '@lib/helpers/_marketplace-access.helper'

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''

  if (!token) {
    throw redirect('/login')
  }

  const user = verifyUserToken(token)
  if (!user) {
    throw redirect('/login')
  }

  if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
    throw redirect('/dashboard/marketplace')
  }

  const result = await new CLS_GetMarketplaceAccessStatus({ user_id: user.id }).main()

  // If approved, send to marketplace
  if (result.data?.access_status === 'APPROVED') {
    throw redirect('/marketplace')
  }

  return {
    access_status: result.data?.access_status ?? 'NONE',
    decided_at: result.data?.decided_at ?? null,
    decision_reason: result.data?.decision_reason ?? null,
    user_email: user.email
  }
}

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 border-yellow-200',
    title: 'Solicitud en revisión',
    subtitle: 'Estamos revisando tu solicitud de acceso al marketplace.'
  },
  REJECTED: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50 border-red-200',
    title: 'Solicitud rechazada',
    subtitle: 'Tu solicitud no fue aprobada. Puedes contactar soporte para más información.'
  },
  REVOKED: {
    icon: ShieldX,
    color: 'text-red-500',
    bg: 'bg-red-50 border-red-200',
    title: 'Acceso revocado',
    subtitle: 'Tu acceso al marketplace fue revocado.'
  },
  NONE: {
    icon: CheckCircle,
    color: 'text-gray-400',
    bg: 'bg-gray-50 border-gray-200',
    title: 'Sin solicitud',
    subtitle: 'Aún no has solicitado acceso al marketplace.'
  }
} as const

type StatusKey = keyof typeof STATUS_CONFIG

export default function AccessStatusPage(): JSX.Element {
  const { access_status, decided_at, decision_reason } = useLoaderData<typeof loader>()

  const status = (access_status as StatusKey) in STATUS_CONFIG ? (access_status as StatusKey) : 'NONE'
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  const message = getAccessStatusMessage(access_status as never)

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-mp-ivory)] px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-heading text-3xl font-bold text-[var(--color-mp-charcoal)]">Estado de acceso</h1>
          <p className="text-sm text-muted-foreground">Marketplace de Aplicaciones</p>
        </div>

        {/* Status card */}
        <div className={`rounded-xl border p-6 space-y-4 ${config.bg}`}>
          <div className="flex items-center gap-3">
            <Icon className={`h-8 w-8 ${config.color}`} />
            <div>
              <h2 className="font-semibold text-lg text-[var(--color-mp-charcoal)]">{config.title}</h2>
              <p className="text-sm text-muted-foreground">{config.subtitle}</p>
            </div>
          </div>

          <p className="text-sm text-gray-700">{message}</p>

          {decided_at && (
            <p className="text-xs text-muted-foreground">
              Decisión tomada el {new Date(decided_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}

          {decision_reason && (
            <div className="rounded-lg bg-white/60 p-3">
              <p className="text-xs font-medium text-gray-600 mb-1">Motivo:</p>
              <p className="text-sm text-gray-700">{decision_reason}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {status === 'PENDING' && <p className="text-center text-sm text-muted-foreground">Te notificaremos por email cuando tu solicitud sea revisada.</p>}
          <Form method="post" action="/api/v1/auth/sessions">
            <button
              type="submit"
              className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cerrar sesión
            </button>
          </Form>
        </div>
      </div>
    </main>
  )
}
