import { type LoaderFunctionArgs, redirect } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_GetMarketplaceMembershipSnapshot } = await import('@/core/marketplace/marketplace.server')
  const { attachSubappTokenToReturnTo, createSubappSessionToken, getReturnToFromRequest, serializeSubappSessionCookieFromToken } =
    await import('@/core/auth/subapp-session.server')

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

  const membershipResult = await new CLS_GetMarketplaceMembershipSnapshot({ user_id: user.id }).main()
  const membership = membershipResult.data

  if (membership?.access_status !== 'APPROVED') {
    const accessStatusRedirect = new URL('/access-status', request.url)
    accessStatusRedirect.searchParams.set('returnTo', safeReturnTo)
    return redirect(accessStatusRedirect.toString())
  }

  if (!membership.can_access_subapps) {
    const profileRedirect = new URL('/marketplace/profile', request.url)
    profileRedirect.searchParams.set('returnTo', safeReturnTo)
    return redirect(profileRedirect.toString())
  }

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
