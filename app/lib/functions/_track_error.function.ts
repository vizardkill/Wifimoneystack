import * as Sentry from '@sentry/react-router'

type TrackErrorLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'
type CloudLogSeverity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'NOTICE' | 'INFO' | 'DEBUG'

interface CloudLogWriter {
  entry: (metadata: Record<string, unknown>, payload: Record<string, unknown>) => unknown
  write: (entry: unknown) => Promise<void>
}

interface CloudLoggingClient {
  log: (logName: string) => CloudLogWriter
}

const CLOUD_SEVERITY_BY_LEVEL: Record<TrackErrorLevel, CloudLogSeverity> = {
  fatal: 'CRITICAL',
  error: 'ERROR',
  warning: 'WARNING',
  log: 'NOTICE',
  info: 'INFO',
  debug: 'DEBUG'
}

const SENSITIVE_FIELD_PATTERN =
  /(password|passwd|pwd|token|secret|authorization|cookie|api[_-]?key|credential|private[_-]?key|refresh[_-]?token|access[_-]?token)/i
const LABEL_SANITIZE_PATTERN = /[^a-z0-9_-]/g
const MAX_STRING_LENGTH = 2000
const MAX_STACK_LENGTH = 8000
const MAX_CONTEXT_DEPTH = 5

let cloudLoggingClientPromise: Promise<CloudLoggingClient | null> | null = null

/**
 * Parámetros para trackError
 */
export interface TrackErrorParams {
  error: Error
  method: string
  controller: string
  module?: string
  level?: TrackErrorLevel
  title?: string
  description?: string
  fingerprint?: string[]
  tags?: Record<string, string | number | boolean>
  user?: {
    id: string
    email?: string
    username?: string
    role?: string
    ip_address?: string
  }
  additionalContext?: Record<string, unknown>
}

const truncateText = (value: string, maxLength: number = MAX_STRING_LENGTH): string => {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength)}...[truncated]`
}

const sanitizeLabelValue = (value: string): string => {
  const sanitized = value.toLowerCase().replace(LABEL_SANITIZE_PATTERN, '_').replace(/_+/g, '_').slice(0, 63)
  return sanitized.length > 0 ? sanitized : 'unknown'
}

const sanitizeContextValue = (value: unknown, depth: number, visited: WeakSet<object>): unknown => {
  if (value == null) {
    return value
  }

  if (typeof value === 'string') {
    return truncateText(value)
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: truncateText(value.message),
      stack: value.stack ? truncateText(value.stack, MAX_STACK_LENGTH) : undefined
    }
  }

  if (depth >= MAX_CONTEXT_DEPTH) {
    return '[MaxDepth]'
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeContextValue(item, depth + 1, visited))
  }

  if (typeof value === 'object') {
    if (visited.has(value)) {
      return '[Circular]'
    }

    visited.add(value)

    const objectValue = value as Record<string, unknown>
    const sanitizedEntries = Object.entries(objectValue).map(([key, nestedValue]) => [
      key,
      SENSITIVE_FIELD_PATTERN.test(key) ? '[REDACTED]' : sanitizeContextValue(nestedValue, depth + 1, visited)
    ])

    return Object.fromEntries(sanitizedEntries)
  }

  if (typeof value === 'symbol') {
    return value.toString()
  }

  if (typeof value === 'function') {
    return '[Function]'
  }

  return '[UnsupportedType]'
}

const sanitizeAdditionalContext = (context: Record<string, unknown> | undefined): Record<string, unknown> => {
  if (!context) {
    return {}
  }

  const visited = new WeakSet<object>()
  const sanitized = sanitizeContextValue(context, 0, visited)

  return sanitized as Record<string, unknown>
}

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value)
  } catch {
    return '{"serialization_error":"No se pudo serializar el payload de log."}'
  }
}

const writeStderr = (message: string): void => {
  if (typeof window !== 'undefined') {
    return
  }

  const canWriteToStderr = typeof process !== 'undefined' && typeof process.stderr.write === 'function'
  if (!canWriteToStderr) {
    return
  }

  process.stderr.write(`${message}\n`)
}

const writeTrackErrorInternalLog = (message: string): void => {
  writeStderr(`[TRACK_ERROR][${new Date().toISOString()}] ${message}`)
}

const isGoogleCloudLoggingEnabled = (): boolean => {
  const explicitFlag = process.env.GCP_LOGGING_ENABLED
  if (explicitFlag === 'true') {
    return true
  }
  if (explicitFlag === 'false') {
    return false
  }

  return Boolean(process.env.K_SERVICE)
}

const getTrackedErrorLogName = (): string => {
  const baseLogName = (process.env.GCP_ERROR_LOG_NAME ?? process.env.GCP_LOG_NAME ?? 'wmc-marketplace').trim()
  const normalizedBaseLogName = baseLogName.length > 0 ? baseLogName : 'wmc-marketplace'
  return `${normalizedBaseLogName}-tracked-errors`
}

const getCloudLoggingClient = async (): Promise<CloudLoggingClient | null> => {
  if (typeof window !== 'undefined' || !isGoogleCloudLoggingEnabled()) {
    return null
  }

  if (cloudLoggingClientPromise) {
    return cloudLoggingClientPromise
  }

  cloudLoggingClientPromise = (async () => {
    try {
      const loggingModule = await import('@google-cloud/logging')
      const LoggingConstructor = loggingModule.Logging as unknown as new (options?: { projectId?: string }) => CloudLoggingClient

      const projectId = process.env.GCP_PROJECT_ID ?? process.env.GCLOUD_PROJECT
      return new LoggingConstructor({ projectId })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      writeTrackErrorInternalLog(`No se pudo inicializar cliente de Cloud Logging: ${message}`)
      return null
    }
  })()

  return cloudLoggingClientPromise
}

const writeGoogleCloudErrorLog = async ({
  error,
  method,
  controller,
  module,
  level,
  title,
  description,
  fingerprint,
  tags,
  user,
  additionalContext
}: TrackErrorParams & {
  module: string
  level: TrackErrorLevel
  title: string
  fingerprint: string[]
  additionalContext: Record<string, unknown>
}): Promise<void> => {
  const loggingClient = await getCloudLoggingClient()
  if (!loggingClient) {
    return
  }

  try {
    const log = loggingClient.log(getTrackedErrorLogName())
    const severity = CLOUD_SEVERITY_BY_LEVEL[level]

    const envVars = process.env as Record<string, string | undefined>
    const environment = (envVars.BUILD ?? envVars.NODE_ENV ?? 'unknown').trim()

    const metadata: Record<string, unknown> = {
      severity,
      labels: {
        channel: 'tracked_error',
        module: sanitizeLabelValue(module),
        controller: sanitizeLabelValue(controller),
        method: sanitizeLabelValue(method),
        environment: sanitizeLabelValue(environment.length > 0 ? environment : 'unknown')
      }
    }

    const payload: Record<string, unknown> = {
      source: 'track_error.function',
      timestamp: new Date().toISOString(),
      level,
      title,
      description: description ?? null,
      module,
      controller,
      method,
      fingerprint,
      tags: tags ?? {},
      user: user
        ? {
            id: user.id,
            username: user.username,
            role: user.role
          }
        : null,
      error: {
        name: error.name,
        message: truncateText(error.message),
        stack: error.stack ? truncateText(error.stack, MAX_STACK_LENGTH) : undefined
      },
      context: additionalContext
    }

    const entry = log.entry(metadata, payload)
    await log.write(entry)
  } catch (errorWritingLog) {
    const message = errorWritingLog instanceof Error ? errorWritingLog.message : String(errorWritingLog)
    writeTrackErrorInternalLog(`Fallo al escribir error en Cloud Logging: ${message}`)
  }
}

const writeServerErrorLog = ({ error, method, controller, module, level, title, description, additionalContext }: TrackErrorParams): void => {
  const resolvedModule = module ?? controller
  const resolvedLevel = level ?? 'error'
  const payload = {
    source: 'track_error.function',
    severity: CLOUD_SEVERITY_BY_LEVEL[resolvedLevel],
    timestamp: new Date().toISOString(),
    module: resolvedModule,
    controller,
    method,
    title: title ?? error.name,
    message: truncateText(error.message),
    description: description ?? 'N/A',
    context: additionalContext ?? {},
    stack: error.stack ? truncateText(error.stack, MAX_STACK_LENGTH) : undefined
  }

  writeStderr(safeStringify(payload))
}

/**
 * Captura errores y los envía a Sentry con metadatos adicionales
 *
 * @example
 * ```typescript
 * await trackError({
 *   error: error as Error,
 *   method: 'CLS_GoogleLogin.main',
 *   controller: 'google-login'
 * })
 * ```
 */
export function trackError(params: TrackErrorParams): void {
  const { error, method, controller, module, level = 'error', title, description, fingerprint, tags, user, additionalContext } = params

  const resolvedModule = module ?? controller
  const resolvedTitle = (title ?? `${error.name}: ${error.message}`).replace(/[\n\r]/g, ' ').trim()
  const resolvedFingerprint = fingerprint ?? [resolvedModule, controller, method, error.name]
  const sanitizedAdditionalContext = sanitizeAdditionalContext(additionalContext)

  try {
    writeServerErrorLog({
      error,
      method,
      controller,
      module: resolvedModule,
      level,
      title: resolvedTitle,
      description,
      additionalContext: sanitizedAdditionalContext
    })

    void writeGoogleCloudErrorLog({
      error,
      method,
      controller,
      module: resolvedModule,
      level,
      title: resolvedTitle,
      description,
      fingerprint: resolvedFingerprint,
      tags,
      user,
      additionalContext: sanitizedAdditionalContext
    })

    // Capturar el error con Sentry y agregar contexto
    Sentry.withScope((scope) => {
      scope.setLevel(level)

      if (user !== undefined) {
        scope.setUser(user)
      }

      // Agregar tags para filtrado en Sentry
      scope.setTag('module', resolvedModule)
      scope.setTag('controller', controller)
      scope.setTag('method', method)
      scope.setTag('error_level', level)
      scope.setTag('error_title', resolvedTitle)

      if (tags != null) {
        Object.entries(tags).forEach(([key, value]) => {
          scope.setTag(key, String(value))
        })
      }

      scope.setFingerprint(resolvedFingerprint)

      scope.setContext('error_classification', {
        title: resolvedTitle,
        description: description ?? '',
        level,
        module: resolvedModule,
        controller,
        method
      })

      // Agregar contexto adicional
      scope.setContext('error_details', {
        title: resolvedTitle,
        description: description ?? '',
        level,
        module: resolvedModule,
        controller,
        method,
        error_message: error.message,
        error_name: error.name,
        user_id: user?.id,
        user_email: user?.email,
        ...sanitizedAdditionalContext
      })

      // Capturar el error
      Sentry.captureException(error)
    })

    void controller
    void method
  } catch (captureError) {
    const message = captureError instanceof Error ? captureError.message : String(captureError)
    writeTrackErrorInternalLog(`Fallo al reportar en Sentry: ${message}`)
    void error
  }
}
