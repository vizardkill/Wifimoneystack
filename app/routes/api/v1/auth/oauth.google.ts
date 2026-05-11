import { type LoaderFunctionArgs, redirect } from 'react-router'

type GoogleState = {
  mode: 'login' | 'signup'
}

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const { getGoogleAuthUrlController } = await import('@/core/auth/auth.server')
  try {
    const url = new URL(request.url)
    const mode = url.searchParams.get('mode') === 'signup' ? 'signup' : 'login'
    const statePayload: GoogleState = { mode }
    const state = Buffer.from(JSON.stringify(statePayload), 'utf8').toString('base64url')

    const authUrl = getGoogleAuthUrlController(state)
    return redirect(authUrl)
  } catch {
    return redirect('/login?error=google_login_failed')
  }
}
