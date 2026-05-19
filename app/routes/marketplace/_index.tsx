import type { JSX } from 'react'

import { data, type LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'

import { buildCuratedHomeViewModel, MarketplaceHomeShell, parseMarketplaceHomeDiscoveryState } from '@modules/marketplace'

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_ListPublishedMarketplaceApps } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    const { redirect } = await import('react-router')
    throw redirect('/login')
  }

  const url = new URL(request.url)
  const discovery = parseMarketplaceHomeDiscoveryState(url.searchParams)

  const result = await new CLS_ListPublishedMarketplaceApps({
    user_id: user.id,
    page: 1,
    per_page: 240
  }).main()

  const viewModel = buildCuratedHomeViewModel({
    apps: result.data?.apps ?? [],
    discovery
  })

  return data({
    viewModel,
    error: result.error ? (result.message ?? 'No pudimos cargar el marketplace.') : null
  })
}

export default function MarketplaceIndexPage(): JSX.Element {
  const { viewModel, error } = useLoaderData<typeof loader>()

  return <MarketplaceHomeShell viewModel={viewModel} error={error} />
}
