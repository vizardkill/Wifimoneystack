import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from 'react-router'

import { commitSession, getSession } from '@/core/auth/cookie.server'

const clearSessionAndRedirect = async (request: Request): Promise<Response> => {
  const { serializeExpiredSubappSessionCookie } = await import('@/core/auth/subapp-session.server')
  const session = await getSession(request.headers.get('Cookie'))
  session.unset('token')
  const headers = new Headers()
  headers.append('Set-Cookie', await commitSession(session))
  headers.append('Set-Cookie', await serializeExpiredSubappSessionCookie())

  return redirect('/login', {
    headers
  })
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  return clearSessionAndRedirect(request)
}

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  return clearSessionAndRedirect(request)
}
