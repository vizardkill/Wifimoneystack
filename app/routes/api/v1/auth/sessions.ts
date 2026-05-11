import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from 'react-router'

import { commitSession, getSession } from '@/core/auth/cookie.server'

const clearSessionAndRedirect = async (request: Request): Promise<Response> => {
  const session = await getSession(request.headers.get('Cookie'))
  session.unset('token')

  return redirect('/login', {
    headers: {
      'Set-Cookie': await commitSession(session)
    }
  })
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  return clearSessionAndRedirect(request)
}

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  return clearSessionAndRedirect(request)
}
