import type { JSX } from 'react'

import { Sparkles } from 'lucide-react'

import type { MarketplaceHeroDefinition } from '../types/marketplace-home.types'

interface HomeHeroProps {
  hero: MarketplaceHeroDefinition
  totalApps: number
}

export function HomeHero({ hero, totalApps }: HomeHeroProps): JSX.Element {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-[var(--color-mp-border)] bg-[radial-gradient(circle_at_top_left,rgba(57,255,20,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.3),transparent_45%),linear-gradient(130deg,#020617_20%,#0f172a_100%)] px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <div className="mp-ambient-grid pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" aria-hidden />
      <div className="pointer-events-none absolute -right-16 top-8 h-40 w-40 rounded-full border border-[var(--color-mp-green)]/30 motion-safe:animate-[mp-float_10s_ease-in-out_infinite]" aria-hidden />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-[var(--color-mp-green)]/20 blur-2xl motion-safe:animate-[mp-float_8s_ease-in-out_infinite]" aria-hidden />
      <div className="pointer-events-none absolute -left-14 top-12 h-40 w-40 rounded-full bg-[var(--color-mp-neon)]/15 blur-3xl motion-safe:animate-[mp-pulse-soft_8s_ease-in-out_infinite]" aria-hidden />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end motion-safe:animate-[mp-fade-up_420ms_ease-out_both]">
        <div className="space-y-4">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-mp-green)]/40 bg-[var(--color-mp-green)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-mp-neon)]">
            <Sparkles className="h-3.5 w-3.5" />
            {hero.badge}
          </p>

          <h1 className="max-w-3xl text-balance font-heading text-3xl font-bold leading-tight text-[var(--color-mp-ivory)] sm:text-4xl lg:text-[2.7rem]">
            {hero.title}
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-mp-ivory)]/80 sm:text-base">{hero.subtitle}</p>

          <div className="flex flex-wrap gap-2 pt-1">
            {hero.supporting_points.slice(0, 2).map((point) => (
              <span
                key={point}
                className="rounded-full border border-[var(--color-mp-green)]/30 bg-[var(--color-mp-green)]/10 px-3 py-1 text-[11px] font-medium text-[var(--color-mp-ivory)]/85"
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-2xl border border-[var(--color-mp-border)] bg-[var(--color-mp-charcoal)]/75 p-4 backdrop-blur">
          <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[var(--color-mp-neon)]/15 blur-2xl" aria-hidden />
          <p className="text-xs uppercase tracking-wider text-[var(--color-mp-muted)]">Catalogo activo</p>
          <p className="mt-2 text-4xl font-bold text-[var(--color-mp-neon)]">{totalApps}</p>
          <p className="mt-1 text-xs text-[var(--color-mp-ivory)]/80">apps listas para usar hoy.</p>
          <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-mp-ivory)]/75">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-mp-neon)] motion-safe:animate-pulse" />
            discovery live
          </span>
        </aside>
      </div>
    </section>
  )
}
