import { type User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

import { CountryDB } from '@/core/auth/db/country.db'
import { UserDB } from '@/core/auth/db/user.db'

import { getAppBaseUrl } from '@lib/config'
import { sendVerificationEmail } from '@lib/functions/_send_email.function'
import { trackError } from '@lib/functions/_track_error.function'
import { logAuthActivityExtra, logUserActivity } from '@lib/helpers/_activity-log.helper'
import { generateJWTToken } from '@lib/helpers/_jwt.helper'
import { AuthResultStatus } from '@lib/interfaces'
import { type JWTRegisterPayload } from '@lib/interfaces/_auth.interfaces'

import { checkPasswordStrength } from '@utils'

import { JWT_REGISTER } from '../jwt.types'

type RequestStatus = JWT_REGISTER.RequestStatus
type RequestResponse = JWT_REGISTER.RequestResponse

/**
 * Servicio para registrar usuarios con JWT
 */
export class CLS_JWTRegister {
  private _statusRequest: RequestStatus = JWT_REGISTER.RequestStatus.Pending
  private _requestResponse: RequestResponse = {
    status: AuthResultStatus.ERROR,
    error: true,
    message: 'Proceso no iniciado'
  }
  private _payload: JWTRegisterPayload
  private _user!: User

  constructor(payload: JWTRegisterPayload) {
    this._payload = payload
  }

  private _getPassword(): string {
    if (typeof this._payload.password === 'string' && this._payload.password.length > 0) {
      return this._payload.password
    }

    if (this._payload.provider_data != null && typeof this._payload.provider_data === 'object') {
      const providerData = this._payload.provider_data as Record<string, unknown>
      if (typeof providerData.password === 'string' && providerData.password.length > 0) {
        return providerData.password
      }
    }

    return ''
  }

  public async main(): Promise<RequestResponse> {
    try {
      const commands = [
        this._validatePayload,
        this._checkExistingUser,
        this._createUser,
        this._sendVerificationEmail,
        this._generateToken,
        this._buildSuccessResponse
      ]

      for (const command of commands) {
        if (this._statusRequest === JWT_REGISTER.RequestStatus.Error || this._statusRequest === JWT_REGISTER.RequestStatus.Completed) {
          break
        }
        await command.call(this)
      }

      return this._requestResponse
    } catch (error) {
      // Si el error fue controlado por un Command (status ya es Error), devolver
      // la respuesta específica que ese Command preparó (ej: "usuario ya existe").
      if (this._statusRequest === JWT_REGISTER.RequestStatus.Error && this._requestResponse.message !== 'Proceso no iniciado') {
        trackError({
          error: error as Error,
          method: 'CLS_JWTRegister.main',
          controller: 'jwt-register'
        })
        return this._requestResponse
      }

      this._statusRequest = JWT_REGISTER.RequestStatus.Error

      trackError({
        error: error as Error,
        method: 'CLS_JWTRegister.main',
        controller: 'jwt-register'
      })

      return {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Error interno durante el registro'
      }
    }
  }

  /**
   * Command 1: Valida el payload de registro
   */
  private async _validatePayload(): Promise<void> {
    this._statusRequest = JWT_REGISTER.RequestStatus.ValidatingPayload

    const { first_name, last_name, email, country_id } = this._payload
    const password = this._getPassword()

    if (!first_name || !last_name || !email || !password || !country_id) {
      this._statusRequest = JWT_REGISTER.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Todos los campos son requeridos'
      }
      const missingFields = [
        !first_name && 'first_name',
        !last_name && 'last_name',
        !email && 'email',
        !password && 'password',
        !country_id && 'country_id'
      ].filter(Boolean)
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      this._statusRequest = JWT_REGISTER.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'El email no es válido'
      }
      throw new Error('Invalid email format')
    }

    if (checkPasswordStrength(password) < 3) {
      this._statusRequest = JWT_REGISTER.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número'
      }
      throw new Error('Weak password')
    }

    const country = await CountryDB.getById(country_id.trim().toUpperCase())
    if (!country) {
      this._statusRequest = JWT_REGISTER.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'El país seleccionado no es válido'
      }
      throw new Error(`Invalid country_id: ${country_id}`)
    }

    // Normalizar al id real por si llegó en minúsculas
    this._payload.country_id = country.id
  }

  /**
   * Command 2: Verifica si el usuario ya existe.
   * Si existe pero no ha verificado su email, reenvía el correo de verificación.
   */
  private async _checkExistingUser(): Promise<void> {
    this._statusRequest = JWT_REGISTER.RequestStatus.CheckingExistingUser

    const existingUser = await UserDB.findByEmail(this._payload.email)
    if (!existingUser) {
      return
    }

    // Usuario verificado → error real
    if (existingUser.email_verified) {
      this._statusRequest = JWT_REGISTER.RequestStatus.Error
      this._requestResponse = {
        status: AuthResultStatus.ERROR,
        error: true,
        message: 'Este correo ya tiene una cuenta. Puedes iniciar sesión o recuperar tu contraseña.',
        field: 'email',
        suggestion: 'login'
      }
      throw new Error('User already exists')
    }

    // Usuario sin verificar → reenviar email de verificación
    this._user = existingUser
    await UserDB.deleteAllEmailVerificationTokens(existingUser.id)
    await this._sendVerificationEmail()

    this._statusRequest = JWT_REGISTER.RequestStatus.Completed
    this._requestResponse = {
      status: AuthResultStatus.PENDING_VERIFICATION,
      error: false,
      message: 'Ya tienes una cuenta registrada. Te hemos reenviado el correo de verificación.',
      data: {
        user: {
          id: existingUser.id,
          email: existingUser.email,
          first_name: existingUser.first_name,
          last_name: existingUser.last_name
        }
      }
    }
  }

  /**
   * Command 3: Crea el usuario en la base de datos
   */
  private async _createUser(): Promise<void> {
    this._statusRequest = JWT_REGISTER.RequestStatus.CreatingUser

    const password = this._getPassword()
    const hashedPassword = await bcrypt.hash(password, 10)

    this._user = await UserDB.create({
      first_name: this._payload.first_name,
      last_name: this._payload.last_name,
      email: this._payload.email,
      password: hashedPassword,
      email_verified: false,
      is_active: false
    })

    await logUserActivity.created(this._user, this._user)
    await logAuthActivityExtra.registered({
      id: this._user.id,
      email: this._user.email,
      first_name: this._user.first_name,
      last_name: this._user.last_name,
      role: this._user.role
    })
  }

  /**
   * Command 4: Envía email de verificación
   */
  private async _sendVerificationEmail(): Promise<void> {
    this._statusRequest = JWT_REGISTER.RequestStatus.SendingVerification

    try {
      const token = crypto.randomUUID()
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await UserDB.createEmailVerificationToken(this._user.id, {
        token,
        expires
      })

      const validationUrl = `${getAppBaseUrl()}/api/v1/auth/sessions/verify?token=${token}`
      await sendVerificationEmail(this._user.first_name, this._user.email, validationUrl)

      await logAuthActivityExtra.verificationSent(this._user.email)
    } catch (error) {
      trackError({
        error: error as Error,
        method: 'CLS_JWTRegister._sendVerificationEmail',
        controller: 'jwt-register',
        additionalContext: {
          email: this._user.email
        }
      })
    }
  }

  /**
   * Command 5: Genera el token JWT
   */
  private async _generateToken(): Promise<void> {
    this._statusRequest = JWT_REGISTER.RequestStatus.GeneratingToken

    const jwtResult = await generateJWTToken(this._user)

    if (jwtResult.error) {
      this._statusRequest = JWT_REGISTER.RequestStatus.Error
      this._requestResponse = jwtResult
      throw new Error('Failed to generate JWT token')
    }

    this._requestResponse = jwtResult
  }

  /**
   * Command 6: Construye la respuesta exitosa
   */
  private async _buildSuccessResponse(): Promise<void> {
    this._statusRequest = JWT_REGISTER.RequestStatus.Completed
  }
}
