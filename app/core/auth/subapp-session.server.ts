import type { Role, User } from '@prisma/client'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import path from 'path'
import { createCookie } from 'react-router'

export type SubappMarketplaceAccessStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVOKED' | 'NONE'

export interface SubappSessionClaims {
  aud: string
  email: string
  first_name: string
  iss: string
  last_name: string
  marketplace_access_status: SubappMarketplaceAccessStatus
  role: Role
  sub: string
}

const subappSessionCookieName = process.env.SUBAPP_SESSION_COOKIE_NAME?.trim() || 'wmc_app_session'
const subappSessionAudience = process.env.SUBAPP_SESSION_AUDIENCE?.trim() || 'subapps'
const subappSessionIssuer = process.env.SUBAPP_SESSION_ISSUER?.trim() || 'marketplace-ecommerce'
const subappSessionMaxAge = Number.parseInt(process.env.SUBAPP_SESSION_MAX_AGE_SECONDS ?? '28800', 10)
const subappTokenQueryParam = process.env.SUBAPP_TOKEN_QUERY_PARAM?.trim() || 'wmc_subapp_token'
const configuredCookieDomain = process.env.SUBAPP_COOKIE_DOMAIN?.trim()
const configuredRootDomain = process.env.SUBAPP_ROOT_DOMAIN?.trim()

const normalizeCookieDomain = (): string | undefined => {
  if (!configuredCookieDomain || configuredCookieDomain.length === 0) {
    return undefined
  }

  return configuredCookieDomain
}

const isLocalHost = (hostname: string): boolean => {
  return ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)
}

const getAllowedRootDomain = (request: Request): string | null => {
  if (configuredRootDomain && configuredRootDomain.length > 0) {
    return configuredRootDomain.replace(/^\./, '')
  }

  if (configuredCookieDomain && configuredCookieDomain.length > 0) {
    return configuredCookieDomain.replace(/^\./, '')
  }

  try {
    const appUrl = process.env.APP_URL
    if (typeof appUrl === 'string') {
      const normalizedAppUrl = appUrl.trim()
      if (normalizedAppUrl.length > 0) {
        return new URL(normalizedAppUrl).hostname.replace(/^\./, '')
      }
    }
  } catch {
    return null
  }

  const currentHost = new URL(request.url).hostname
  return isLocalHost(currentHost) ? currentHost : null
}

const isAllowedReturnToHost = (request: Request, hostname: string): boolean => {
  const currentHost = new URL(request.url).hostname
  if (hostname === currentHost) {
    return true
  }

  if (isLocalHost(hostname) && process.env.NODE_ENV !== 'production') {
    return true
  }

  const allowedRootDomain = getAllowedRootDomain(request)
  if (!allowedRootDomain) {
    return false
  }

  return hostname === allowedRootDomain || hostname.endsWith(`.${allowedRootDomain}`)
}

const readSigningKey = (fileName: string): string => {
  return fs.readFileSync(path.resolve(process.cwd(), fileName), 'utf8')
}

export const subappSessionCookie = createCookie(subappSessionCookieName, {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: Number.isFinite(subappSessionMaxAge) ? subappSessionMaxAge : 28800,
  ...(normalizeCookieDomain() ? { domain: normalizeCookieDomain() } : {})
})

export const resolveSafeReturnTo = (request: Request, rawReturnTo: string | null | undefined): string | null => {
  if (typeof rawReturnTo !== 'string' || rawReturnTo.trim().length === 0) {
    return null
  }

  try {
    const requestUrl = new URL(request.url)
    const targetUrl = new URL(rawReturnTo, requestUrl)

    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return null
    }

    if (process.env.NODE_ENV === 'production' && targetUrl.protocol !== 'https:') {
      return null
    }

    if (!isAllowedReturnToHost(request, targetUrl.hostname)) {
      return null
    }

    return targetUrl.toString()
  } catch {
    return null
  }
}

export const getReturnToFromRequest = (request: Request): string | null => {
  const url = new URL(request.url)
  return resolveSafeReturnTo(request, url.searchParams.get('returnTo'))
}

export const getSubappTokenQueryParamName = (): string => {
  return subappTokenQueryParam
}

export const buildLoginRedirectUrl = (request: Request): string => {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('returnTo', new URL(request.url).toString())
  return loginUrl.toString()
}

export const buildAccessStatusRedirectUrl = (request: Request): string => {
  const accessStatusUrl = new URL('/access-status', request.url)
  accessStatusUrl.searchParams.set('returnTo', new URL(request.url).toString())
  return accessStatusUrl.toString()
}

export const serializeSubappSessionCookie = async ({
  marketplaceAccessStatus,
  user
}: {
  marketplaceAccessStatus: SubappMarketplaceAccessStatus
  user: Pick<User, 'email' | 'first_name' | 'id' | 'last_name' | 'role'>
}): Promise<string> => {
  const token = await createSubappSessionToken({ marketplaceAccessStatus, user })
  return serializeSubappSessionCookieFromToken(token)
}

export const createSubappSessionToken = ({
  marketplaceAccessStatus,
  user
}: {
  marketplaceAccessStatus: SubappMarketplaceAccessStatus
  user: Pick<User, 'email' | 'first_name' | 'id' | 'last_name' | 'role'>
}): Promise<string> => {
  const signingKey = readSigningKey('jwtRS256.key')
  return Promise.resolve(
    jwt.sign(
      {
        aud: subappSessionAudience,
        email: user.email,
        first_name: user.first_name,
        iss: subappSessionIssuer,
        last_name: user.last_name,
        marketplace_access_status: marketplaceAccessStatus,
        role: user.role,
        sub: user.id
      } satisfies SubappSessionClaims,
      signingKey,
      {
        algorithm: 'RS256',
        expiresIn: Number.isFinite(subappSessionMaxAge) ? subappSessionMaxAge : 28800
      }
    )
  )
}

export const serializeSubappSessionCookieFromToken = async (token: string): Promise<string> => {
  return subappSessionCookie.serialize(token)
}

export const attachSubappTokenToReturnTo = (returnTo: string, token: string): string => {
  try {
    const returnToUrl = new URL(returnTo)
    returnToUrl.searchParams.set(subappTokenQueryParam, token)
    return returnToUrl.toString()
  } catch {
    return returnTo
  }
}

export const serializeExpiredSubappSessionCookie = async (): Promise<string> => {
  return subappSessionCookie.serialize('', { maxAge: 0 })
}

export const verifySubappSessionToken = (token: string): SubappSessionClaims | null => {
  try {
    const publicKey = readSigningKey('jwtRS256.key.pub')
    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience: subappSessionAudience,
      issuer: subappSessionIssuer
    }) as SubappSessionClaims
  } catch {
    return null
  }
}
