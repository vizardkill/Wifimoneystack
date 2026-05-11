/**
 * Tipos agnósticos para el sistema de envío de emails
 */

export enum EmailProvider {
  SMTP = 'SMTP',
  SES = 'SES',
  RESEND = 'RESEND'
}

export enum EmailTemplateType {
  VERIFICATION = 'VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  WELCOME = 'WELCOME'
}

export interface EmailAddress {
  email: string
  name?: string
}

export interface EmailContent {
  subject: string
  html: string
  text?: string
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
}

export interface EmailRequest {
  from: EmailAddress
  to: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  content: EmailContent
  attachments?: EmailAttachment[]
  templateType?: EmailTemplateType
  templateData?: EmailTemplateData
}

export interface EmailResponse {
  success: boolean
  messageId?: string
  provider: EmailProvider
  error?: string
  timestamp: Date
}

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  requireTLS?: boolean
  user: string
  pass: string
  clientHostname?: string
  connectionTimeout?: number
  defaultFromEmail: string
  defaultFromName?: string
}

export interface SESConfig {
  region: string
  accessKeyId: string
  secretAccessKey: string
  defaultFromEmail: string
  defaultFromName?: string
}

export interface ResendConfig {
  apiKey: string
  defaultFromEmail: string
  defaultFromName?: string
}

export interface EmailProviderConfig {
  provider: EmailProvider
  isEnabled: boolean
  config: SESConfig | ResendConfig | SMTPConfig
}

export interface EmailTemplateData {
  userName?: string
  firstName?: string
  lastName?: string
  validationUrl?: string
  verificationUrl?: string
  resetUrl?: string
  expiresIn?: string
  dashboardUrl?: string
  [key: string]: unknown
}

export type PasswordResetEmailData = {
  resetUrl: string
  userName?: string
}

export type VerificationEmailData = {
  userName: string
  validationUrl: string
}

export type WelcomeEmailData = {
  userName: string
  dashboardUrl: string
}
