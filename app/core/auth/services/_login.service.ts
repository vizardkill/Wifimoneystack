import { type User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { UserDB } from '@/core/auth/db/user.db'

import { getServerOnlyModules } from '@lib/functions/_get_server_modules.function'
import { trackError } from '@lib/functions/_track_error.function'
import { logAuthActivity } from '@lib/helpers/_activity-log.helper'

import { CONFIG_LOGIN_USER } from '@types'

export class CLS_LoginUser {
  private _payload!: CONFIG_LOGIN_USER.Payload
  private _requestResponse!: CONFIG_LOGIN_USER.RequestResponse
  private _statusRequest: CONFIG_LOGIN_USER.RequestStatus = CONFIG_LOGIN_USER.RequestStatus.Pending
  private _userData: User | null = null

  constructor(payload: CONFIG_LOGIN_USER.Payload) {
    this._payload = payload
  }

  public async main(): Promise<CONFIG_LOGIN_USER.RequestResponse> {
    const steps = [this._validatePayload, this._findUser, this._verifyPassword, this._generateJWT]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_LOGIN_USER.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    return this._requestResponse
  }

  private async _validatePayload(): Promise<void> {
    const { email, password } = this._payload
    if (!email || !password) {
      this._statusRequest = CONFIG_LOGIN_USER.RequestStatus.Error
      this._requestResponse = {
        error: true,
        message: 'Email y contraseña son requeridos'
      }
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      this._statusRequest = CONFIG_LOGIN_USER.RequestStatus.Error
      this._requestResponse = {
        error: true,
        message: 'El email no es válido'
      }
      return
    }
  }

  private async _findUser(): Promise<void> {
    try {
      const user = await UserDB.findByEmail(this._payload.email)
      if (!user) {
        trackError({
          method: 'CLS_LoginUser._findUser',
          error: new Error('Login attempt with non-existent user'),
          controller: 'CLS_LoginUser',
          additionalContext: {
            email: this._payload.email
          }
        })
        await logAuthActivity.failed(this._payload.email, 'User not found')

        this._statusRequest = CONFIG_LOGIN_USER.RequestStatus.Error
        this._requestResponse = {
          error: true,
          message: 'Usuario o contraseña incorrectos'
        }
        return
      }

      if (!user.email_verified) {
        trackError({
          method: 'CLS_LoginUser._findUser',
          error: new Error('Login attempt with unverified email'),
          controller: 'CLS_LoginUser',
          additionalContext: {
            email: this._payload.email,
            userId: user.id
          }
        })
        await logAuthActivity.failed(this._payload.email, 'Email not verified')

        this._statusRequest = CONFIG_LOGIN_USER.RequestStatus.Error
        this._requestResponse = {
          error: true,
          message: 'Debes verificar tu correo electrónico antes de iniciar sesión.',
          field: 'email'
        }
        return
      }
      this._userData = user
    } catch (error) {
      this._statusRequest = CONFIG_LOGIN_USER.RequestStatus.Error
      this._requestResponse = {
        error: true,
        message: `Error al buscar el usuario: ${(error as Error).message}`
      }
      trackError({
        method: 'CLS_LoginUser._findUser',
        error: error as Error,
        controller: 'CLS_LoginUser',
        additionalContext: {
          email: this._payload.email
        }
      })
    }
  }

  private async _verifyPassword(): Promise<void> {
    try {
      if (!this._userData) {
        this._statusRequest = CONFIG_LOGIN_USER.RequestStatus.Error
        this._requestResponse = {
          error: true,
          message: 'Usuario o contraseña incorrectos'
        }
        return
      }

      const isMatch = await bcrypt.compare(this._payload.password, this._userData.password)
      if (!isMatch) {
        await logAuthActivity.failed(this._payload.email, 'Invalid password')

        this._statusRequest = CONFIG_LOGIN_USER.RequestStatus.Error
        this._requestResponse = {
          error: true,
          message: 'Usuario o contraseña incorrectos'
        }
        return
      }
    } catch (error) {
      this._statusRequest = CONFIG_LOGIN_USER.RequestStatus.Error
      this._requestResponse = {
        error: true,
        message: `Error al verificar la contraseña: ${(error as Error).message}`
      }
      trackError({
        method: 'CLS_LoginUser._verifyPassword',
        error: error as Error,
        controller: 'CLS_LoginUser',
        additionalContext: {
          email: this._payload.email
        }
      })
    }
  }

  private async _generateJWT(): Promise<void> {
    try {
      if (!this._userData) {
        this._statusRequest = CONFIG_LOGIN_USER.RequestStatus.Error
        this._requestResponse = {
          error: true,
          message: 'Usuario o contraseña incorrectos'
        }
        return
      }

      if (typeof window !== 'undefined') {
        throw new Error('Server-only modules cannot be loaded on the client.')
      }

      const { fs, path, process } = await getServerOnlyModules()

      const privateKeyPath = path.resolve(process.cwd(), 'jwtRS256.key')
      const privateKey = fs.readFileSync(privateKeyPath, 'utf8')
      const payload = {
        id: this._userData.id,
        email: this._userData.email,
        first_name: this._userData.first_name,
        last_name: this._userData.last_name,
        role: this._userData.role
      }
      const token = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '7d'
      })
      this._statusRequest = CONFIG_LOGIN_USER.RequestStatus.Completed
      this._requestResponse = {
        error: false,
        message: 'Login exitoso',
        data: {
          user: {
            id: this._userData.id,
            email: this._userData.email,
            first_name: this._userData.first_name,
            last_name: this._userData.last_name,
            role: this._userData.role
          },
          token
        }
      }

      await logAuthActivity.login(this._userData)
    } catch (error) {
      this._statusRequest = CONFIG_LOGIN_USER.RequestStatus.Error
      this._requestResponse = {
        error: true,
        message: `Error al generar el token: ${(error as Error).message}`
      }
      trackError({
        method: 'CLS_LoginUser._generateJWT',
        error: error as Error,
        controller: 'CLS_LoginUser',
        additionalContext: {
          email: this._payload.email
        }
      })
    }
  }
}
