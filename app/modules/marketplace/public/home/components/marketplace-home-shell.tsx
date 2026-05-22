import type { JSX } from 'react'

import { Compass, RotateCcw, Search } from 'lucide-react'
import { Form, Link } from 'react-router'

import { AppGrid } from '../../catalog'
import { DiscoveryEmptyState } from './discovery-empty-state'
import { GoalSelector } from './goal-selector'
import { HomeHero } from './home-hero'
import type { MarketplaceHomeViewModel } from '../types/marketplace-home.types'

interface MarketplaceHomeShellProps {
  viewModel: MarketplaceHomeViewModel
  error: string | null
}

export function MarketplaceHomeShell({ viewModel, error }: MarketplaceHomeShellProps): JSX.Element {
  const activeGoal = viewModel.goals.find((goal) => goal.is_active) ?? null
  const hasActiveFilters = viewModel.discovery.goal_id !== null || viewModel.discovery.search_query.length > 0
  const discoveryHeading = activeGoal ? `Buscando en ${activeGoal.label.toLowerCase()}` : 'Buscar app por problema'
  const catalogTitle = viewModel.has_zero_results
    ? 'Sin resultados en tu filtro'
    : hasActiveFilters
      ? 'Resultados de tu filtro'
      : 'Catalogo completo de WiFiMoneyStack'
  const catalogSummary = viewModel.has_zero_results
    ? `No encontramos apps con tus filtros. Te mostramos ${viewModel.total_apps} apps activas para continuar.`
    : hasActiveFilters
      ? `${viewModel.total_visible_apps} app(s) encontradas dentro de ${viewModel.total_apps} activas.`
      : `${viewModel.total_apps} app(s) activas disponibles.`

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -left-16 top-28 h-52 w-52 rounded-full bg-mp-home-accent-strong/15 blur-3xl" aria-hidden />
      <div
        className="pointer-events-none absolute -right-20 top-128 h-64 w-64 rounded-full bg-mp-home-accent/20 blur-3xl motion-safe:animate-[mp-pulse-soft_9s_ease-in-out_infinite]"
        aria-hidden
      />

      <div className="relative space-y-6">
        {error !== null ? <div className="rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-200">{error}</div> : null}

        <HomeHero hero={viewModel.hero} totalApps={viewModel.total_apps} />

        <section className="relative overflow-hidden rounded-2xl border border-mp-home-border bg-mp-home-surface p-4 sm:p-5 motion-safe:animate-[mp-fade-up_420ms_ease-out_both]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-mp-home-accent/60 to-transparent" aria-hidden />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mp-home-muted">
                <Compass className="h-3.5 w-3.5" />
                Busqueda guiada
              </p>
              <h2 className="mt-1 font-heading text-lg font-semibold text-mp-home-accent-strong">{discoveryHeading}</h2>
            </div>

            {hasActiveFilters ? (
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1 rounded-full border border-mp-home-border bg-mp-home-surface-strong px-3 py-1.5 text-xs font-semibold text-mp-home-text transition-colors hover:border-mp-home-accent hover:text-mp-home-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Quitar filtros
              </Link>
            ) : null}
          </div>

          <Form method="get" className="mt-4 flex flex-col gap-2 sm:flex-row">
            {viewModel.discovery.goal_id !== null ? <input type="hidden" name="goal" value={viewModel.discovery.goal_id} /> : null}

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mp-home-muted" />
              <input
                name="search"
                defaultValue={viewModel.discovery.search_query}
                placeholder="Busca por nombre o problema..."
                className="h-11 w-full rounded-xl border border-mp-home-border bg-mp-home-surface-strong py-2 pl-9 pr-3 text-sm text-mp-home-text outline-none transition-all placeholder:text-mp-home-muted focus:border-mp-home-accent focus:ring-2 focus:ring-mp-home-accent/20"
              />
            </div>

            <button
              type="submit"
              className="h-11 rounded-xl bg-mp-home-accent px-4 text-sm font-semibold text-[#042118] transition-colors hover:bg-mp-home-accent-strong"
            >
              Buscar
            </button>
          </Form>
        </section>

        <GoalSelector goals={viewModel.goals} />

        <section className="space-y-4 rounded-2xl border border-mp-home-border bg-mp-home-surface p-5 motion-safe:animate-[mp-fade-up_520ms_ease-out_both]">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-semibold text-mp-home-accent-strong">{catalogTitle}</h2>
            <p className="text-sm text-mp-home-muted">{catalogSummary}</p>
          </div>

          {viewModel.has_zero_results ? (
            <div className="space-y-4">
              <DiscoveryEmptyState
                searchQuery={viewModel.discovery.search_query}
                goalLabel={activeGoal?.label ?? null}
                recoveryActions={viewModel.recovery_actions}
              />

              <div className="space-y-2 rounded-xl border border-mp-home-border bg-mp-home-surface-strong p-4">
                <p className="text-sm font-semibold text-mp-home-accent-strong">Catalogo completo disponible</p>
                <p className="text-xs text-mp-home-muted">Estas son las apps activas sin filtros para que sigas avanzando.</p>
              </div>

              <AppGrid apps={viewModel.full_catalog_apps} compact={false} />
            </div>
          ) : (
            <AppGrid apps={viewModel.catalog_apps} compact={false} />
          )}
        </section>
      </div>
    </div>
  )
}
