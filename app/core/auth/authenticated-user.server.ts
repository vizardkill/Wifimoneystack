import type { Role } from '@prisma/client'

import { getSession } from '@/core/auth/cookie.server'
import { type SubappMarketplaceAccessStatus, subappSessionCookie, verifySubappSessionToken } from '@/core/auth/subapp-session.server'
import { verifyUserToken } from '@/core/auth/verify_token.server'

export interface AuthenticatedRequestUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: Role
  marketplace_access_status: SubappMarketplaceAccessStatus
  source: 'session' | 'subapp'
}

export type AuthenticatedRequestUserResult = { ok: true; user: AuthenticatedRequestUser } | { ok: false; status: 401 | 403; message: string }

export async function getAuthenticatedRequestUser(request: Request): Promise<AuthenticatedRequestUser | null> {
  const cookieHeader = request.headers.get('Cookie')
  const session = await getSession(cookieHeader)
  const tokenValue: unknown = session.get('token')
  const token = typeof tokenValue === 'string' ? tokenValue : ''

  if (token.length > 0) {
    const user = verifyUserToken(token)
    if (user) {
      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        marketplace_access_status: 'NONE',
        source: 'session'
      }
    }
  }

  const parsedSubappToken: unknown = await subappSessionCookie.parse(cookieHeader)
  const subappToken = typeof parsedSubappToken === 'string' ? parsedSubappToken : ''
  if (subappToken.length === 0) {
    return null
  }

  const claims = verifySubappSessionToken(subappToken)
  if (!claims) {
    return null
  }

  return {
    id: claims.sub,
    email: claims.email,
    first_name: claims.first_name,
    last_name: claims.last_name,
    role: claims.role,
    marketplace_access_status: claims.marketplace_access_status,
    source: 'subapp'
  }
}

export async function getMarketplaceAuthorizedRequestUser(request: Request): Promise<AuthenticatedRequestUserResult> {
  const user = await getAuthenticatedRequestUser(request)
  if (!user) {
    return { ok: false, status: 401, message: 'No autorizado.' }
  }

  if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
    return { ok: true, user: { ...user, marketplace_access_status: 'APPROVED' } }
  }

  const { CLS_GetMarketplaceMembershipSnapshot } = await import('@/core/marketplace/marketplace.server')
  const membershipResult = await new CLS_GetMarketplaceMembershipSnapshot({ user_id: user.id }).main()
  const membership = membershipResult.data

  if (membership?.access_status !== 'APPROVED') {
    return { ok: false, status: 403, message: 'Acceso marketplace no aprobado.' }
  }

  if (!membership.can_access_subapps) {
    return { ok: false, status: 403, message: 'Tu vigencia de marketplace vencio. Renueva para continuar.' }
  }

  return {
    ok: true,
    user: {
      ...user,
      marketplace_access_status: 'APPROVED'
    }
  }
}
