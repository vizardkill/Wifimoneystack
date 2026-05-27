import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'
import { MarketplaceSubscriptionDB } from '@/core/marketplace/db/marketplace-subscription.db'

import { trackError } from '@lib/functions/_track_error.function'

import { CONFIG_GET_MARKETPLACE_MEMBERSHIP_SNAPSHOT, type MarketplaceMembershipSnapshot } from '@types'

type RequestStatus = CONFIG_GET_MARKETPLACE_MEMBERSHIP_SNAPSHOT.RequestStatus
type RequestResponse = CONFIG_GET_MARKETPLACE_MEMBERSHIP_SNAPSHOT.RequestResponse
type Payload = CONFIG_GET_MARKETPLACE_MEMBERSHIP_SNAPSHOT.Payload

const SIX_MONTHS = 6
const MS_PER_DAY = 24 * 60 * 60 * 1000

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value))
}

const addMonthsPreservingCalendar = (baseDate: Date, months: number): Date => {
  const result = new Date(baseDate)
  const originalDay = result.getDate()

  result.setMonth(result.getMonth() + months)
  if (result.getDate() < originalDay) {
    // Ajusta correctamente meses cortos cuando el día inicial no existe (ej. 31 -> 30/28)
    result.setDate(0)
  }

  return result
}

const toMembershipAccessStatus = (value: string | null | undefined): MarketplaceMembershipSnapshot['access_status'] => {
  if (value === 'APPROVED' || value === 'PENDING' || value === 'REJECTED' || value === 'REVOKED') {
    return value
  }

  return 'NONE'
}

const buildTimelineMetrics = (startsAt: Date, expiresAt: Date): Pick<MarketplaceMembershipSnapshot, 'days_remaining' | 'percent_remaining' | 'total_days'> => {
  const now = new Date()
  const totalDays = Math.max(1, Math.ceil((expiresAt.getTime() - startsAt.getTime()) / MS_PER_DAY))
  const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / MS_PER_DAY))
  const percentRemaining = clamp(Math.round((daysRemaining / totalDays) * 100), 0, 100)

  return {
    days_remaining: daysRemaining,
    total_days: totalDays,
    percent_remaining: percentRemaining
  }
}

export class CLS_GetMarketplaceMembershipSnapshot {
  private _payload!: Payload
  private _statusRequest: RequestStatus = CONFIG_GET_MARKETPLACE_MEMBERSHIP_SNAPSHOT.RequestStatus.Pending
  private _requestResponse: RequestResponse | null = null

  constructor(payload: Payload) {
    this._payload = payload
  }

  public async main(): Promise<RequestResponse> {
    const steps = [this._fetchAccessRequest, this._syncSubscriptionWhenApproved, this._buildResponse]

    for (const step of steps) {
      if (this._statusRequest === CONFIG_GET_MARKETPLACE_MEMBERSHIP_SNAPSHOT.RequestStatus.Pending) {
        await step.call(this)
      }
    }

    if (this._requestResponse === null) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_MEMBERSHIP_SNAPSHOT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'No se pudo resolver la vigencia del usuario.' }
    }

    return this._requestResponse
  }

  private _accessRequest: Awaited<ReturnType<typeof AccessRequestDB.findByUserId>> = null
  private _subscription: Awaited<ReturnType<typeof MarketplaceSubscriptionDB.findByUserId>> = null
  private _accessStatus: MarketplaceMembershipSnapshot['access_status'] = 'NONE'

  private async _fetchAccessRequest(): Promise<void> {
    try {
      this._accessRequest = await AccessRequestDB.findByUserId(this._payload.user_id)
      this._accessStatus = toMembershipAccessStatus(this._accessRequest?.status)

      if (this._accessStatus === 'APPROVED') {
        this._subscription = await MarketplaceSubscriptionDB.findByUserId(this._payload.user_id)
      }
    } catch (err) {
      this._statusRequest = CONFIG_GET_MARKETPLACE_MEMBERSHIP_SNAPSHOT.RequestStatus.Error
      this._requestResponse = { error: true, message: 'Error consultando acceso y vigencia del marketplace.' }
      trackError({ error: err as Error, method: 'CLS_GetMarketplaceMembershipSnapshot._fetchAccessRequest', controller: 'marketplace' })
    }
  }

  private async _syncSubscriptionWhenApproved(): Promise<void> {
    if (this._accessStatus !== 'APPROVED') {
      return
    }

    const approvedAt = this._accessRequest?.decided_at ?? new Date()

    if (!this._subscription) {
      try {
        this._subscription = await MarketplaceSubscriptionDB.createFromApproval({
          user_id: this._payload.user_id,
          starts_at: approvedAt,
          expires_at: addMonthsPreservingCalendar(approvedAt, SIX_MONTHS)
        })
      } catch (err) {
        // Concurrencia: si otra request creó la fila, reintentar lectura antes de degradar.
        this._subscription = await MarketplaceSubscriptionDB.findByUserId(this._payload.user_id)
        if (!this._subscription) {
          trackError({
            error: err as Error,
            method: 'CLS_GetMarketplaceMembershipSnapshot._syncSubscriptionWhenApproved.createFromApproval',
            controller: 'marketplace'
          })
        }
      }
    }

    if (!this._subscription) {
      return
    }

    const now = new Date()
    const shouldExpire = this._subscription.expires_at.getTime() <= now.getTime()

    if (shouldExpire && this._subscription.status !== 'EXPIRED') {
      const updated = await MarketplaceSubscriptionDB.updateStatus({
        user_id: this._payload.user_id,
        status: 'EXPIRED'
      })
      if (updated) {
        this._subscription = updated
      }
      return
    }

    if (!shouldExpire && this._subscription.status !== 'ACTIVE') {
      const updated = await MarketplaceSubscriptionDB.updateStatus({
        user_id: this._payload.user_id,
        status: 'ACTIVE'
      })
      if (updated) {
        this._subscription = updated
      }
    }
  }

  private async _buildResponse(): Promise<void> {
    const accessStatus = this._accessStatus

    if (accessStatus !== 'APPROVED') {
      this._statusRequest = CONFIG_GET_MARKETPLACE_MEMBERSHIP_SNAPSHOT.RequestStatus.Completed
      this._requestResponse = {
        data: {
          access_status: accessStatus,
          subscription_status: 'NONE',
          starts_at: null,
          expires_at: null,
          days_remaining: 0,
          total_days: 0,
          percent_remaining: 0,
          reminder_variant: 'pending',
          renewal_flow: 'manual_pending',
          can_access_marketplace: false,
          can_access_subapps: false
        }
      }
      return
    }

    const fallbackStartsAt = this._accessRequest?.decided_at ?? new Date()
    const startsAt = this._subscription?.starts_at ?? fallbackStartsAt
    const expiresAt = this._subscription?.expires_at ?? addMonthsPreservingCalendar(startsAt, SIX_MONTHS)
    const timeline = buildTimelineMetrics(startsAt, expiresAt)
    const isExpired = timeline.days_remaining <= 0

    this._statusRequest = CONFIG_GET_MARKETPLACE_MEMBERSHIP_SNAPSHOT.RequestStatus.Completed
    this._requestResponse = {
      data: {
        access_status: 'APPROVED',
        subscription_status: isExpired ? 'EXPIRED' : 'ACTIVE',
        starts_at: startsAt,
        expires_at: expiresAt,
        days_remaining: timeline.days_remaining,
        total_days: timeline.total_days,
        percent_remaining: timeline.percent_remaining,
        reminder_variant: isExpired ? 'expired' : timeline.days_remaining <= 30 ? 'warning' : 'healthy',
        renewal_flow: 'manual_pending',
        can_access_marketplace: !isExpired,
        can_access_subapps: !isExpired
      }
    }
  }
}
