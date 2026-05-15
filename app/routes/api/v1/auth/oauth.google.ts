import { type LoaderFunctionArgs, redirect } from 'react-router'

type GoogleState = {
  mode: 'login' | 'signup'
  returnTo?: string
}

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const { getGoogleAuthUrlController } = await import('@/core/auth/auth.server')
  const { resolveSafeReturnTo } = await import('@/core/auth/subapp-session.server')
  try {
    const url = new URL(request.url)
    const mode = url.searchParams.get('mode') === 'signup' ? 'signup' : 'login'
    const safeReturnTo = resolveSafeReturnTo(request, url.searchParams.get('returnTo'))
    const statePayload: GoogleState = safeReturnTo ? { mode, returnTo: safeReturnTo } : { mode }
    const state = Buffer.from(JSON.stringify(statePayload), 'utf8').toString('base64url')

    const authUrl = getGoogleAuthUrlController(state)
    return redirect(authUrl)
  } catch {
    return redirect('/login?error=google_login_failed')
  }
}
