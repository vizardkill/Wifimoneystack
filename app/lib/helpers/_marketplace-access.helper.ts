import type { MarketplaceAccessStatus } from '@prisma/client'

/**
 * Validar si una transición de estado de acceso es permitida
 */
export function isValidAccessTransition(current: MarketplaceAccessStatus, next: MarketplaceAccessStatus): boolean {
  const transitions: Record<MarketplaceAccessStatus, MarketplaceAccessStatus[]> = {
    PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: ['REVOKED'],
    REJECTED: ['APPROVED'],
    REVOKED: ['APPROVED']
  }
  return transitions[current].includes(next)
}

/**
 * Verificar si un usuario tiene acceso aprobado al marketplace
 */
export function hasApprovedAccess(status: MarketplaceAccessStatus | null | undefined): boolean {
  return status === 'APPROVED'
}

/**
 * Obtener mensaje de estado de acceso legible para el usuario
 */
export function getAccessStatusMessage(status: MarketplaceAccessStatus | null | undefined): string {
  switch (status) {
    case 'PENDING':
      return 'Tu cuenta fue creada correctamente y pronto un administrador revisará tu acceso al marketplace.'
    case 'APPROVED':
      return 'Tienes acceso al marketplace.'
    case 'REJECTED':
      return 'Tu solicitud fue rechazada. Contacta soporte si crees que es un error.'
    case 'REVOKED':
      return 'Tu acceso fue revocado. Contacta soporte para más información.'
    default:
      return 'Tu solicitud de acceso todavía no aparece registrada. Recarga la página o contacta soporte si este mensaje persiste.'
  }
}

/**
 * Verificar si un usuario puede solicitar acceso (no tiene solicitud previa activa)
 */
export function canRequestAccess(existingStatus: MarketplaceAccessStatus | null | undefined): boolean {
  return existingStatus == null || existingStatus === 'REJECTED'
}
