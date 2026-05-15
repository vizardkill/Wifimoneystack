import { type LoaderFunctionArgs, redirect } from 'react-router'

import { type GoogleCallbackState, type GoogleUserProfile } from '@lib/interfaces'
import { AuthProviderType } from '@lib/interfaces'

const normalizeAccessStatus = (value: string | undefined): 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVOKED' | 'NONE' => {
  if (value === 'APPROVED' || value === 'PENDING' || value === 'REJECTED' || value === 'REVOKED') {
    return value
  }

  return 'NONE'
}

const normalizeRole = (value: string | undefined): 'USER' | 'ADMIN' | 'SUPERADMIN' => {
  if (value === 'ADMIN' || value === 'SUPERADMIN') {
    return value
  }

  return 'USER'
}

const encodeParams = (profile: GoogleUserProfile): string => {
  const params = new URLSearchParams({
    provider: 'google',
    prefill: '1',
    email: profile.email,
    first_name: profile.given_name,
    last_name: profile.family_name,
    google_id: profile.id,
    verified_email: profile.verified_email ? 'true' : 'false',
    picture: profile.picture || '',
    access_token: profile.accessToken || ''
  })

  return params.toString()
}

const parseState = (encodedState: string | null): GoogleCallbackState => {
  if (!encodedState) {
    return { mode: 'login' }
  }

  try {
    const decoded = Buffer.from(encodedState, 'base64url').toString('utf8')
    const parsed = JSON.parse(decoded) as GoogleCallbackState
    return {
      mode: parsed.mode === 'signup' ? 'signup' : 'login',
      returnTo: typeof parsed.returnTo === 'string' ? parsed.returnTo : undefined
    }
  } catch {
    return { mode: 'login' }
  }
}

const isGoogleUserProfile = (value: unknown): value is GoogleUserProfile => {
  if (value == null || typeof value !== 'object') {
    return false
  }

  const profile = value as Partial<GoogleUserProfile>
  return (
    typeof profile.id === 'string' && typeof profile.email === 'string' && typeof profile.given_name === 'string' && typeof profile.family_name === 'string'
  )
}

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const { authenticateUserAgnosticController, exchangeGoogleCodeController } = await import('@/core/auth/auth.server')
  const { commitSession, userSessionStorage } = await import('@/core/auth/cookie.server')
  const { CLS_GetMarketplaceAccessStatus } = await import('@/core/marketplace/marketplace.server')
  const { resolveSafeReturnTo, serializeSubappSessionCookie } = await import('@/core/auth/subapp-session.server')

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = parseState(url.searchParams.get('state'))
  const safeReturnTo = resolveSafeReturnTo(request, state.returnTo)

  if (!code) {
    return redirect('/login?error=google_login_failed')
  }

  const exchangeResult = await exchangeGoogleCodeController(code)
  if (!isGoogleUserProfile(exchangeResult)) {
    return redirect('/login?error=google_login_failed')
  }

  if (state.mode === 'signup') {
    const signupParams = new URLSearchParams(encodeParams(exchangeResult))
    if (safeReturnTo) {
      signupParams.set('returnTo', safeReturnTo)
    }
    return redirect(`/signup?${signupParams.toString()}`)
  }

  const authResult = await authenticateUserAgnosticController({
    provider_type: AuthProviderType.GOOGLE,
    email: exchangeResult.email,
    provider_data: {
      google_id: exchangeResult.id,
      access_token: exchangeResult.accessToken || '',
      profile: {
        picture: exchangeResult.picture,
        verified_email: exchangeResult.verified_email,
        locale: exchangeResult.locale
      }
    }
  })

  if (authResult.error && authResult.message === 'Usuario no encontrado. Regístrate primero.') {
    const signupParams = new URLSearchParams(encodeParams(exchangeResult))
    if (safeReturnTo) {
      signupParams.set('returnTo', safeReturnTo)
    }
    return redirect(`/signup?${signupParams.toString()}`)
  }

  if (authResult.error || !authResult.data?.token) {
    const loginParams = new URLSearchParams({
      error: 'google_login_failed',
      email: exchangeResult.email
    })
    if (safeReturnTo) {
      loginParams.set('returnTo', safeReturnTo)
    }
    return redirect(`/login?${loginParams.toString()}`)
  }

  const userData = authResult.data.user
  if (!userData?.id || !userData.email) {
    return redirect('/login?error=google_login_failed')
  }

  const normalizedUser = {
    id: userData.id,
    email: userData.email,
    first_name: userData.first_name ?? exchangeResult.given_name,
    last_name: userData.last_name ?? exchangeResult.family_name,
    role: normalizeRole(userData.role)
  }

  const session = await userSessionStorage.getSession(request.headers.get('Cookie'))
  session.set('token', authResult.data.token)

  let accessStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVOKED' | 'NONE' = 'APPROVED'

  if (normalizedUser.role !== 'ADMIN' && normalizedUser.role !== 'SUPERADMIN') {
    const accessResult = await new CLS_GetMarketplaceAccessStatus({ user_id: normalizedUser.id }).main()
    accessStatus = normalizeAccessStatus(accessResult.data?.access_status)
  }

  const subappCookie = await serializeSubappSessionCookie({
    user: normalizedUser,
    marketplaceAccessStatus: accessStatus
  })

  const redirectTo = safeReturnTo ?? '/'
  const headers = new Headers()
  headers.append('Set-Cookie', await commitSession(session))
  headers.append('Set-Cookie', subappCookie)

  return redirect(redirectTo, {
    headers
  })
}
