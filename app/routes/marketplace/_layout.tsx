import { type JSX, useMemo } from 'react'

import { LogOut, ShoppingBag, Sparkles, UserCircle } from 'lucide-react'
import { type LoaderFunctionArgs, redirect } from 'react-router'
import { Form, Link, Outlet, useLoaderData } from 'react-router'

import type { CONFIG_GET_MARKETPLACE_MEMBERSHIP_SNAPSHOT } from '@types'

type MarketplaceMembershipSnapshot = NonNullable<CONFIG_GET_MARKETPLACE_MEMBERSHIP_SNAPSHOT.RequestResponse['data']>

export type MarketplaceLayoutOutletContext = {
  membership: MarketplaceMembershipSnapshot
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_GetMarketplaceMembershipSnapshot } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''

  if (!token) {
    throw redirect('/login')
  }

  const user = verifyUserToken(token)
  if (!user) {
    throw redirect('/login')
  }

  if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
    throw redirect('/dashboard/marketplace')
  }

  const membershipResult = await new CLS_GetMarketplaceMembershipSnapshot({ user_id: user.id }).main()
  const membership = membershipResult.data

  if (membership?.access_status !== 'APPROVED') {
    throw redirect('/access-status')
  }

  const pathname = new URL(request.url).pathname
  const isProfileRoute = pathname === '/marketplace/profile' || pathname === '/marketplace/profile/'

  if (!membership.can_access_marketplace && !isProfileRoute) {
    throw redirect('/marketplace/profile')
  }

  return {
    user: { id: user.id, email: user.email, name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email },
    access_status: membership.access_status,
    membership
  }
}

export default function MarketplaceLayout(): JSX.Element {
  const { user, membership } = useLoaderData<typeof loader>()

  const membershipBadgeLabel =
    membership.reminder_variant === 'expired' ? 'Vencida' : membership.reminder_variant === 'warning' ? `${membership.days_remaining}d` : null
  const outletContext = useMemo<MarketplaceLayoutOutletContext>(() => ({ membership }), [membership])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#112032_0%,#050b14_55%)] text-mp-home-text">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-mp-home-border bg-mp-home-bg/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/marketplace" className="flex items-center gap-2 text-mp-home-text">
            <ShoppingBag className="h-5 w-5 text-mp-home-accent" />
            <span className="font-heading font-bold text-lg text-mp-home-accent-strong">WiFiMoneyStack</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/marketplace/skills"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-mp-home-muted transition-colors hover:bg-mp-home-surface hover:text-mp-home-text"
            >
              <Sparkles className="h-4 w-4" />
              Skills
            </Link>
            <Link
              to="/marketplace/profile"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-mp-home-muted transition-colors hover:bg-mp-home-surface hover:text-mp-home-text"
            >
              <UserCircle className="h-4 w-4" />
              Mi perfil
              {membershipBadgeLabel ? (
                <span className="rounded-full border border-mp-home-accent/30 bg-mp-home-accent/10 px-2 py-0.5 text-[10px] font-semibold text-mp-home-accent">
                  {membershipBadgeLabel}
                </span>
              ) : null}
            </Link>
            <span className="hidden text-sm text-mp-home-muted sm:block">{user.email}</span>
            <Form method="post" action="/api/v1/auth/sessions">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-mp-home-muted transition-colors hover:bg-mp-home-surface hover:text-mp-home-text"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </Form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet context={outletContext} />
      </main>
    </div>
  )
}
