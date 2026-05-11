import * as Sentry from '@sentry/react-router'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

const isProduction = process.env.NODE_ENV === 'production'

const suspiciousRequestMarkers = ['/cgi-bin/', '/bin/sh', '%252e%252e', '%2e%2e', '/../', '/global-protect/', '.esp']

const shouldDropScannerNoise = (event: Sentry.ErrorEvent, hint: Sentry.EventHint): boolean => {
  const requestUrl = event.request?.url?.toLowerCase() ?? ''
  const messageCandidates = [
    event.message,
    ...(event.exception?.values?.map((value) => value.value) ?? []),
    hint.originalException instanceof Error ? hint.originalException.message : undefined
  ]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .map((value) => value.toLowerCase())

  const looksLikeScannerPath = suspiciousRequestMarkers.some((marker) => requestUrl.includes(marker))
  const isMissingActionNoise = messageCandidates.some((value) => value.includes('did not provide an `action`') && value.includes('routes/not-found'))

  return looksLikeScannerPath && isMissingActionNoise
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
  enableLogs: true,
  environment: process.env.NODE_ENV ?? 'development',
  tracesSampleRate: isProduction ? 0.1 : 1.0,
  beforeSend: (event, hint) => {
    if (shouldDropScannerNoise(event, hint)) {
      return null
    }

    return event
  },

  // Filtra/etiqueta métricas enviadas desde servidor
  beforeSendMetric: (metric) => {
    if (metric.name.startsWith('debug.')) {
      return null
    }

    metric.attributes = {
      ...metric.attributes,
      app_runtime: 'server'
    }

    return metric
  },

  // Integración de profiling para análisis de rendimiento
  integrations: [nodeProfilingIntegration()],

  // Profiling de sesiones
  profilesSampleRate: isProduction ? 0.1 : 1.0

  // Capturar atributos de formData en errores (opcional)
  // captureActionFormDataKeys: {
  //   email: true,
  //   username: true,
  // },
})
