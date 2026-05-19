import type { JSX } from 'react'

import { Compass, RotateCcw, Search } from 'lucide-react'
import { Form, Link } from 'react-router'

import { AppGrid } from '../../catalog'
import { CuratedStackGrid } from './curated-stack-grid'
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
  const hasActiveFilters = viewModel.discovery.goal_id !== null || viewModel.discovery.search_query.length > 0 || viewModel.discovery.stack_focus_id !== null
  const discoveryHeading = activeGoal ? `Buscando en ${activeGoal.label.toLowerCase()}` : 'Busca por app o problema'
  const catalogTitle = viewModel.has_zero_results
    ? 'Sin resultados en tu filtro'
    : hasActiveFilters
      ? 'Resultados de tu filtro'
      : 'Catalogo completo'
  const catalogSummary = viewModel.has_zero_results
    ? `No encontramos apps con tus filtros. Te mostramos ${viewModel.total_apps} apps activas para continuar.`
    : hasActiveFilters
      ? `${viewModel.total_visible_apps} app(s) encontradas dentro de ${viewModel.total_apps} activas.`
      : `${viewModel.total_apps} app(s) activas disponibles.`

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -left-16 top-28 h-52 w-52 rounded-full bg-[var(--color-mp-green)]/10 blur-3xl" aria-hidden />
      <div
        className="pointer-events-none absolute -right-20 top-[32rem] h-64 w-64 rounded-full bg-[var(--color-mp-neon)]/10 blur-3xl motion-safe:animate-[mp-pulse-soft_9s_ease-in-out_infinite]"
        aria-hidden
      />

      <div className="relative space-y-6">
        {error !== null ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <HomeHero hero={viewModel.hero} totalApps={viewModel.total_apps} />

        <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 motion-safe:animate-[mp-fade-up_420ms_ease-out_both]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-mp-neon)]/60 to-transparent" aria-hidden />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mp-muted">
                <Compass className="h-3.5 w-3.5" />
                Busqueda guiada
              </p>
              <h2 className="mt-1 font-heading text-lg font-semibold text-(--color-mp-charcoal)">{discoveryHeading}</h2>
            </div>

            {hasActiveFilters ? (
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-(--color-mp-charcoal) transition-colors hover:border-mp-green hover:text-mp-green"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Quitar filtros
              </Link>
            ) : null}
          </div>

          <Form method="get" className="mt-4 flex flex-col gap-2 sm:flex-row">
            {viewModel.discovery.goal_id !== null ? <input type="hidden" name="goal" value={viewModel.discovery.goal_id} /> : null}
            {viewModel.discovery.stack_focus_id !== null ? <input type="hidden" name="stack_focus" value={viewModel.discovery.stack_focus_id} /> : null}

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mp-muted" />
              <input
                name="search"
                defaultValue={viewModel.discovery.search_query}
                placeholder="Busca por nombre o problema..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-(--color-mp-charcoal) outline-none transition-all focus:border-mp-green focus:ring-2 focus:ring-mp-green/20"
              />
            </div>

            <button
              type="submit"
              className="h-11 rounded-xl bg-(--color-mp-charcoal) px-4 text-sm font-semibold text-mp-ivory transition-opacity hover:opacity-90"
            >
              Buscar
            </button>
          </Form>
        </section>

        <GoalSelector goals={viewModel.goals} />

        <CuratedStackGrid stacks={viewModel.visible_stacks} activeGoalLabel={activeGoal?.label ?? null} />

        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 motion-safe:animate-[mp-fade-up_520ms_ease-out_both]">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-semibold text-(--color-mp-charcoal)">{catalogTitle}</h2>
            <p className="text-sm text-mp-muted">{catalogSummary}</p>
          </div>

          {viewModel.has_zero_results ? (
            <div className="space-y-4">
              <DiscoveryEmptyState
                searchQuery={viewModel.discovery.search_query}
                goalLabel={activeGoal?.label ?? null}
                recoveryActions={viewModel.recovery_actions}
              />

              <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-(--color-mp-charcoal)">Catalogo completo disponible</p>
                <p className="text-xs text-mp-muted">Estas son las apps activas sin filtros para que sigas avanzando.</p>
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
