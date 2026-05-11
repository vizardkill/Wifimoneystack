import type { JSX } from 'react'

import { LayoutDashboard, Package, Users } from 'lucide-react'
import { type LoaderFunctionArgs, redirect } from 'react-router'
import { data, NavLink, Outlet, useLoaderData } from 'react-router'

import type { DataWithResponseInit } from '@types'

type LoaderResponse = {
  email: string
}

export async function loader({ request }: LoaderFunctionArgs): Promise<DataWithResponseInit<LoaderResponse>> {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''

  const user = token ? verifyUserToken(token) : null
  if (!user) {
    throw redirect('/login')
  }
  if (user.role !== 'ADMIN') {
    throw redirect('/marketplace')
  }

  return data({ email: user.email })
}

const navItems = [
  { to: '/dashboard/marketplace', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/marketplace/users', label: 'Solicitudes', icon: Users, end: false },
  { to: '/dashboard/marketplace/apps', label: 'Aplicaciones', icon: Package, end: false }
]

export default function DashboardLayout(): JSX.Element {
  const { email } = useLoaderData<typeof loader>()

  return (
    <div className="flex min-h-screen bg-[var(--color-mp-ivory)]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-gray-200 bg-[var(--color-mp-charcoal)] flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <span className="text-lg font-bold text-white font-[var(--font-heading)]">Marketplace</span>
          <span className="block text-xs text-white/50 mt-0.5">Panel de administración</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-[var(--color-mp-neon)]/10 text-[var(--color-mp-neon)] font-medium' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs text-white/40 truncate">{email}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
