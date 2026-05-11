import { OAuth2Client } from 'google-auth-library'

import { type GoogleUserProfile } from '@/core/auth/providers/google/google.types'

import { trackError } from '@lib/functions'

/**
 * Helper para operaciones con Google OAuth
 */

let googleClient: OAuth2Client | null = null
let googleCalendarClient: OAuth2Client | null = null

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const getString = (value: unknown): string => {
  return typeof value === 'string' ? value : ''
}

const getBoolean = (value: unknown): boolean => {
  return typeof value === 'boolean' ? value : false
}

const getOptionalString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

const parseGoogleUserInfo = (value: unknown, accessToken: string): GoogleUserProfile | null => {
  if (!isRecord(value)) {
    return null
  }

  const id = getString(value.id)
  if (id.length === 0) {
    return null
  }

  return {
    id,
    email: getString(value.email),
    verified_email: getBoolean(value.verified_email),
    name: getString(value.name),
    given_name: getString(value.given_name),
    family_name: getString(value.family_name),
    picture: getOptionalString(value.picture),
    locale: getOptionalString(value.locale),
    accessToken
  }
}

/**
 * Obtiene una instancia del cliente OAuth de Google (Singleton)
 */
function getGoogleClient(): OAuth2Client {
  googleClient ??= new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI)
  return googleClient
}

/**
 * Cliente OAuth separado para el flujo de Calendar — usa GOOGLE_CALENDAR_REDIRECT_URI
 * apuntando a /api/v1/google/calendar/callback, distinto del login.
 */
function getGoogleCalendarOAuthClient(): OAuth2Client {
  googleCalendarClient ??= new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALENDAR_REDIRECT_URI)
  return googleCalendarClient
}

/**
 * Valida un token de Google y obtiene información del usuario
 * @param accessToken - Token de acceso de Google
 * @returns Promise<GoogleUserProfile | null>
 */
export async function validateGoogleToken(accessToken: string): Promise<GoogleUserProfile | null> {
  try {
    const client = getGoogleClient()
    const ticket = await client.verifyIdToken({
      idToken: accessToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    if (!payload) {
      return null
    }

    return {
      id: payload.sub,
      email: payload.email || '',
      verified_email: payload.email_verified || false,
      name: payload.name || '',
      given_name: payload.given_name || '',
      family_name: payload.family_name || '',
      picture: payload.picture,
      locale: payload.locale,
      accessToken
    }
  } catch {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`)
      if (!response.ok) {
        return null
      }

      const rawData: unknown = await response.json()
      return parseGoogleUserInfo(rawData, accessToken)
    } catch (fetchError) {
      trackError({
        method: 'validateGoogleToken',
        error: fetchError as Error,
        controller: 'google-oauth-helper'
      })
      return null
    }
  }
}

/**
 * Genera URL de autorización de Google
 * @param state - Estado para validación CSRF
 * @returns string - URL de autorización
 */
export function generateGoogleAuthUrl(state: string): string {
  const client = getGoogleClient()
  const scopes = ['openid', 'email', 'profile']

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state,
    prompt: 'consent'
  })
}

/**
 * Genera URL de autorización de Google con scopes de Calendar.
 * Flujo separado del login — el coach conecta explícitamente desde Settings.
 * @param state - Estado para validación CSRF (base64url JSON)
 * @returns string - URL de autorización
 */
export function generateGoogleCalendarAuthUrl(state: string): string {
  const client = getGoogleCalendarOAuthClient()
  const scopes = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/calendar']

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state,
    prompt: 'consent'
  })
}

/**
 * Intercambia authorization code por tokens
 * @param code - Authorization code de Google
 * @returns Promise<GoogleUserProfile | null>
 */
export async function exchangeGoogleCodeForTokens(code: string): Promise<GoogleUserProfile | null> {
  try {
    const client = getGoogleClient()
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    if (!tokens.access_token) {
      return null
    }

    return await validateGoogleToken(tokens.id_token || tokens.access_token)
  } catch (error) {
    trackError({
      method: 'exchangeGoogleCodeForTokens',
      error: error as Error,
      controller: 'google-oauth-helper'
    })
    return null
  }
}

export interface GoogleCalendarTokens {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

/**
 * Intercambia authorization code por tokens de Google Calendar.
 * Requiere que el code haya sido generado con generateGoogleCalendarAuthUrl.
 * @param code - Authorization code con scope de calendar
 * @returns Promise<GoogleCalendarTokens | null>
 */
export async function exchangeGoogleCalendarCode(code: string): Promise<GoogleCalendarTokens | null> {
  try {
    const client = getGoogleCalendarOAuthClient()
    const { tokens } = await client.getToken(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return null
    }

    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000)

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt
    }
  } catch (error) {
    trackError({
      method: 'exchangeGoogleCalendarCode',
      error: error as Error,
      controller: 'google-oauth-helper'
    })
    return null
  }
}

/**
 * Refresca el access token usando el refresh token.
 * @param refreshToken - Refresh token almacenado
 * @returns Promise<{ accessToken: string; expiresAt: Date } | null>
 */
export async function refreshGoogleAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date } | null> {
  try {
    const client = getGoogleClient()
    client.setCredentials({ refresh_token: refreshToken })
    const { credentials } = await client.refreshAccessToken()

    if (!credentials.access_token) {
      return null
    }

    const expiresAt = credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600 * 1000)

    return { accessToken: credentials.access_token, expiresAt }
  } catch (error) {
    trackError({
      method: 'refreshGoogleAccessToken',
      error: error as Error,
      controller: 'google-oauth-helper'
    })
    return null
  }
}
