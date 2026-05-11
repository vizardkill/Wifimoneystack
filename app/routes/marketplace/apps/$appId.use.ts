import { type ActionFunctionArgs, redirect } from 'react-router'

export async function loader({ request, params }: ActionFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_RecordMarketplaceAppUse } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }
  if (!params.appId) {
    throw redirect('/marketplace')
  }

  const result = await new CLS_RecordMarketplaceAppUse({ user_id: user.id, app_id: params.appId }).main()

  if (result.error || !result.data?.redirect_url) {
    throw redirect(`/marketplace/apps/${params.appId}`)
  }

  throw redirect(result.data.redirect_url)
}

export async function action({ request, params }: ActionFunctionArgs) {
  return loader({ request, params } as ActionFunctionArgs)
}
