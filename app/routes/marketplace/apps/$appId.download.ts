import { type LoaderFunctionArgs, redirect } from 'react-router'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_RecordMarketplaceAppDownload } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }
  if (!params.appId) {
    throw redirect('/marketplace')
  }

  const result = await new CLS_RecordMarketplaceAppDownload({ user_id: user.id, app_id: params.appId }).main()

  if (result.error || !result.data?.download_url) {
    throw redirect(`/marketplace/apps/${params.appId}`)
  }

  // Redirect to storage download URL
  throw redirect(result.data.download_url)
}
