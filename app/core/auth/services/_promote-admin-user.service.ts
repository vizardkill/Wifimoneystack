import { UserDB } from '@/core/auth/db/user.db'

import { trackError } from '@lib/functions/_track_error.function'
import { buildAdminPromotionAuditMeta, writeMarketplaceAuditEvent } from '@lib/helpers/_marketplace-audit.helper'

import { CONFIG_LIST_ADMIN_ACCOUNTS, CONFIG_PROMOTE_USER_TO_ADMIN } from '@types'

function normalizeDisplayName(firstName: string, lastName: string): string | null {
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName.length > 0 ? fullName : null
}

export class CLS_ListAdminAccounts {
  private _payload: CONFIG_LIST_ADMIN_ACCOUNTS.Payload
  private _requestResponse!: CONFIG_LIST_ADMIN_ACCOUNTS.RequestResponse

  constructor(payload: CONFIG_LIST_ADMIN_ACCOUNTS.Payload) {
    this._payload = payload
  }

  public async main(): Promise<CONFIG_LIST_ADMIN_ACCOUNTS.RequestResponse> {
    try {
      const actor = await UserDB.getById(this._payload.actor_user_id)

      if (actor?.role !== 'SUPERADMIN') {
        this._requestResponse = {
          error: true,
          status: CONFIG_LIST_ADMIN_ACCOUNTS.RequestStatus.Forbidden,
          message: 'No tienes permisos para listar administradores.'
        }
        return this._requestResponse
      }

      const page = this._payload.page ?? 1
      const perPage = this._payload.per_page ?? 20
      const search = this._payload.search?.trim() || undefined

      const { admins, total } = await UserDB.listAdminAccounts({
        search,
        page,
        per_page: perPage
      })

      this._requestResponse = {
        error: false,
        status: CONFIG_LIST_ADMIN_ACCOUNTS.RequestStatus.Completed,
        data: {
          admins: admins.map((admin) => ({
            id: admin.id,
            email: admin.email,
            name: normalizeDisplayName(admin.first_name, admin.last_name),
            role: admin.role,
            created_at: admin.created_at
          })),
          total,
          page,
          per_page: perPage
        }
      }

      return this._requestResponse
    } catch (error) {
      trackError({
        method: 'CLS_ListAdminAccounts.main',
        controller: 'auth-admins',
        error: error as Error,
        additionalContext: {
          actor_user_id: this._payload.actor_user_id,
          page: this._payload.page,
          per_page: this._payload.per_page,
          search: this._payload.search
        }
      })

      this._requestResponse = {
        error: true,
        status: CONFIG_LIST_ADMIN_ACCOUNTS.RequestStatus.Error,
        message: 'No fue posible listar administradores.'
      }

      return this._requestResponse
    }
  }
}

export class CLS_PromoteUserToAdmin {
  private _payload: CONFIG_PROMOTE_USER_TO_ADMIN.Payload
  private _requestResponse!: CONFIG_PROMOTE_USER_TO_ADMIN.RequestResponse

  constructor(payload: CONFIG_PROMOTE_USER_TO_ADMIN.Payload) {
    this._payload = payload
  }

  public async main(): Promise<CONFIG_PROMOTE_USER_TO_ADMIN.RequestResponse> {
    try {
      const actor = await UserDB.getById(this._payload.actor_user_id)

      if (actor?.role !== 'SUPERADMIN') {
        this._requestResponse = {
          error: true,
          status: CONFIG_PROMOTE_USER_TO_ADMIN.RequestStatus.Forbidden,
          message: 'No tienes permisos para promover usuarios.'
        }
        return this._requestResponse
      }

      const targetEmail = this._payload.target_email.trim().toLowerCase()
      if (!targetEmail) {
        this._requestResponse = {
          error: true,
          status: CONFIG_PROMOTE_USER_TO_ADMIN.RequestStatus.Error,
          message: 'Debes enviar un email válido.'
        }
        return this._requestResponse
      }

      const result = await UserDB.promoteToAdminByEmail(targetEmail)

      if (result.status === 'not_found') {
        this._requestResponse = {
          error: true,
          status: CONFIG_PROMOTE_USER_TO_ADMIN.RequestStatus.NotFound,
          message: 'No se encontró un usuario con ese email.'
        }
        return this._requestResponse
      }

      if (result.status === 'already_admin') {
        this._requestResponse = {
          error: true,
          status: CONFIG_PROMOTE_USER_TO_ADMIN.RequestStatus.AlreadyAdmin,
          message: 'El usuario ya tiene permisos administrativos.'
        }
        return this._requestResponse
      }

      await writeMarketplaceAuditEvent({
        actor_user_id: actor.id,
        target_user_id: result.user.id,
        action: 'ADMIN_PROMOTED',
        reason: 'Promoción manual de cuenta administradora',
        metadata: buildAdminPromotionAuditMeta({
          target_email: result.user.email,
          previous_role: 'USER',
          promoted_role: 'ADMIN'
        })
      })

      this._requestResponse = {
        error: false,
        status: CONFIG_PROMOTE_USER_TO_ADMIN.RequestStatus.Completed,
        message: 'Usuario promovido correctamente.',
        data: {
          target_user_id: result.user.id,
          new_role: 'ADMIN'
        }
      }

      return this._requestResponse
    } catch (error) {
      trackError({
        method: 'CLS_PromoteUserToAdmin.main',
        controller: 'auth-admins',
        error: error as Error,
        additionalContext: {
          actor_user_id: this._payload.actor_user_id,
          target_email: this._payload.target_email
        }
      })

      this._requestResponse = {
        error: true,
        status: CONFIG_PROMOTE_USER_TO_ADMIN.RequestStatus.Error,
        message: 'No fue posible promover el usuario.'
      }

      return this._requestResponse
    }
  }
}
