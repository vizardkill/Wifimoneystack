import type { JSX } from 'react'

import { Crosshair, X } from 'lucide-react'
import { Link } from 'react-router'

import { AppGrid } from '../../catalog'
import type { CuratedStackViewModel } from '../types/marketplace-home.types'

interface FocusedStackSectionProps {
  stack: CuratedStackViewModel
}

export function FocusedStackSection({ stack }: FocusedStackSectionProps): JSX.Element {
  return (
    <section id={stack.anchor_id} className="scroll-mt-24 space-y-4 rounded-2xl border border-[var(--color-mp-green)]/40 bg-[var(--color-mp-charcoal)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-[var(--color-mp-green)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-mp-neon)]">
            <Crosshair className="h-3.5 w-3.5" />
            Stack en foco
          </p>
          <h3 className="font-heading text-2xl font-semibold text-[var(--color-mp-ivory)]">{stack.title}</h3>
          <p className="max-w-3xl text-sm text-[var(--color-mp-ivory)]/85">{stack.result_statement}</p>
          <p className="max-w-3xl text-sm text-[var(--color-mp-ivory)]/70">{stack.context_statement}</p>
        </div>

        <Link
          to={stack.clear_focus_to}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-mp-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-mp-ivory)] transition-colors hover:border-[var(--color-mp-green)] hover:text-[var(--color-mp-neon)]"
        >
          <X className="h-3.5 w-3.5" />
          Quitar foco
        </Link>
      </div>

      <AppGrid apps={stack.apps} compact />
    </section>
  )
}
