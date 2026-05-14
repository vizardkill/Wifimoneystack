import type { JSX } from 'react'

import { Form, useNavigation } from 'react-router'

interface AccessDecisionDialogProps {
  requestId: string
  userName: string
  intent: 'approve' | 'reject' | 'revoke'
  onClose: () => void
}

export function AccessDecisionDialog({ requestId, userName, intent, onClose }: AccessDecisionDialogProps): JSX.Element {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const config = {
    approve: {
      title: 'Aprobar acceso',
      description: `¿Confirmas que deseas aprobar el acceso al marketplace para ${userName}?`,
      buttonLabel: 'Aprobar',
      buttonClass: 'bg-green-600 hover:bg-green-700 text-white'
    },
    reject: {
      title: 'Rechazar solicitud',
      description: `¿Confirmas que deseas rechazar la solicitud de ${userName}?`,
      buttonLabel: 'Rechazar',
      buttonClass: 'bg-red-600 hover:bg-red-700 text-white'
    },
    revoke: {
      title: 'Revocar acceso',
      description: `¿Confirmas que deseas revocar el acceso de ${userName}?`,
      buttonLabel: 'Revocar',
      buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white'
    }
  }[intent]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
        <h2 className="font-heading text-lg font-bold text-[var(--color-mp-charcoal)]">{config.title}</h2>
        <p className="text-sm text-muted-foreground">{config.description}</p>

        <Form method="post" className="space-y-3">
          <input type="hidden" name="intent" value={intent} />
          <input type="hidden" name="request_id" value={requestId} />

          <div className="space-y-1">
            <label htmlFor="reason" className="text-sm font-medium">
              Motivo <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={3}
              placeholder="Indica el motivo de la decisión..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 transition-colors ${config.buttonClass}`}
            >
              {config.buttonLabel}
            </button>
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}
