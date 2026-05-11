/**
 * @file suppressHydrationErrors.ts
 * @description Script que suprime errores de hidratación en producción
 * Este script se ejecuta en el cliente antes de que React se monte
 */
export function suppressHydrationErrorsInProduction(): void {
  if (typeof window === 'undefined') {
    return
  }

  if (process.env.NODE_ENV !== 'production') {
    return
  }

  const hydrationErrorPatterns = [
    'Minified React error #418',
    'Minified React error #423',
    'Minified React error #425',
    'Hydration failed',
    'There was an error while hydrating',
    'The server HTML was replaced with client content',
    'Hydration had to retry'
  ]

  /**
   * Verifica si un mensaje es un error de hidratación
   */
  const isHydrationError = (message: string): boolean => {
    return hydrationErrorPatterns.some((pattern) => message.includes(pattern))
  }

  const getErrorMessage = (reason: unknown): string => {
    if (typeof reason === 'string') {
      return reason
    }

    if (typeof reason === 'object' && reason !== null) {
      const maybeMessage = (reason as { message?: unknown }).message
      if (typeof maybeMessage === 'string') {
        return maybeMessage
      }
    }

    return String(reason)
  }

  /**
   * Capturar errores no manejados
   */
  window.addEventListener('error', (event) => {
    if (isHydrationError(event.message)) {
      event.preventDefault()
      event.stopPropagation()

      sendToMonitoringService('unhandled_hydration_error', {
        message: 'Unhandled client/server mismatch',
        timestamp: new Date().toISOString()
      })
    }
  })

  /**
   * Capturar promise rejections no manejadas
   */
  window.addEventListener('unhandledrejection', (event) => {
    const message = getErrorMessage(event.reason)

    if (isHydrationError(message)) {
      event.preventDefault()

      sendToMonitoringService('unhandled_promise_rejection', {
        message: 'Promise rejection related to hydration',
        timestamp: new Date().toISOString()
      })
    }
  })
}

/**
 * Envía errores a un servicio de monitoreo
 * (Integrar con Sentry, LogRocket, DataDog, etc.)
 */
function sendToMonitoringService(type: string, data: unknown) {
  // TODO: Integrar con tu servicio de monitoreo
  void type
  void data
}
