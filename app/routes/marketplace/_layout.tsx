import type { JSX } from 'react'

import { LogOut, ShoppingBag } from 'lucide-react'
import { type LoaderFunctionArgs, redirect } from 'react-router'
import { Form, Link, Outlet, useLoaderData } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_GetMarketplaceAccessStatus } = await import('@/core/marketplace/marketplace.server')

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

  const accessResult = await new CLS_GetMarketplaceAccessStatus({ user_id: user.id }).main()
  const accessStatus = accessResult.data?.access_status ?? 'NONE'

  if (accessStatus !== 'APPROVED') {
    throw redirect('/access-status')
  }

  return {
    user: { id: user.id, email: user.email, name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email },
    access_status: accessStatus
  }
}

export default function MarketplaceLayout(): JSX.Element {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-[var(--color-mp-ivory)]">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-[var(--color-mp-charcoal)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/marketplace" className="flex items-center gap-2 text-white">
            <ShoppingBag className="h-5 w-5 text-[var(--color-mp-neon)]" />
            <span className="font-heading font-bold text-lg">Marketplace</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
            <Form method="post" action="/api/v1/auth/sessions">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </Form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
