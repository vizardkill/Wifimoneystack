import { type LoaderFunctionArgs, redirect } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_GetMarketplaceAccessStatus } = await import('@/core/marketplace/marketplace.server')
  const { attachSubappTokenToReturnTo, createSubappSessionToken, getReturnToFromRequest, serializeSubappSessionCookieFromToken } =
    await import('@/core/auth/subapp-session.server')

  const normalizeAccessStatus = (value: string | undefined): 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVOKED' | 'NONE' => {
    if (value === 'APPROVED' || value === 'PENDING' || value === 'REJECTED' || value === 'REVOKED') {
      return value
    }

    return 'NONE'
  }

  const safeReturnTo = getReturnToFromRequest(request)

  if (!safeReturnTo) {
    return redirect('/marketplace')
  }

  const session = await getSession(request.headers.get('Cookie'))
  const tokenValue: unknown = session.get('token')
  const token = typeof tokenValue === 'string' ? tokenValue : ''

  if (token.length === 0) {
    const loginRedirect = new URL('/login', request.url)
    loginRedirect.searchParams.set('returnTo', new URL(request.url).toString())
    return redirect(loginRedirect.toString())
  }

  const user = verifyUserToken(token)
  if (!user) {
    const loginRedirect = new URL('/login', request.url)
    loginRedirect.searchParams.set('returnTo', new URL(request.url).toString())
    return redirect(loginRedirect.toString())
  }

  if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
    const sessionToken = await createSubappSessionToken({
      user,
      marketplaceAccessStatus: 'APPROVED'
    })
    const setCookie = await serializeSubappSessionCookieFromToken(sessionToken)
    const redirectTarget = attachSubappTokenToReturnTo(safeReturnTo, sessionToken)

    return redirect(redirectTarget, {
      headers: {
        'Set-Cookie': setCookie
      }
    })
  }

  const accessResult = await new CLS_GetMarketplaceAccessStatus({ user_id: user.id }).main()
  const accessStatus = normalizeAccessStatus(accessResult.data?.access_status)

  if (accessStatus !== 'APPROVED') {
    const accessStatusRedirect = new URL('/access-status', request.url)
    accessStatusRedirect.searchParams.set('returnTo', safeReturnTo)
    return redirect(accessStatusRedirect.toString())
  }

  const sessionToken = await createSubappSessionToken({
    user,
    marketplaceAccessStatus: accessStatus
  })
  const setCookie = await serializeSubappSessionCookieFromToken(sessionToken)
  const redirectTarget = attachSubappTokenToReturnTo(safeReturnTo, sessionToken)

  return redirect(redirectTarget, {
    headers: {
      'Set-Cookie': setCookie
    }
  })
}
