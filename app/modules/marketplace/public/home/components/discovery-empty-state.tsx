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
    <div className="rounded-2xl border border-[var(--color-mp-border)] bg-[var(--color-mp-charcoal)] p-6 text-[var(--color-mp-ivory)]">
      <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-mp-green)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-mp-neon)]">
        <SearchX className="h-3.5 w-3.5" />
        Sin resultados con tus filtros
      </div>

      <h3 className="mt-3 font-heading text-xl font-semibold">No encontramos apps para esta combinacion.</h3>

      <p className="mt-2 text-sm text-[var(--color-mp-ivory)]/80">
        {goalLabel !== null
          ? `Estas filtrando por ${goalLabel}. Puedes quitar filtros o cambiar de objetivo.`
          : 'Prueba otra busqueda o abre el catalogo completo.'}
      </p>

      {searchQuery.length > 0 ? <p className="mt-2 text-xs text-[var(--color-mp-ivory)]/65">Búsqueda aplicada: {searchQuery}</p> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {recoveryActions.map((action) => (
          <Link
            key={`${action.id}-${action.label}`}
            to={action.to}
            className="rounded-full border border-[var(--color-mp-green)]/40 bg-[var(--color-mp-green)]/10 px-3.5 py-1.5 text-xs font-semibold text-[var(--color-mp-neon)] transition-colors hover:bg-[var(--color-mp-green)]/20"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
