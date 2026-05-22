import type { JSX } from 'react'

import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

import type { GoalRouteViewModel } from '../types/marketplace-home.types'

interface GoalSelectorProps {
  goals: GoalRouteViewModel[]
}

export function GoalSelector({ goals }: GoalSelectorProps): JSX.Element {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl font-semibold text-mp-home-accent-strong">Que quieres lograr hoy?</h2>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {goals.map((goal, index) => (
          <Link
            key={goal.id}
            to={goal.to}
            style={{ animationDelay: `${index * 70}ms` }}
            className={`mp-card-sheen group relative flex h-full flex-col overflow-hidden rounded-2xl border p-3 transition-all motion-safe:animate-[mp-fade-up_420ms_ease-out_both] ${
              goal.is_active
                ? 'border-mp-home-accent bg-[linear-gradient(155deg,#0b1626_10%,#12322d_100%)] text-mp-home-text shadow-lg shadow-mp-home-accent/20'
                : 'border-mp-home-border bg-mp-home-surface text-mp-home-text hover:-translate-y-0.5 hover:border-mp-home-accent hover:bg-mp-home-surface-strong hover:shadow-[0_16px_32px_rgba(3,9,20,0.45)]'
            }`}
          >
            <div
              className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 ${
                goal.is_active
                  ? 'bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.3),transparent_62%)]'
                  : 'bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.14),transparent_62%)]'
              }`}
              aria-hidden
            />

            <p className={`text-xs font-semibold uppercase tracking-wide ${goal.is_active ? 'text-mp-home-accent' : 'text-mp-home-muted'}`}>
              {goal.label}
            </p>
            <h3 className="mt-1 text-sm font-semibold leading-snug sm:text-base">{goal.headline}</h3>
            {goal.is_active ? <p className="mt-1 text-xs text-mp-home-text/85">{goal.supporting_copy}</p> : null}

            <div className="mt-3 flex items-center justify-between text-xs font-medium">
              <span className={goal.is_active ? 'text-mp-home-accent' : 'text-mp-home-text/85'}>{goal.app_count} app(s)</span>
              <span className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100">
                {goal.is_active ? 'Quitar filtro' : 'Ver ruta'}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
