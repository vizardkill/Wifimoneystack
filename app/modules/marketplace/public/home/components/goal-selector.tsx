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
      <h2 className="font-heading text-xl font-semibold text-[var(--color-mp-charcoal)]">Que quieres lograr hoy?</h2>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {goals.map((goal, index) => (
          <Link
            key={goal.id}
            to={goal.to}
            style={{ animationDelay: `${index * 70}ms` }}
            className={`mp-card-sheen group relative flex h-full flex-col overflow-hidden rounded-2xl border p-3 transition-all motion-safe:animate-[mp-fade-up_420ms_ease-out_both] ${
              goal.is_active
                ? 'border-[var(--color-mp-green)] bg-[linear-gradient(155deg,#020617_20%,#0b2a1b_100%)] text-[var(--color-mp-ivory)] shadow-lg shadow-[var(--color-mp-green)]/25'
                : 'border-gray-200 bg-white text-[var(--color-mp-charcoal)] hover:-translate-y-0.5 hover:border-[var(--color-mp-green)] hover:shadow-[0_16px_32px_rgba(2,6,23,0.14)]'
            }`}
          >
            <div
              className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 ${
                goal.is_active ? 'bg-[radial-gradient(circle_at_top_right,rgba(57,255,20,0.22),transparent_60%)]' : 'bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_62%)]'
              }`}
              aria-hidden
            />

            <p className={`text-xs font-semibold uppercase tracking-wide ${goal.is_active ? 'text-[var(--color-mp-neon)]' : 'text-[var(--color-mp-muted)]'}`}>
              {goal.label}
            </p>
            <h3 className="mt-1 text-sm font-semibold leading-snug sm:text-base">{goal.headline}</h3>
            {goal.is_active ? <p className="mt-1 text-xs text-[var(--color-mp-ivory)]/85">{goal.supporting_copy}</p> : null}

            <div className="mt-3 flex items-center justify-between text-xs font-medium">
              <span className={goal.is_active ? 'text-[var(--color-mp-neon)]' : 'text-[var(--color-mp-charcoal)]'}>{goal.stack_count} stack(s)</span>
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
