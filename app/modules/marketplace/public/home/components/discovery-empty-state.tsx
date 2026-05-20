import type { JSX } from 'react'

import { SearchX } from 'lucide-react'
import { Link } from 'react-router'

import type { MarketplaceRecoveryAction } from '../types/marketplace-home.types'

interface DiscoveryEmptyStateProps {
  searchQuery: string
  goalLabel: string | null
  recoveryActions: MarketplaceRecoveryAction[]
}

export function DiscoveryEmptyState({ searchQuery, goalLabel, recoveryActions }: DiscoveryEmptyStateProps): JSX.Element {
  return (
    <div className="rounded-2xl border border-mp-home-border bg-mp-home-surface-strong p-6 text-mp-home-text">
      <div className="inline-flex items-center gap-2 rounded-full bg-mp-home-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-mp-home-accent">
        <SearchX className="h-3.5 w-3.5" />
        Sin resultados con tus filtros
      </div>

      <h3 className="mt-3 font-heading text-xl font-semibold">No encontramos apps para esta combinacion.</h3>

      <p className="mt-2 text-sm text-mp-home-text/80">
        {goalLabel !== null
          ? `Estas filtrando por ${goalLabel}. Puedes quitar filtros o cambiar de objetivo.`
          : 'Prueba otra busqueda o abre el catalogo completo.'}
      </p>

      {searchQuery.length > 0 ? <p className="mt-2 text-xs text-mp-home-text/65">Búsqueda aplicada: {searchQuery}</p> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {recoveryActions.map((action) => (
          <Link
            key={`${action.id}-${action.label}`}
            to={action.to}
            className="rounded-full border border-mp-home-accent/40 bg-mp-home-accent/10 px-3.5 py-1.5 text-xs font-semibold text-mp-home-accent transition-colors hover:bg-mp-home-accent/20"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
