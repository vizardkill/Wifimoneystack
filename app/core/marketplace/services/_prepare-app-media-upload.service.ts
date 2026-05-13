import { UserDB } from '@/core/auth/db/user.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { trackError } from '@lib/functions/_track_error.function'
import { getSignedUploadUrl } from '@lib/services/_storage.service'

import { CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD } from '@types'

type RequestStatus = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus
type RequestResponse = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestResponse
type Payload = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.Payload

const ALLOWED_IMAGE_CONTENT_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

const sanitizeFileName = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const inferFileExtension = (fileName: string, contentType: string): string => {
  const lowerFileName = fileName.toLowerCase()

  if (lowerFileName.endsWith('.png')) {
    return '.png'
  }

  if (lowerFileName.endsWith('.jpg') || lowerFileName.endsWith('.jpeg')) {
    return '.jpg'
  }

  if (lowerFileName.endsWith('.webp')) {
    return '.webp'
  }

  if (contentType === 'image/png') {
    return '.png'
  }

  if (contentType === 'image/webp') {
    return '.webp'
  }

  return '.jpg'
}

export class CLS_PrepareMarketplaceAppMediaUpload {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  private _signedUpload: Awaited<ReturnType<typeof getSignedUploadUrl>> | null = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._verifyActorRole, this._verifyAppExists, this._validatePayload, this._prepareUpload, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo preparar la carga de media.' }
    }

    return this._requestResponse
  }

  private async _verifyActorRole(): Promise<void> {
    try {
      const actor = await UserDB.getById(this._payload.actor_user_id)
      const hasMarketplaceAdminAccess = actor?.role === 'ADMIN' || actor?.role === 'SUPERADMIN'

      if (!hasMarketplaceAdminAccess) {
        this._statusRequest = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Forbidden
        this._requestResponse = {
          error: true,
          message: 'Sin permisos para preparar uploads de media.',
          status: CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Forbidden
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error validando permisos del actor.' }
      trackError({ error: err as Error, method: 'CLS_PrepareMarketplaceAppMediaUpload._verifyActorRole', controller: 'marketplace' })
    }
  }

  private async _verifyAppExists(): Promise<void> {
    try {
      const app = await MarketplaceAppDB.findById(this._payload.app_id)
      if (!app) {
        this._statusRequest = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.NotFound
        this._requestResponse = {
          error: true,
          message: 'Aplicación no encontrada para carga de media.',
          status: CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.NotFound
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando la app para media upload.' }
      trackError({ error: err as Error, method: 'CLS_PrepareMarketplaceAppMediaUpload._verifyAppExists', controller: 'marketplace' })
    }
  }

  private async _validatePayload(): Promise<void> {
    if (!ALLOWED_IMAGE_CONTENT_TYPES.has(this._payload.content_type)) {
      this._statusRequest = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Validation
      this._requestResponse = {
        error: true,
        message: 'Tipo de archivo no permitido para media.',
        status: CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Validation,
        field_errors: {
          content_type: 'Solo se permiten imágenes PNG, JPEG o WEBP.'
        }
      }
      return
    }

    if (this._payload.size_bytes <= 0) {
      this._statusRequest = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Validation
      this._requestResponse = {
        error: true,
        message: 'El tamaño del archivo es inválido.',
        status: CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Validation,
        field_errors: {
          size_bytes: 'El archivo debe tener un tamaño válido.'
        }
      }
      return
    }
  }

  private async _prepareUpload(): Promise<void> {
    try {
      const baseName = sanitizeFileName(this._payload.file_name)
      const extension = inferFileExtension(baseName, this._payload.content_type)
      const timestamp = Date.now().toString()
      const mediaPrefix = this._payload.media_type === 'ICON' ? 'icon' : 'screenshot'
      const fileName = `${this._payload.app_id}/${mediaPrefix}-${timestamp}${extension}`

      this._signedUpload = await getSignedUploadUrl({
        folder: 'marketplace/storefronts',
        fileName,
        contentType: this._payload.content_type,
        fileSize: this._payload.size_bytes
      })
    } catch (err) {
      this._statusRequest = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error preparando signed upload para media.' }
      trackError({ error: err as Error, method: 'CLS_PrepareMarketplaceAppMediaUpload._prepareUpload', controller: 'marketplace' })
    }
  }

  private async _buildResponse(): Promise<void> {
    this._statusRequest = CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD.RequestStatus.Completed
    this._requestResponse = {
      data: {
        app_id: this._payload.app_id,
        media_type: this._payload.media_type,
        signed_url: this._signedUpload!.signedUrl,
        public_url: this._signedUpload!.publicUrl,
        storage_key: this._signedUpload!.objectPath,
        expires_in_seconds: 15 * 60
      }
    }
  }
}
