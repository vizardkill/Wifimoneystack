import { startTransition, StrictMode } from 'react'

import * as Sentry from '@sentry/react-router'
import type { ConsoleLevel } from '@sentry/core'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

import { suppressHydrationErrorsInProduction } from './lib/helpers/_suppress-hydrationErrors.helper'

const isProduction = window.ENV?.NODE_ENV === 'production'
const sentryConsoleLevels: ConsoleLevel[] = isProduction ? ['warn', 'error'] : ['log', 'warn', 'error']

// Inicializar Sentry en el cliente
Sentry.init({
  dsn: window.ENV?.SENTRY_DSN ?? '',
  sendDefaultPii: true,
  enableLogs: true,
  environment: window.ENV?.NODE_ENV ?? 'development',
  tracesSampleRate: isProduction ? 0.1 : 1.0,

  // Filtra/etiqueta métricas enviadas desde cliente
  beforeSendMetric: (metric) => {
    if (metric.name.startsWith('debug.')) {
      return null
    }

    metric.attributes = {
      ...metric.attributes,
      app_runtime: 'client'
    }

    return metric
  },

  integrations: [
    // Performance monitoring
    Sentry.reactRouterTracingIntegration(),
    // Session replay para reproducir errores
    Sentry.replayIntegration(),
    // Capturar console.* del cliente como logs en Sentry
    Sentry.consoleLoggingIntegration({ levels: sentryConsoleLevels })
  ],

  // Control de URLs para distributed tracing
  tracePropagationTargets: ['localhost', /^https:\/\/.*\.wifimoney\.com/],

  // Session replay: 10% de todas las sesiones + 100% si hay error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})

suppressHydrationErrorsInProduction()

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  )
})
