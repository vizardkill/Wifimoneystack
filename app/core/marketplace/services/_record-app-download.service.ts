import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'
import { AppArtifactDB } from '@/core/marketplace/db/app-artifact.db'
import { AppUsageEventDB } from '@/core/marketplace/db/app-usage-event.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'

import { CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD } from '@types'

type RequestStatus = CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.RequestStatus
type RequestResponse = CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.RequestResponse
type Payload = CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.Payload

export class CLS_RecordMarketplaceAppDownload {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null
  private _artifact: Awaited<ReturnType<typeof AppArtifactDB.findActiveByApp>> = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._verifyAccess, this._fetchApp, this._fetchArtifact, this._recordEvent, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo procesar la descarga.' }
    }

    return this._requestResponse
  }

  private async _verifyAccess(): Promise<void> {
    try {
      const request = await AccessRequestDB.findByUserId(this._payload.user_id)
      if (request?.status !== 'APPROVED') {
        this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.RequestStatus.AccessDenied
        this._requestResponse = { error: true, message: 'No tienes acceso aprobado al marketplace.' }
      }
    } catch (err) {
      this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error verificando acceso.' }
      trackError({ error: err as Error, method: 'CLS_RecordMarketplaceAppDownload._verifyAccess', controller: 'marketplace' })
    }
  }

  private async _fetchApp(): Promise<void> {
    try {
      const app = await MarketplaceAppDB.findById(this._payload.app_id)
      if (app?.status !== 'ACTIVE' || app.access_mode !== 'PACKAGE_DOWNLOAD') {
        this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.RequestStatus.AppNotFound
        this._requestResponse = { error: true, message: 'Aplicación no disponible para descarga.' }
      }
    } catch (err) {
      this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando la aplicación.' }
      trackError({ error: err as Error, method: 'CLS_RecordMarketplaceAppDownload._fetchApp', controller: 'marketplace' })
    }
  }

  private async _fetchArtifact(): Promise<void> {
    try {
      this._artifact = await AppArtifactDB.findActiveByApp(this._payload.app_id)
      if (!this._artifact) {
        this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.RequestStatus.NoArtifact
        this._requestResponse = { error: true, message: 'No hay artefacto disponible para descarga.' }
      }
    } catch (err) {
      this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando el artefacto.' }
      trackError({ error: err as Error, method: 'CLS_RecordMarketplaceAppDownload._fetchArtifact', controller: 'marketplace' })
    }
  }

  private async _recordEvent(): Promise<void> {
    try {
      await AppUsageEventDB.create({
        app_id: this._payload.app_id,
        user_id: this._payload.user_id,
        type: 'PACKAGE_DOWNLOAD',
        metadata: { version_label: this._artifact?.version_label }
      })
    } catch {
      // Must not block download
    }
  }

  private async _buildResponse(): Promise<void> {
    const artifact = this._artifact!
    this._statusRequest = CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD.RequestStatus.Completed
    // NOTE: In production, download_url should be a signed/short-lived URL from storage provider
    this._requestResponse = {
      data: {
        download_url: `/api/v1/storage/files?key=${encodeURIComponent(artifact.storage_key)}`,
        file_name: artifact.file_name,
        version_label: artifact.version_label
      }
    }
  }
}
