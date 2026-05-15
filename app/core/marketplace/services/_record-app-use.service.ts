import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'
import { AppUsageEventDB } from '@/core/marketplace/db/app-usage-event.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'

import { CONFIG_RECORD_MARKETPLACE_APP_USE } from '@types'

type RequestStatus = CONFIG_RECORD_MARKETPLACE_APP_USE.RequestStatus
type RequestResponse = CONFIG_RECORD_MARKETPLACE_APP_USE.RequestResponse
type Payload = CONFIG_RECORD_MARKETPLACE_APP_USE.Payload

const normalizeRootDomain = (): string | null => {
  const configured = process.env.SUBAPP_ROOT_DOMAIN?.trim() || process.env.SUBAPP_COOKIE_DOMAIN?.trim()

  if (!configured) {
    return null
  }

  return (
    configured
      .replace(/^https?:\/\//, '')
      .replace(/^\./, '')
      .split('/')[0] || null
  )
}

const shouldUseAuthorizeBridge = (targetUrl: string): boolean => {
  const rootDomain = normalizeRootDomain()
  if (!rootDomain) {
    return false
  }

  try {
    const parsedTarget = new URL(targetUrl)
    return parsedTarget.hostname === rootDomain || parsedTarget.hostname.endsWith(`.${rootDomain}`)
  } catch {
    return false
  }
}

const buildProtectedRedirectUrl = (targetUrl: string): string => {
  const appUrl = process.env.APP_URL
  if (!appUrl) {
    return targetUrl
  }

  const normalizedAppUrl = appUrl.trim()
  if (normalizedAppUrl.length === 0) {
    return targetUrl
  }

  try {
    const authorizeUrl = new URL('/api/v1/auth/subapp/authorize', normalizedAppUrl)
    authorizeUrl.searchParams.set('returnTo', targetUrl)
    return authorizeUrl.toString()
  } catch {
    return targetUrl
  }
}

export class CLS_RecordMarketplaceAppUse {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_RECORD_MARKETPLACE_APP_USE.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null
  private _app: Awaited<ReturnType<typeof MarketplaceAppDB.findById>> = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._verifyAccess, this._fetchApp, this._recordEvent, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_RECORD_MARKETPLACE_APP_USE.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_USE.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo registrar el uso de la aplicación.' }
    }

    return this._requestResponse
  }

  private async _verifyAccess(): Promise<void> {
    try {
      const request = await AccessRequestDB.findByUserId(this._payload.user_id)
      if (request?.status !== 'APPROVED') {
        this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_USE.RequestStatus.AccessDenied
        this._requestResponse = { error: true, message: 'No tienes acceso aprobado al marketplace.' }
      }
    } catch (err) {
      this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_USE.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error verificando acceso.' }
      trackError({ error: err as Error, method: 'CLS_RecordMarketplaceAppUse._verifyAccess', controller: 'marketplace' })
    }
  }

  private async _fetchApp(): Promise<void> {
    try {
      this._app = await MarketplaceAppDB.findById(this._payload.app_id)
      if (this._app?.status !== 'ACTIVE' || this._app.access_mode !== 'WEB_LINK') {
        this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_USE.RequestStatus.AppNotFound
        this._requestResponse = { error: true, message: 'Aplicación no disponible para uso web.' }
      }
    } catch (err) {
      this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_USE.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando la aplicación.' }
      trackError({ error: err as Error, method: 'CLS_RecordMarketplaceAppUse._fetchApp', controller: 'marketplace' })
    }
  }

  private async _recordEvent(): Promise<void> {
    try {
      await AppUsageEventDB.create({
        app_id: this._payload.app_id,
        user_id: this._payload.user_id,
        type: 'WEB_OPEN'
      })
    } catch {
      // Must not block redirect
    }
  }

  private async _buildResponse(): Promise<void> {
    const rawRedirectUrl = this._app!.web_url!
    const redirectUrl = shouldUseAuthorizeBridge(rawRedirectUrl) ? buildProtectedRedirectUrl(rawRedirectUrl) : rawRedirectUrl

    this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_USE.RequestStatus.Completed
    this._requestResponse = {
      data: { redirect_url: redirectUrl }
    }
  }
}
