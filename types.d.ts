declare module '*.css?url' {
  const value: string
  export default value
}

declare module 'build/server/index.js' {
  const build: Record<string, unknown>
  export default build
}

declare module 'node-summarizer'

declare module 'nodemailer' {
  export interface SMTPTransportOptions {
    host: string
    port: number
    secure: boolean
    requireTLS: boolean
    auth: {
      user: string
      pass: string
    }
    connectionTimeout: number
  }

  export interface SendMailOptions {
    from: string
    to: string | string[]
    subject: string
    html: string
    text?: string
    cc?: string | string[]
    bcc?: string | string[]
  }

  export interface SendMailResult {
    messageId: string
  }

  export interface Transporter {
    sendMail(options: SendMailOptions): Promise<SendMailResult>
  }

  export function createTransport(options: SMTPTransportOptions): Transporter

  const nodemailer: {
    createTransport: typeof createTransport
  }

  export default nodemailer
}

// ============================================
// GLOBAL TRACKING SDK TYPES
// ============================================

// Facebook Pixel SDK
interface FacebookPixelStatic {
  (action: 'init', pixelId: string): void
  (action: 'track', eventName: string, params?: Record<string, unknown>): void
  (action: 'trackCustom', eventName: string, params?: Record<string, unknown>): void
}

// Google Analytics / gtag.js
interface GtagStatic {
  (command: 'config', targetId: string, config?: Record<string, unknown>): void
  (command: 'event', eventName: string, params?: Record<string, unknown>): void
  (command: 'set', params: Record<string, unknown>): void
  (command: 'js', date: Date): void
}

// TikTok Pixel SDK
interface TikTokPixelStatic {
  track: (eventName: string, params?: Record<string, unknown>) => void
  identify: (params: Record<string, unknown>) => void
  page: () => void
}

// Extend Window interface
interface Window {
  fbq?: FacebookPixelStatic
  gtag?: GtagStatic
  ttq?: TikTokPixelStatic
  dataLayer?: unknown[]
  ENV?: {
    SENTRY_DSN?: string
    NODE_ENV?: string
    VAPID_PUBLIC_KEY?: string
  }
}
