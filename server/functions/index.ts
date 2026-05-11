import { LoggingWinston } from '@google-cloud/logging-winston'

type CloudLogChannel = 'http' | 'error'

const writeStderr = (message: string): void => {
  process.stderr.write(`${message}\n`)
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

export const createGoogleCloudLoggingTransport = (channel: CloudLogChannel): LoggingWinston | null => {
  if (!isGoogleCloudLoggingEnabled()) {
    return null
  }

  try {
    const gcpProjectIdEnv: string | undefined = process.env.GCP_PROJECT_ID
    const gcloudProjectEnv: string | undefined = process.env.GCLOUD_PROJECT
    const kServiceEnv: string | undefined = process.env.K_SERVICE
    const buildEnv: string | undefined = process.env.BUILD
    const kRevisionEnv: string | undefined = process.env.K_REVISION
    const npmVersionEnv: string | undefined = process.env.npm_package_version

    const projectId = gcpProjectIdEnv || gcloudProjectEnv || ''
    const baseLogName = process.env.GCP_LOG_NAME || 'somaup-app'
    const serviceName = kServiceEnv || ''
    const environment = buildEnv || 'development'
    const revision = kRevisionEnv || npmVersionEnv || 'unknown'

    return new LoggingWinston({
      projectId,
      logName: `${baseLogName}-${channel}`,
      redirectToStdout: true,
      labels: {
        channel,
        service: serviceName || 'somaup-app',
        environment
      },
      serviceContext: serviceName
        ? {
            service: serviceName,
            version: revision
          }
        : undefined,
      defaultCallback: (error) => {
        if (error) {
          writeStderr(`[GCP_LOGGING][${channel}] Error al escribir log: ${error.message}`)
        }
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    writeStderr(`[GCP_LOGGING][${channel}] No se pudo inicializar transporte: ${message}`)
    return null
  }
}
