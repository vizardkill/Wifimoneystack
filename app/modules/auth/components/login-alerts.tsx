import type { ReactElement } from 'react'

import { AlertCircle, CheckCircle } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type LoginAlertsProps = {
  fetcherMessage: string | null
  fetcherHasError: boolean
  fetcherIsSuccess: boolean
  needsVerification: boolean
  actionMessage: string | undefined
  successMessage: string | null
  generalError: string | undefined
  isResending: boolean
  onResend: () => void
}

/**
 * Renderiza el bloque de alertas de la página de login con prioridad:
 * 1. Feedback del reenvío (acción más reciente)
 * 2. Verificación requerida
 * 3. Éxito de verificación (recién verificado)
 * 4. Error general del servidor
 */
export function LoginAlerts({
  fetcherMessage,
  fetcherHasError,
  fetcherIsSuccess,
  needsVerification,
  actionMessage,
  successMessage,
  generalError,
  isResending,
  onResend
}: LoginAlertsProps): ReactElement | null {
  if (fetcherMessage) {
    if (fetcherHasError) {
      return (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fetcherMessage || 'Error al reenviar el enlace de verificación.'}</AlertDescription>
        </Alert>
      )
    }
    if (fetcherIsSuccess) {
      return (
        <Alert variant="default" className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            {fetcherMessage}
            <Button variant="link" className="ml-1 h-auto p-0 font-semibold text-green-800" onClick={onResend} disabled={isResending}>
              {isResending ? 'Enviando...' : 'Volver a reenviar el correo.'}
            </Button>
          </AlertDescription>
        </Alert>
      )
    }
  }

  if (needsVerification) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {actionMessage ?? 'Debes verificar tu correo electrónico antes de iniciar sesión.'}
          <Button variant="link" className="ml-1 h-auto p-0" onClick={onResend} disabled={isResending}>
            {isResending ? 'Enviando...' : 'Reenviar enlace de verificación.'}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (successMessage) {
    return (
      <Alert variant="default" className="border-green-200 bg-green-50 text-green-800">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>{successMessage}</AlertDescription>
      </Alert>
    )
  }

  if (generalError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{generalError}</AlertDescription>
      </Alert>
    )
  }

  return null
}
