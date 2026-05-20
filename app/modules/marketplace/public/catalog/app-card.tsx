import type { JSX } from 'react'

import { CheckCircle2, Download, Globe, ImageIcon, Package } from 'lucide-react'
import { Link } from 'react-router'

interface AppCardProps {
  app: {
    id: string
    slug: string
    name: string
    summary?: string | null
    icon_url?: string | null
    access_mode: 'WEB_LINK' | 'PACKAGE_DOWNLOAD'
    screenshot_count?: number
  }
  compact?: boolean
}

export function AppCard({ app, compact = false }: AppCardProps): JSX.Element {
  const valueSignal = app.access_mode === 'WEB_LINK' ? 'Acceso inmediato' : 'Descarga lista'

  return (
    <Link
      to={`/marketplace/apps/${app.id}`}
      className={`mp-card-sheen group relative flex flex-col overflow-hidden rounded-xl border border-mp-home-border bg-mp-home-surface transition-all hover:-translate-y-0.5 hover:border-mp-home-accent hover:bg-mp-home-surface-strong hover:shadow-[0_18px_34px_rgba(3,9,20,0.5)] ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.16),transparent_62%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />

      <div className="flex items-start gap-3">
        {app.icon_url ? (
          <img
            src={app.icon_url}
            alt={`${app.name} icon`}
            className={`shrink-0 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105 ${compact ? 'h-10 w-10' : 'h-12 w-12'}`}
          />
        ) : (
          <div
            className={`flex shrink-0 items-center justify-center rounded-lg bg-mp-home-surface-strong transition-transform duration-300 group-hover:scale-105 ${compact ? 'h-10 w-10' : 'h-12 w-12'}`}
          >
            <Package className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} text-mp-home-muted`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`truncate font-semibold text-mp-home-text transition-colors group-hover:text-mp-home-accent ${compact ? 'text-sm' : ''}`}>
            {app.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-mp-home-muted">
            {app.access_mode === 'WEB_LINK' ? (
              <>
                <Globe className="h-3 w-3" />
                Aplicación web
              </>
            ) : (
              <>
                <Download className="h-3 w-3" />
                Descarga
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full border border-mp-home-border bg-mp-home-surface-strong px-2.5 py-1 text-mp-home-text">
          <CheckCircle2 className="h-3.5 w-3.5 text-mp-home-accent-strong" />
          {valueSignal}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-mp-home-border bg-mp-home-surface-strong px-2.5 py-1 text-mp-home-muted">
          <ImageIcon className="h-3.5 w-3.5" />
          {app.screenshot_count ?? 0} captura(s)
        </span>
      </div>

      {app.summary && <p className="mt-3 line-clamp-2 flex-1 text-sm text-mp-home-muted">{app.summary}</p>}

      <div className="mt-4 flex items-center justify-end">
        <span className="text-xs font-medium text-mp-home-accent opacity-0 transition-opacity group-hover:opacity-100">Ver detalles →</span>
      </div>
    </Link>
  )
}
