import type { JSX } from 'react'

import { BarChart3, TrendingUp } from 'lucide-react'

interface TopApp {
  app_id: string
  app_name: string
  detail_views: number
  web_opens: number
  downloads: number
}

interface DashboardChartsProps {
  topApps: TopApp[]
  days: number
}

export function DashboardCharts({ topApps, days }: DashboardChartsProps): JSX.Element {
  if (topApps.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center space-y-2">
        <BarChart3 className="h-8 w-8 text-gray-300 mx-auto" />
        <p className="text-sm text-muted-foreground">Sin datos de actividad en los últimos {days} días.</p>
      </div>
    )
  }

  const maxValue = Math.max(...topApps.map((a) => a.web_opens + a.downloads + a.detail_views), 1)

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-[var(--color-mp-charcoal)] flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Actividad por aplicación (últimos {days} días)
      </h2>

      {/* Bar chart */}
      <div className="space-y-3">
        {topApps.map((app) => {
          const total = app.detail_views + app.web_opens + app.downloads
          const widthPct = Math.round((total / maxValue) * 100)

          return (
            <div key={app.app_id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-mp-charcoal)] truncate max-w-[200px]">{app.app_name}</span>
                <span className="text-muted-foreground text-xs">{total} eventos</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-[var(--color-mp-neon)]" style={{ width: `${widthPct}%` }} />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{app.detail_views} vistas</span>
                <span>{app.web_opens} aperturas</span>
                <span>{app.downloads} descargas</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Aplicación</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Vistas</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Aperturas</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Descargas</th>
            </tr>
          </thead>
          <tbody>
            {topApps.map((app) => (
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
    </div>
  )
}
