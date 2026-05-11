import { type LoaderFunctionArgs, redirect } from 'react-router'

import { type GoogleCallbackState, type GoogleUserProfile } from '@lib/interfaces'
import { AuthProviderType } from '@lib/interfaces'

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
      mode: parsed.mode === 'signup' ? 'signup' : 'login'
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

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = parseState(url.searchParams.get('state'))

  if (!code) {
    return redirect('/login?error=google_login_failed')
  }

  const exchangeResult = await exchangeGoogleCodeController(code)
  if (!isGoogleUserProfile(exchangeResult)) {
    return redirect('/login?error=google_login_failed')
  }

  if (state.mode === 'signup') {
    return redirect(`/signup?${encodeParams(exchangeResult)}`)
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
    return redirect(`/signup?${encodeParams(exchangeResult)}`)
  }

  if (authResult.error || !authResult.data?.token) {
    const loginParams = new URLSearchParams({
      error: 'google_login_failed',
      email: exchangeResult.email
    })
    return redirect(`/login?${loginParams.toString()}`)
  }

  const session = await userSessionStorage.getSession(request.headers.get('Cookie'))
  session.set('token', authResult.data.token)

  return redirect('/', {
    headers: {
      'Set-Cookie': await commitSession(session)
    }
  })
}
