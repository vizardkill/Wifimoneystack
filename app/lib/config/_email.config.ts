import { EmailProvider, type EmailProviderConfig, type ResendConfig, type SESConfig, type SMTPConfig } from '@lib/types/_email.types'

const isEmailProvider = (value: string | undefined): value is EmailProvider => {
  return value === EmailProvider.SMTP || value === EmailProvider.SES || value === EmailProvider.RESEND
}

const parseEmailProvider = (value: string | undefined, fallback: EmailProvider): EmailProvider => {
  return isEmailProvider(value) ? value : fallback
}

const parseInteger = (value: unknown, fallback: number): number => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return fallback
  }

  const normalizedValue = String(value)
  if (normalizedValue.length === 0) {
    return fallback
  }

  const parsedValue = Number.parseInt(normalizedValue, 10)
  return Number.isNaN(parsedValue) ? fallback : parsedValue
}

const parseBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value !== 'string') {
    return fallback
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return fallback
}

const normalizeOptionalEnv = (value: string | undefined): string => {
  return typeof value === 'string' ? value : ''
}

/**
 * Configuración agnóstica para proveedores de email
 */
export const EMAIL_CONFIG = {
  defaultProvider: parseEmailProvider(process.env.EMAIL_PROVIDER, EmailProvider.SMTP),
  enableFallback: process.env.EMAIL_ENABLE_FALLBACK === 'true',
  fallbackProvider: parseEmailProvider(process.env.EMAIL_FALLBACK_PROVIDER, EmailProvider.RESEND),
  defaultFromEmail: process.env.DEFAULT_FROM_EMAIL || 'noreply@connectuspay.com',
  defaultFromName: process.env.DEFAULT_FROM_NAME || 'ConectusPay',
  maxRetries: parseInteger(process.env.EMAIL_MAX_RETRIES, 3),
  retryDelay: parseInteger(process.env.EMAIL_RETRY_DELAY, 1000)
}

export const SMTP_CONFIG: SMTPConfig = {
  host: process.env.SMTP_HOST || '',
  port: parseInteger(process.env.SMTP_PORT, 587),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  clientHostname: process.env.SMTP_CLIENT_HOSTNAME || '',
  secure: parseBoolean(process.env.SMTP_SECURE, false),
  requireTLS: parseBoolean(process.env.SMTP_REQUIRE_TLS, true),
  connectionTimeout: parseInteger(process.env.SMTP_CONNECTION_TIMEOUT_MS, 10000),
  defaultFromEmail: EMAIL_CONFIG.defaultFromEmail
}

const awsRegionEnv: string | undefined = process.env.AWS_REGION
const awsSesAccessKeyIdEnv: string | undefined = process.env.AWS_SES_ACCESS_KEY_ID
const awsSesSecretAccessKeyEnv: string | undefined = process.env.AWS_SES_SECRET_ACCESS_KEY
const resendApiKeyEnv: string | undefined = process.env.RESEND_API_KEY

export const SES_CONFIG: SESConfig = {
  region: normalizeOptionalEnv(awsRegionEnv),
  accessKeyId: normalizeOptionalEnv(awsSesAccessKeyIdEnv),
  secretAccessKey: normalizeOptionalEnv(awsSesSecretAccessKeyEnv),
  defaultFromEmail: EMAIL_CONFIG.defaultFromEmail
}

export const RESEND_CONFIG: ResendConfig = {
  apiKey: normalizeOptionalEnv(resendApiKeyEnv),
  defaultFromEmail: EMAIL_CONFIG.defaultFromEmail
}

export const EMAIL_PROVIDERS: Record<EmailProvider, EmailProviderConfig> = {
  [EmailProvider.SMTP]: {
    provider: EmailProvider.SMTP,
    isEnabled: !!(SMTP_CONFIG.host && SMTP_CONFIG.user && SMTP_CONFIG.pass),
    config: SMTP_CONFIG
  },
  [EmailProvider.SES]: {
    provider: EmailProvider.SES,
    isEnabled: !!(process.env.AWS_SES_ACCESS_KEY_ID && process.env.AWS_SES_SECRET_ACCESS_KEY),
    config: SES_CONFIG
  },
  [EmailProvider.RESEND]: {
    provider: EmailProvider.RESEND,
    isEnabled: !!process.env.RESEND_API_KEY,
    config: RESEND_CONFIG
  }
}

/**
 * Obtiene la configuración del proveedor de email
 */
export function getEmailProviderConfig(provider: EmailProvider): EmailProviderConfig {
  const config = EMAIL_PROVIDERS[provider]
  if (!config.isEnabled) {
    throw new Error(`Email provider ${provider} is not properly configured`)
  }
  return config
}

/**
 * Obtiene el proveedor de email disponible (con fallback)
 */
export function getAvailableEmailProvider(): EmailProvider {
  const defaultConfig = EMAIL_PROVIDERS[EMAIL_CONFIG.defaultProvider]
  if (defaultConfig.isEnabled) {
    return EMAIL_CONFIG.defaultProvider
  }

  if (EMAIL_CONFIG.enableFallback) {
    const fallbackConfig = EMAIL_PROVIDERS[EMAIL_CONFIG.fallbackProvider]
    if (fallbackConfig.isEnabled) {
      return EMAIL_CONFIG.fallbackProvider
    }
  }

  for (const [provider, config] of Object.entries(EMAIL_PROVIDERS)) {
    if (config.isEnabled) {
      return provider as EmailProvider
    }
  }

  throw new Error('No email provider is available or properly configured')
}
