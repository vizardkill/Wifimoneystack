import type { JSX } from 'react'

import { BarChart3, CheckCircle, Clock, Eye, EyeOff, type LucideIcon, Package, ShieldX, TrendingUp, Users, XCircle } from 'lucide-react'

interface MarketplaceKpis {
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

interface MarketplaceVariation {
  new_users_7d: number
  access_decisions_7d: number
  apps_activated_7d: number
  apps_deactivated_7d: number
}

interface DashboardKpisProps {
  kpis: MarketplaceKpis
  variation7d?: MarketplaceVariation | null
}

type Tone = 'sky' | 'indigo' | 'emerald' | 'amber' | 'yellow' | 'green' | 'red' | 'orange' | 'slate'

export function DashboardKpis({ kpis, variation7d }: DashboardKpisProps): JSX.Element {
  return (
    <div className="space-y-8">
      {variation7d && (
        <section className="space-y-3">
          <header className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <TrendingUp className="h-4 w-4" />
              Variación (últimos 7 días)
            </h2>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={Users} label="Usuarios nuevos" value={variation7d.new_users_7d} tone="sky" />
            <MetricCard icon={CheckCircle} label="Decisiones acceso" value={variation7d.access_decisions_7d} tone="indigo" />
            <MetricCard icon={Eye} label="Apps activadas" value={variation7d.apps_activated_7d} tone="emerald" />
            <MetricCard icon={EyeOff} label="Apps desactivadas" value={variation7d.apps_deactivated_7d} tone="amber" />
          </div>
        </section>
      )}

      <section className="space-y-3">
        <header className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Users className="h-4 w-4" />
            Solicitudes de acceso
          </h2>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Total: {kpis.total_requests}
          </span>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Clock} label="Pendientes" value={kpis.pending_requests} tone="yellow" />
          <MetricCard icon={CheckCircle} label="Aprobados" value={kpis.approved_users} tone="green" />
          <MetricCard icon={XCircle} label="Rechazados" value={kpis.rejected_requests} tone="red" />
          <MetricCard icon={ShieldX} label="Revocados" value={kpis.revoked_users} tone="orange" />
        </div>
      </section>

      <section className="space-y-3">
        <header className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Package className="h-4 w-4" />
            Catálogo de aplicaciones
          </h2>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">Total: {kpis.total_apps}</span>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard icon={BarChart3} label="Activas" value={kpis.active_apps} tone="green" />
          <MetricCard icon={Package} label="Borrador" value={kpis.draft_apps} tone="slate" />
          <MetricCard icon={TrendingUp} label="Inactivas" value={kpis.inactive_apps} tone="orange" />
        </div>
      </section>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number; tone: Tone }): JSX.Element {
  const toneClasses: Record<Tone, string> = {
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700'
  }

  return (
    <article className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
        <Icon className="h-4 w-4 shrink-0" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  )
}
