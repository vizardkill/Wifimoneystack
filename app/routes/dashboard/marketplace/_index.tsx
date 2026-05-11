import type { JSX } from 'react'

import { BarChart3, CheckCircle, Clock, Package, ShieldX, TrendingUp, Users, XCircle } from 'lucide-react'
import { data, type LoaderFunctionArgs, redirect } from 'react-router'
import { Link, useLoaderData } from 'react-router'

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
  if (user.role !== 'ADMIN') {
    throw redirect('/dashboard')
  }

  const result = await new CLS_GetMarketplaceDashboard({ days: 30 }).main()

  return data({
    kpis: result.data?.kpis ?? null,
    top_apps: result.data?.top_apps ?? [],
    no_activity_apps: result.data?.no_activity_apps ?? [],
    error: result.error ? result.message : null
  })
}

export default function AdminMarketplaceDashboard(): JSX.Element {
  const { kpis, top_apps, no_activity_apps, error } = useLoaderData<typeof loader>()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-mp-charcoal)]">Dashboard Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Últimos 30 días</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/marketplace/users" className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
            Usuarios
          </Link>
          <Link to="/dashboard/marketplace/apps" className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
            Aplicaciones
          </Link>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {kpis && (
        <>
          {/* Access KPIs */}
          <section className="space-y-3">
            <h2 className="font-semibold text-[var(--color-mp-charcoal)] flex items-center gap-2">
              <Users className="h-4 w-4" /> Solicitudes de acceso
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KpiCard icon={Clock} label="Pendientes" value={kpis.pending_requests} color="text-yellow-600" bg="bg-yellow-50" />
              <KpiCard icon={CheckCircle} label="Aprobados" value={kpis.approved_users} color="text-green-600" bg="bg-green-50" />
              <KpiCard icon={XCircle} label="Rechazados" value={kpis.rejected_requests} color="text-red-600" bg="bg-red-50" />
              <KpiCard icon={ShieldX} label="Revocados" value={kpis.revoked_users} color="text-orange-600" bg="bg-orange-50" />
            </div>
          </section>

          {/* App KPIs */}
          <section className="space-y-3">
            <h2 className="font-semibold text-[var(--color-mp-charcoal)] flex items-center gap-2">
              <Package className="h-4 w-4" /> Catálogo
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <KpiCard icon={BarChart3} label="Activas" value={kpis.active_apps} color="text-green-600" bg="bg-green-50" />
              <KpiCard icon={Package} label="Borrador" value={kpis.draft_apps} color="text-gray-600" bg="bg-gray-50" />
              <KpiCard icon={TrendingUp} label="Inactivas" value={kpis.inactive_apps} color="text-orange-600" bg="bg-orange-50" />
            </div>
          </section>

          {/* Top apps */}
          {top_apps.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-[var(--color-mp-charcoal)] flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Aplicaciones más usadas
              </h2>
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-600">App</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Vistas</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Aperturas</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Descargas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top_apps.map((app) => (
                      <tr key={app.app_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{app.app_name}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{app.detail_views}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{app.web_opens}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{app.downloads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* No activity apps */}
          {no_activity_apps.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-[var(--color-mp-charcoal)]">Apps sin actividad reciente</h2>
              <div className="space-y-2">
                {no_activity_apps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                    <span className="text-sm font-medium">{app.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{app.status.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, color, bg }: { icon: typeof Users; label: string; value: number; color: string; bg: string }): JSX.Element {
  return (
    <div className={`rounded-xl border border-gray-200 ${bg} p-4 space-y-1`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
