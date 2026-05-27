import type { JSX } from 'react'

import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { Link, useOutletContext } from 'react-router'

import { MarketplaceMembershipCard } from '@modules/marketplace'

import type { MarketplaceLayoutOutletContext } from './_layout'

export default function MarketplaceProfilePage(): JSX.Element {
  const { membership } = useOutletContext<MarketplaceLayoutOutletContext>()

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-mp-home-muted">Mi perfil</p>
        <h1 className="font-heading text-2xl font-bold text-mp-home-accent-strong sm:text-3xl">Estado de tu vigencia</h1>
        <p className="max-w-3xl text-sm text-mp-home-text/80">
          Aqui puedes revisar cuanto tiempo te queda de suscripcion y el estado actual de acceso a la plataforma.
        </p>
      </section>

      <MarketplaceMembershipCard membership={membership} showProfileLink={false} />

      <section className="rounded-2xl border border-mp-home-border bg-mp-home-surface p-5 text-sm text-mp-home-text/85">
        <p className="font-semibold text-mp-home-accent-strong">Renovacion manual</p>
        <p className="mt-2">
          La renovacion automatica aun no esta habilitada. Cuando la vigencia venza, tu acceso al marketplace y a subapps se pausa hasta completar la renovacion
          manual.
        </p>

        {membership.reminder_variant === 'expired' ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/12 px-3 py-2 text-amber-100">
            <AlertTriangle className="h-4 w-4" />
            Suscripcion vencida. Renovacion pendiente en canal manual.
          </div>
        ) : null}

        {membership.can_access_marketplace ? (
          <Link
            to="/marketplace"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-mp-home-border bg-mp-home-surface-strong px-3 py-1.5 text-xs font-semibold text-mp-home-text transition-colors hover:border-mp-home-accent hover:text-mp-home-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al marketplace
          </Link>
        ) : null}
      </section>
    </div>
  )
}
