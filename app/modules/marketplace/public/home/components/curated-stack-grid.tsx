import type { JSX } from 'react'

import { Layers2 } from 'lucide-react'
import { Link } from 'react-router'

import type { CuratedStackViewModel } from '../types/marketplace-home.types'

interface CuratedStackGridProps {
  stacks: CuratedStackViewModel[]
  activeGoalLabel: string | null
}

export function CuratedStackGrid({ stacks, activeGoalLabel }: CuratedStackGridProps): JSX.Element {
  if (stacks.length === 0) {
    return <></>
  }

  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl font-semibold text-[var(--color-mp-charcoal)]">
        {activeGoalLabel ? `Stacks recomendados para ${activeGoalLabel.toLowerCase()}` : 'Stacks recomendados'}
      </h2>

      <div className="grid gap-4 lg:grid-cols-2">
        {stacks.map((stack, index) => (
          <article
            key={stack.id}
            style={{ animationDelay: `${index * 80}ms` }}
            className={`mp-card-sheen group relative overflow-hidden rounded-2xl border p-4 transition-all motion-safe:animate-[mp-fade-up_460ms_ease-out_both] ${
              stack.is_focus
                ? 'border-[var(--color-mp-green)] bg-[linear-gradient(145deg,#020617_10%,#0b2a1b_100%)] text-[var(--color-mp-ivory)] shadow-lg shadow-[var(--color-mp-green)]/20'
                : 'border-gray-200 bg-white text-[var(--color-mp-charcoal)] hover:-translate-y-0.5 hover:border-[var(--color-mp-green)] hover:shadow-[0_18px_36px_rgba(2,6,23,0.15)]'
            }`}
          >
            <div
              className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 ${
                stack.is_focus ? 'bg-[radial-gradient(circle_at_top_right,rgba(57,255,20,0.2),transparent_60%)]' : 'bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_64%)]'
              }`}
              aria-hidden
            />

            <p className={`text-xs font-semibold uppercase tracking-wide ${stack.is_focus ? 'text-[var(--color-mp-neon)]' : 'text-[var(--color-mp-muted)]'}`}>
              Stack curado
            </p>
            <h3 className="mt-2 text-lg font-semibold">{stack.title}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${stack.is_focus ? 'text-[var(--color-mp-ivory)]/85' : 'text-[var(--color-mp-muted)]'}`}>
              {stack.result_statement}
            </p>

            {stack.is_focus ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-mp-ivory)]/75">{stack.context_statement}</p>

                <ul className="mt-4 flex flex-wrap gap-2 text-xs">
                  {stack.supporting_signals.map((signal) => (
                    <li
                      key={signal}
                      className="rounded-full border border-[var(--color-mp-green)]/40 bg-[var(--color-mp-green)]/10 px-2.5 py-1 text-[var(--color-mp-ivory)]"
                    >
                      {signal}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--color-mp-muted)]">
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">
                <Layers2 className="h-3.5 w-3.5" /> {stack.apps.length} app(s)
              </span>
              {stack.apps.slice(0, 2).map((app) => (
                <span key={app.id} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">
                  {app.name}
                </span>
              ))}
            </div>

            <div className="mt-4">
              <Link
                to={stack.is_focus ? stack.clear_focus_to : stack.focus_to}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  stack.is_focus
                    ? 'bg-[var(--color-mp-green)] text-[var(--color-mp-charcoal)] hover:brightness-95'
                    : 'bg-[var(--color-mp-charcoal)] text-[var(--color-mp-ivory)] hover:opacity-90'
                }`}
              >
                {stack.is_focus ? 'Quitar foco' : 'Ver stack'}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
