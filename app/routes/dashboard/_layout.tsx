import { type JSX, useEffect, useMemo, useState } from 'react'

import { LayoutDashboard, LogOut, type LucideIcon, Menu, Package, ShieldCheck, Users, X } from 'lucide-react'
import { type LoaderFunctionArgs, redirect } from 'react-router'
import { data, Form, NavLink, Outlet, useLoaderData, useLocation } from 'react-router'

import type { DataWithResponseInit } from '@types'

type LoaderResponse = {
  email: string
  role: 'ADMIN' | 'SUPERADMIN'
}

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end: boolean
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
  const hasMarketplaceAdminAccess = user.role === 'ADMIN' || user.role === 'SUPERADMIN'
  if (!hasMarketplaceAdminAccess) {
    throw redirect('/marketplace')
  }

  const role: LoaderResponse['role'] = user.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN'
  return data({ email: user.email, role })
}

export default function DashboardLayout(): JSX.Element {
  const { email, role } = useLoaderData<typeof loader>()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navItems: NavItem[] = useMemo(
    () => [
      { to: '/dashboard/marketplace', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/dashboard/marketplace/users', label: 'Solicitudes', icon: Users, end: false },
      { to: '/dashboard/marketplace/apps', label: 'Aplicaciones', icon: Package, end: false },
      ...(role === 'SUPERADMIN' ? [{ to: '/dashboard/marketplace/admins', label: 'Administradores', icon: ShieldCheck, end: false }] : [])
    ],
    [role]
  )

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  const currentSection = useMemo(() => {
    return (
      navItems.find((item) => {
        if (item.end) {
          return location.pathname === item.to
        }
        return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
      })?.label ?? 'Dashboard'
    )
  }, [location.pathname, navItems])

  return (
    <div className="min-h-screen bg-slate-100">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
          aria-label="Cerrar navegación"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-slate-900 p-4 text-white transition-transform duration-200 lg:hidden ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!mobileNavOpen}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="font-heading text-lg font-semibold">Marketplace</p>
            <p className="text-xs text-white/60">Panel de administración</p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-white/20 p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-emerald-400/15 text-emerald-300' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-white/50">Sesión</p>
          <p className="mt-1 truncate text-sm text-white/85">{email}</p>
          <Form method="post" action="/api/v1/auth/sessions" className="mt-3">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
          </Form>
        </div>
      </aside>

      <div className="lg:grid lg:min-h-screen lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden h-screen border-r border-slate-200 bg-slate-900 lg:sticky lg:top-0 lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <p className="font-heading text-xl font-semibold text-white">Marketplace</p>
            <p className="mt-0.5 text-xs text-white/60">Consola administrativa</p>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-5">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive ? 'bg-emerald-400/15 text-emerald-300' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/10 px-4 py-4">
            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">Sesión</p>
              <p className="mt-1 truncate text-sm text-white/85">{email}</p>
              <Form method="post" action="/api/v1/auth/sessions" className="mt-3">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar sesión
                </button>
              </Form>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
                  onClick={() => setMobileNavOpen(true)}
                  aria-label="Abrir navegación"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Panel Marketplace</p>
                  <p className="text-base font-semibold text-slate-900">{currentSection}</p>
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <span className="truncate text-sm text-slate-600">{email}</span>
                <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN'}
                </span>
                <Form method="post" action="/api/v1/auth/sessions">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Cerrar sesión
                  </button>
                </Form>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
