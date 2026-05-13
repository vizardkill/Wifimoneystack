import type { JSX } from 'react'

import { Download, Globe, Package } from 'lucide-react'
import { Link } from 'react-router'

interface AppCardProps {
  app: {
    id: string
    name: string
    summary?: string | null
    icon_url?: string | null
    access_mode: 'WEB_LINK' | 'PACKAGE_DOWNLOAD'
  }
}

export function AppCard({ app }: AppCardProps): JSX.Element {
  return (
    <Link
      to={`/marketplace/apps/${app.id}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:border-[var(--color-mp-neon)] hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        {app.icon_url ? (
          <img src={app.icon_url} alt={`${app.name} icon`} className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <Package className="h-6 w-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-mp-charcoal)] group-hover:text-[var(--color-mp-neon)] transition-colors truncate">{app.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
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

      {app.summary && <p className="mt-3 text-sm text-gray-600 line-clamp-2 flex-1">{app.summary}</p>}

      <div className="mt-4 flex items-center justify-end">
        <span className="text-xs font-medium text-[var(--color-mp-neon)] opacity-0 group-hover:opacity-100 transition-opacity">Ver detalles →</span>
      </div>
    </Link>
  )
}
