import type { JSX } from 'react'

import { data, type LoaderFunctionArgs, redirect } from 'react-router'
import { useLoaderData } from 'react-router'

import { MarketplaceAdminDashboardShell } from '@modules/marketplace/admin/dashboard'

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_GetMarketplaceDashboard } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }
  const hasMarketplaceAdminAccess = user.role === 'ADMIN' || user.role === 'SUPERADMIN'
  if (!hasMarketplaceAdminAccess) {
    throw redirect('/dashboard')
  }

  const result = await new CLS_GetMarketplaceDashboard({ days: 30 }).main()

  return data({
    kpis: result.data?.kpis ?? null,
    kpis_variation_7d: result.data?.kpis_variation_7d ?? null,
    top_apps: result.data?.top_apps ?? [],
    no_activity_apps: result.data?.no_activity_apps ?? [],
    error: result.error ? (result.message ?? 'No se pudo cargar el dashboard del marketplace.') : null
  })
}

export default function AdminMarketplaceDashboard(): JSX.Element {
  const { kpis, kpis_variation_7d, top_apps, no_activity_apps, error } = useLoaderData<typeof loader>()

  return <MarketplaceAdminDashboardShell kpis={kpis} kpisVariation7d={kpis_variation_7d} topApps={top_apps} noActivityApps={no_activity_apps} error={error} />
}
