import type { Prisma } from '@prisma/client'

import { UserDB } from '@/core/auth/db/user.db'
import { AppArtifactDB } from '@/core/marketplace/db/app-artifact.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'

import { parseSkillManifest, type SkillManifest } from '@lib/functions/_parse-skill-manifest.function'
import { trackError } from '@lib/functions/_track_error.function'
import { writeMarketplaceAuditEvent } from '@lib/helpers/_marketplace-audit.helper'
import { uploadBufferToStorage } from '@lib/services/_storage.service'

import { CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT } from '@types'

type RequestStatus = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus
type RequestResponse = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestResponse
type Payload = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.Payload

const MAX_SKILL_BYTES = 25 * 1024 * 1024

/**
 * Registra el paquete .zip de un skill de Claude: parsea su SKILL.md, sube el
 * artefacto al storage, lo persiste con su metadata y marca la app como
 * skill descargable (categoría CLAUDE_SKILL + modo PACKAGE_DOWNLOAD).
 */
export class CLS_RegisterMarketplaceAppSkillArtifact {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  private _manifest: SkillManifest | null = null
  private _objectPath = ''
  private _artifact: Awaited<ReturnType<typeof AppArtifactDB.create>> | null = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [
      this._verifyActorRole,
      this._verifyAppExists,
      this._validateAndParse,
      this._uploadArtifact,
      this._persistArtifact,
      this._markAppAsSkill,
      this._writeAudit,
      this._buildResponse
    ]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo registrar el paquete del skill.' }
    }

    return this._requestResponse
  }

  private async _verifyActorRole(): Promise<void> {
    try {
      const actor = await UserDB.getById(this._payload.actor_user_id)
      const hasMarketplaceAdminAccess = actor?.role === 'ADMIN' || actor?.role === 'SUPERADMIN'

      if (!hasMarketplaceAdminAccess) {
        this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Forbidden
        this._requestResponse = {
          error: true,
          message: 'Sin permisos para registrar paquetes de skills.',
          status: CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Forbidden
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error validando permisos del actor.' }
      trackError({ error: err as Error, method: 'CLS_RegisterMarketplaceAppSkillArtifact._verifyActorRole', controller: 'marketplace' })
    }
  }

  private async _verifyAppExists(): Promise<void> {
    try {
      const app = await MarketplaceAppDB.findById(this._payload.app_id)
      if (!app) {
        this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.NotFound
        this._requestResponse = {
          error: true,
          message: 'Aplicación no encontrada para registrar el skill.',
          status: CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.NotFound
        }
      }
    } catch (err) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error cargando la app para registrar el skill.' }
      trackError({ error: err as Error, method: 'CLS_RegisterMarketplaceAppSkillArtifact._verifyAppExists', controller: 'marketplace' })
    }
  }

  private async _validateAndParse(): Promise<void> {
    const fileName = this._payload.file_name.trim()
    const isZipName = fileName.toLowerCase().endsWith('.zip')

    if (!isZipName) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Validation
      this._requestResponse = {
        error: true,
        message: 'El skill debe subirse como archivo .zip.',
        status: CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Validation,
        field_errors: { file_name: 'Formato no soportado. Sube un .zip.' }
      }
      return
    }

    if (this._payload.file_bytes.byteLength === 0) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Validation
      this._requestResponse = {
        error: true,
        message: 'El archivo está vacío.',
        status: CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Validation,
        field_errors: { file_bytes: 'El archivo no contiene datos.' }
      }
      return
    }

    if (this._payload.file_bytes.byteLength > MAX_SKILL_BYTES) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Validation
      this._requestResponse = {
        error: true,
        message: 'El paquete del skill supera el tamaño máximo permitido (25 MB).',
        status: CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Validation,
        field_errors: { file_bytes: 'Reduce el tamaño del paquete.' }
      }
      return
    }

    const parsed = parseSkillManifest(this._payload.file_bytes)
    if (!parsed.ok) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Validation
      this._requestResponse = {
        error: true,
        message: parsed.message,
        status: CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Validation,
        field_errors: { file_bytes: parsed.message }
      }
      return
    }

    this._manifest = parsed.manifest
  }

  private async _uploadArtifact(): Promise<void> {
    try {
      const timestamp = Date.now().toString()
      const fileName = `${this._payload.app_id}/skill-${timestamp}.zip`
      const buffer = Buffer.from(this._payload.file_bytes)

      const result = await uploadBufferToStorage(buffer, 'marketplace/artifacts', fileName, 'application/zip')
      this._objectPath = result.objectPath
    } catch (err) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error subiendo el paquete del skill al storage.' }
      trackError({ error: err as Error, method: 'CLS_RegisterMarketplaceAppSkillArtifact._uploadArtifact', controller: 'marketplace' })
    }
  }

  private async _persistArtifact(): Promise<void> {
    try {
      const manifest = this._manifest!
      const versionLabel = this._payload.version_label?.trim() || manifest.version || null

      this._artifact = await AppArtifactDB.create({
        app_id: this._payload.app_id,
        storage_key: this._objectPath,
        file_name: this._payload.file_name.trim(),
        mime_type: 'application/zip',
        size_bytes: BigInt(this._payload.file_bytes.byteLength),
        version_label: versionLabel ?? undefined,
        skill_metadata: {
          name: manifest.name,
          description: manifest.description,
          license: manifest.license,
          allowed_tools: manifest.allowed_tools,
          version: manifest.version,
          source_path: manifest.source_path,
          raw: manifest.raw
        } as Prisma.InputJsonValue,
        created_by_user_id: this._payload.actor_user_id
      })
    } catch (err) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error guardando el artefacto del skill.' }
      trackError({ error: err as Error, method: 'CLS_RegisterMarketplaceAppSkillArtifact._persistArtifact', controller: 'marketplace' })
    }
  }

  private async _markAppAsSkill(): Promise<void> {
    try {
      await MarketplaceAppDB.markAsClaudeSkill(this._payload.app_id, this._payload.actor_user_id)
    } catch (err) {
      this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error marcando la app como skill descargable.' }
      trackError({ error: err as Error, method: 'CLS_RegisterMarketplaceAppSkillArtifact._markAppAsSkill', controller: 'marketplace' })
    }
  }

  private async _writeAudit(): Promise<void> {
    await writeMarketplaceAuditEvent({
      actor_user_id: this._payload.actor_user_id,
      app_id: this._payload.app_id,
      action: 'APP_ARTIFACT_UPDATED',
      metadata: {
        app_id: this._payload.app_id,
        action: 'APP_ARTIFACT_UPDATED',
        artifact_id: this._artifact?.id,
        skill_name: this._manifest?.name,
        version_label: this._artifact?.version_label ?? null
      }
    })
  }

  private async _buildResponse(): Promise<void> {
    const manifest = this._manifest!
    const artifact = this._artifact!

    this._statusRequest = CONFIG_REGISTER_MARKETPLACE_APP_SKILL_ARTIFACT.RequestStatus.Completed
    this._requestResponse = {
      data: {
        artifact_id: artifact.id,
        file_name: artifact.file_name,
        skill_name: manifest.name,
        skill_description: manifest.description,
        allowed_tools: manifest.allowed_tools,
        version_label: artifact.version_label
      }
    }
  }
}
