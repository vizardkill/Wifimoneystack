import type { MarketplaceAuditAction } from '@prisma/client'

import { MarketplaceAuditEventDB } from '@/core/marketplace/db/marketplace-audit-event.db'

import { trackError } from '@lib/functions/_track_error.function'
import type { ICreateAuditEventInput } from '@lib/interfaces'

/**
 * Escribir un evento de auditoría del marketplace de forma segura.
 * Los errores de auditoría se reportan pero no interrumpen el flujo principal.
 */
export async function writeMarketplaceAuditEvent(input: ICreateAuditEventInput): Promise<void> {
  try {
    await MarketplaceAuditEventDB.create(input)
  } catch (err) {
    trackError({ error: err as Error, method: 'writeMarketplaceAuditEvent', controller: 'marketplace-audit' })
  }
}

/**
 * Construir metadata de auditoría para eventos de acceso
 */
export function buildAccessAuditMeta(params: { request_id: string; previous_status?: string; new_status: string }): Record<string, unknown> {
  return {
    request_id: params.request_id,
    previous_status: params.previous_status,
    new_status: params.new_status,
    timestamp: new Date().toISOString()
  }
}

/**
 * Construir metadata de auditoría para eventos de app
 */
export function buildAppAuditMeta(params: {
  app_id: string
  app_slug?: string
  previous_status?: string
  new_status?: string
  action: MarketplaceAuditAction
}): Record<string, unknown> {
  return {
    app_id: params.app_id,
    app_slug: params.app_slug,
    previous_status: params.previous_status,
    new_status: params.new_status,
    action: params.action,
    timestamp: new Date().toISOString()
  }
}

/**
 * Construir metadata de auditoría para eventos de storefront.
 */
export function buildStorefrontAuditMeta(params: {
  app_id: string
  action: MarketplaceAuditAction
  storefront_version_id?: string
  storefront_kind?: 'DRAFT' | 'PUBLISHED'
  readiness_status?: 'INCOMPLETE' | 'READY'
  missing_requirements?: string[]
  media_ids?: string[]
}): Record<string, unknown> {
  return {
    app_id: params.app_id,
    storefront_version_id: params.storefront_version_id,
    storefront_kind: params.storefront_kind,
    readiness_status: params.readiness_status,
    missing_requirements: params.missing_requirements,
    media_ids: params.media_ids,
    action: params.action,
    timestamp: new Date().toISOString()
  }
}

/**
 * Construir metadata de auditoría para promoción administrativa.
 */
export function buildAdminPromotionAuditMeta(params: { target_email: string; previous_role: 'USER'; promoted_role: 'ADMIN' }): Record<string, unknown> {
  return {
    target_email: params.target_email,
    previous_role: params.previous_role,
    promoted_role: params.promoted_role,
    timestamp: new Date().toISOString()
  }
}
