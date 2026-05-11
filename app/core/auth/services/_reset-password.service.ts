import bcrypt from 'bcryptjs'

import { PasswordResetTokenDB } from '@/core/auth/db/password-reset-token.db'
import { UserDB } from '@/core/auth/db/user.db'

import { logSecurityActivity } from '@lib/helpers/_activity-log.helper'

import { type CONFIG_RESET_PASSWORD } from '@types'

export class CLS_ResetPassword {
  private _payload: CONFIG_RESET_PASSWORD.Payload

  constructor(payload: CONFIG_RESET_PASSWORD.Payload) {
    this._payload = payload
  }

  public async execute(): Promise<CONFIG_RESET_PASSWORD.RequestResponse> {
    const { token, password } = this._payload

    const existingToken = await PasswordResetTokenDB.findByToken(token)

    if (!existingToken || existingToken.expires < new Date()) {
      return { error: true, message: 'El token es inválido o ha expirado.' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const updatedUser = await UserDB.update(existingToken.user_id, { password: hashedPassword })

    await logSecurityActivity.passwordChanged({
      id: updatedUser.id,
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      role: updatedUser.role
    })

    await PasswordResetTokenDB.delete(existingToken.id)

    return { error: false, message: '¡Tu contraseña ha sido actualizada exitosamente!' }
  }
}
