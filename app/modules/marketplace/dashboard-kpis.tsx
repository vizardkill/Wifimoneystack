import type { JSX } from 'react'

import { BarChart3, CheckCircle, Clock, Package, ShieldX, TrendingUp, Users, XCircle } from 'lucide-react'

interface MarketplaceKpis {
  pending_requests: number
  approved_users: number
  rejected_requests: number
  revoked_users: number
  active_apps: number
  draft_apps: number
  inactive_apps: number
  total_use_events: number
  total_download_events: number
}

interface DashboardKpisProps {
  kpis: MarketplaceKpis
}

export function DashboardKpis({ kpis }: DashboardKpisProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Access KPIs */}
      <section className="space-y-3">
        <h2 className="font-semibold text-[var(--color-mp-charcoal)] flex items-center gap-2">
          <Users className="h-4 w-4" />
          Solicitudes de acceso
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard icon={Clock} label="Pendientes" value={kpis.pending_requests} color="text-yellow-600" bg="bg-yellow-50 border-yellow-100" />
          <KpiCard icon={CheckCircle} label="Aprobados" value={kpis.approved_users} color="text-green-600" bg="bg-green-50 border-green-100" />
          <KpiCard icon={XCircle} label="Rechazados" value={kpis.rejected_requests} color="text-red-600" bg="bg-red-50 border-red-100" />
          <KpiCard icon={ShieldX} label="Revocados" value={kpis.revoked_users} color="text-orange-600" bg="bg-orange-50 border-orange-100" />
        </div>
      </section>

      {/* App KPIs */}
      <section className="space-y-3">
        <h2 className="font-semibold text-[var(--color-mp-charcoal)] flex items-center gap-2">
          <Package className="h-4 w-4" />
          Catálogo
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <KpiCard icon={BarChart3} label="Activas" value={kpis.active_apps} color="text-green-600" bg="bg-green-50 border-green-100" />
          <KpiCard icon={Package} label="Borrador" value={kpis.draft_apps} color="text-gray-600" bg="bg-gray-50 border-gray-100" />
          <KpiCard icon={TrendingUp} label="Inactivas" value={kpis.inactive_apps} color="text-orange-600" bg="bg-orange-50 border-orange-100" />
        </div>
      </section>

      {/* Usage KPIs */}
      <section className="space-y-3">
        <h2 className="font-semibold text-[var(--color-mp-charcoal)] flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Actividad (últimos 30 días)
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard icon={BarChart3} label="Aperturas / vistas" value={kpis.total_use_events} color="text-blue-600" bg="bg-blue-50 border-blue-100" />
          <KpiCard icon={Package} label="Descargas" value={kpis.total_download_events} color="text-purple-600" bg="bg-purple-50 border-purple-100" />
        </div>
      </section>
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, color, bg }: { icon: typeof Users; label: string; value: number; color: string; bg: string }): JSX.Element {
  return (
    <div className={`rounded-xl border ${bg} p-4 space-y-1`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
