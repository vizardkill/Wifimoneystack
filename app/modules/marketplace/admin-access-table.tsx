import type { JSX } from 'react'

import { CheckCircle, Clock, ShieldX, XCircle } from 'lucide-react'
import { Form, useNavigation } from 'react-router'

interface AccessRequest {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED'
  user_email: string
  user_name?: string | null
  created_at: string
  decided_at?: string | null
  decision_reason?: string | null
}

interface AdminAccessTableProps {
  requests: AccessRequest[]
}

const STATUS_BADGE: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  PENDING: { label: 'Pendiente', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  APPROVED: { label: 'Aprobado', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  REJECTED: { label: 'Rechazado', icon: XCircle, color: 'text-red-600 bg-red-50' },
  REVOKED: { label: 'Revocado', icon: ShieldX, color: 'text-orange-600 bg-orange-50' }
}

export function AdminAccessTable({ requests }: AdminAccessTableProps): JSX.Element {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  if (requests.length === 0) {
    return <div className="py-16 text-center text-muted-foreground">No hay solicitudes para mostrar.</div>
  }

  return (
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
                <p className="text-xs text-muted-foreground mt-1">
                  Solicitado:{' '}
                  {new Date(req.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                {req.decided_at && (
                  <p className="text-xs text-muted-foreground">
                    Decidido:{' '}
                    {new Date(req.decided_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>
                <BadgeIcon className="h-3 w-3" />
                {badge.label}
              </span>
            </div>

            {req.decision_reason && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Motivo:</p>
                <p className="text-sm text-gray-700">{req.decision_reason}</p>
              </div>
            )}

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
  )
}
