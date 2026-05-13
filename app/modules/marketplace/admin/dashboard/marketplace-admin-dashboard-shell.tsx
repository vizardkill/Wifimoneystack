import type { JSX } from 'react'

import { ArrowRight, FolderOpenDot, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router'

import { DashboardCharts, DashboardKpis, NoActivityPanel } from './widgets'

interface DashboardKpiData {
  total_requests: number
  pending_requests: number
  approved_users: number
  rejected_requests: number
  revoked_users: number
  total_apps: number
  active_apps: number
  draft_apps: number
  inactive_apps: number
}

interface DashboardVariationData {
  new_users_7d: number
  access_decisions_7d: number
  apps_activated_7d: number
  apps_deactivated_7d: number
}

interface DashboardTopApp {
  app_id: string
  app_name: string
  detail_views: number
  web_opens: number
  downloads: number
  installs: number
  total_events: number
}

interface DashboardNoActivityApp {
  id: string
  name: string
  status: string
}

interface MarketplaceAdminDashboardShellProps {
  kpis: DashboardKpiData | null
  kpisVariation7d: DashboardVariationData | null
  topApps: DashboardTopApp[]
  noActivityApps: DashboardNoActivityApp[]
  error: string | null
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: 'amber' | 'emerald' | 'sky' }): JSX.Element {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : tone === 'emerald'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-sky-200 bg-sky-50 text-sky-800'

  return (
    <article className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </article>
  )
}

export function MarketplaceAdminDashboardShell({ kpis, kpisVariation7d, topApps, noActivityApps, error }: MarketplaceAdminDashboardShellProps): JSX.Element {
  const normalizeStatus = (status: string): 'ACTIVE' | 'DRAFT' | 'INACTIVE' => {
    if (status === 'ACTIVE' || status === 'INACTIVE') {
      return status
    }

    return 'DRAFT'
  }

  const normalizedNoActivityApps = noActivityApps.map((app) => ({
    id: app.id,
    name: app.name,
    status: normalizeStatus(app.status)
  }))

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Dashboard Marketplace</h1>
            <p className="mt-1 text-sm text-slate-600">Vista operativa de los últimos 30 días con foco en decisiones, catálogo y actividad.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/dashboard/marketplace/users"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Users className="h-4 w-4" />
              Revisar solicitudes
            </Link>
            <Link
              to="/dashboard/marketplace/apps"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <FolderOpenDot className="h-4 w-4" />
              Gestionar catálogo
            </Link>
          </div>
        </div>

        {kpis && (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Pendientes por decidir" value={kpis.pending_requests} tone="amber" />
            <SummaryCard label="Usuarios con acceso" value={kpis.approved_users} tone="emerald" />
            <SummaryCard label="Apps activas" value={kpis.active_apps} tone="sky" />
          </div>
        )}
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {kpis ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <DashboardKpis kpis={kpis} variation7d={kpisVariation7d} />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <DashboardCharts topApps={topApps} days={30} />
            </section>
          </div>

          <aside className="space-y-6">
            <NoActivityPanel apps={normalizedNoActivityApps} days={30} />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <ShieldCheck className="h-4 w-4" />
                Acciones rápidas
              </h2>
              <div className="mt-3 space-y-2">
                <Link
                  to="/dashboard/marketplace/users"
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Decidir solicitudes pendientes
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link
                  to="/dashboard/marketplace/apps"
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Revisar apps sin actividad
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </section>
          </aside>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No hay datos disponibles para construir el tablero en este momento.
        </div>
      )}
    </div>
  )
}
