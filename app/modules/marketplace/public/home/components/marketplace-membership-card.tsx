import type { JSX } from 'react'

import { CalendarClock, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import type { MarketplaceMembershipSnapshot } from '@types'

interface MarketplaceMembershipCardProps {
  membership: MarketplaceMembershipSnapshot
  showProfileLink?: boolean
  compact?: boolean
}

const toDate = (value: Date | string | null): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  return null
}

const formatDateEs = (value: Date | string | null): string => {
  const parsed = toDate(value)
  if (!parsed) {
    return 'Sin fecha'
  }

  return parsed.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const resolveStatusLabel = (membership: MarketplaceMembershipSnapshot): string => {
  if (membership.reminder_variant === 'expired') {
    return 'Vencida'
  }

  if (membership.reminder_variant === 'warning') {
    return 'Por vencer'
  }

  if (membership.reminder_variant === 'healthy') {
    return 'Activa'
  }

  return 'Pendiente'
}

const resolveStatusBadgeClassName = (membership: MarketplaceMembershipSnapshot): string => {
  if (membership.reminder_variant === 'expired') {
    return 'border-red-500/40 bg-red-500/15 text-red-200'
  }

  if (membership.reminder_variant === 'warning') {
    return 'border-amber-400/40 bg-amber-400/15 text-amber-100'
  }

  return 'border-emerald-400/40 bg-emerald-400/15 text-emerald-100'
}

const resolveAlertCopy = (membership: MarketplaceMembershipSnapshot): string | null => {
  if (membership.reminder_variant === 'expired') {
    return 'Tu vigencia vencio y el acceso quedo pausado. La renovacion sigue siendo manual en esta version.'
  }

  if (membership.reminder_variant === 'warning') {
    return 'Te quedan 30 dias o menos. Renueva a tiempo para no perder acceso al marketplace ni a las subapps.'
  }

  return null
}

export function MarketplaceMembershipCard({
  membership,
  showProfileLink = true,
  compact = false
}: MarketplaceMembershipCardProps): JSX.Element {
  const statusLabel = resolveStatusLabel(membership)
  const alertCopy = resolveAlertCopy(membership)
  const remainingLabel =
    membership.days_remaining <= 0 ? 'Vigencia finalizada' : `${membership.days_remaining} dias restantes`

  return (
    <Card className="border-mp-home-border bg-mp-home-surface text-mp-home-text">
      <CardHeader className={compact ? 'space-y-2 p-4' : 'space-y-2 p-5'}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-mp-home-accent-strong">Estado de suscripcion</CardTitle>
          <Badge variant="outline" className={resolveStatusBadgeClassName(membership)}>
            {statusLabel}
          </Badge>
        </div>
        <p className="text-xs text-mp-home-muted">Vigencia de 6 meses desde la aprobacion del acceso.</p>
      </CardHeader>

      <CardContent className={compact ? 'space-y-3 p-4 pt-0' : 'space-y-4 p-5 pt-0'}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-mp-home-text/85">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 text-mp-home-accent" />
            {remainingLabel}
          </span>
          <span>Vence: {formatDateEs(membership.expires_at)}</span>
        </div>

        <Progress value={membership.percent_remaining} aria-label="Tiempo restante de suscripcion" className="h-2 bg-mp-home-surface-strong" />

        <div className="grid gap-2 text-xs text-mp-home-muted sm:grid-cols-2">
          <p>Inicio: {formatDateEs(membership.starts_at)}</p>
          <p>Fin: {formatDateEs(membership.expires_at)}</p>
        </div>

        {alertCopy ? (
          <Alert className="border-mp-home-border bg-mp-home-surface-strong text-mp-home-text">
            <ShieldAlert className="h-4 w-4 text-mp-home-accent" />
            <AlertDescription>{alertCopy}</AlertDescription>
          </Alert>
        ) : null}

        {showProfileLink ? (
          <Link
            to="/marketplace/profile"
            className="inline-flex items-center rounded-lg border border-mp-home-border bg-mp-home-surface-strong px-3 py-1.5 text-xs font-semibold text-mp-home-text transition-colors hover:border-mp-home-accent hover:text-mp-home-accent"
          >
            Ver mi perfil
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}
