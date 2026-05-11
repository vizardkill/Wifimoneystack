import type { JSX } from 'react'

import { Package } from 'lucide-react'

import { AppCard } from './app-card'

interface App {
  id: string
  name: string
  summary?: string | null
  icon_url?: string | null
  access_mode: 'WEB_LINK' | 'PACKAGE_DOWNLOAD'
}

interface AppGridProps {
  apps: App[]
  emptyMessage?: string
  emptySearch?: string
}

export function AppGrid({ apps, emptyMessage, emptySearch }: AppGridProps): JSX.Element {
  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <Package className="h-12 w-12 text-gray-300" />
        <h3 className="font-semibold text-gray-700">Sin aplicaciones</h3>
        <p className="text-sm text-muted-foreground">
          {emptySearch ? `No hay resultados para "${emptySearch}"` : (emptyMessage ?? 'Aún no hay aplicaciones publicadas en el catálogo.')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  )
}
