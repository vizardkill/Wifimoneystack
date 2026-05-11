import type { JSX } from 'react'

import { data, type LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'

import { AppDetail } from '@modules/marketplace'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_GetMarketplaceApp } = await import('@/core/marketplace/marketplace.server')
  const { redirect } = await import('react-router')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }
  if (!params.appId) {
    throw redirect('/marketplace')
  }

  const result = await new CLS_GetMarketplaceApp({ user_id: user.id, app_id: params.appId }).main()

  if (result.error) {
    throw redirect('/marketplace')
  }

  return data({ app: result.data! })
}

export default function AppDetailPage(): JSX.Element {
  const { app } = useLoaderData<typeof loader>()

  return <AppDetail app={app} />
}
