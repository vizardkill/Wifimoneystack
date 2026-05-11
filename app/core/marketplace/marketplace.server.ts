/**
 * @file marketplace.server.ts
 * @description Barrel público del módulo marketplace. Este archivo es el único punto
 * de entrada para que las rutas consuman la lógica de negocio del marketplace.
 * Importar SOLO en archivos .server.ts o route loaders/actions.
 */

// ── US1: Acceso al marketplace ─────────────────────────────────────────────────
export { CLS_RequestMarketplaceAccess } from './services/_request-access.service'
export { CLS_GetMarketplaceAccessStatus } from './services/_get-access-status.service'

// ── US2: Vitrina de apps ───────────────────────────────────────────────────────
export { CLS_ListPublishedMarketplaceApps } from './services/_list-published-apps.service'
export { CLS_GetMarketplaceApp } from './services/_get-marketplace-app.service'
export { CLS_RecordMarketplaceAppUse } from './services/_record-app-use.service'
export { CLS_RecordMarketplaceAppDownload } from './services/_record-app-download.service'

// ── US3: Admin - Gestión de accesos ───────────────────────────────────────────
export { CLS_ListMarketplaceAccessRequests } from './services/_list-access-requests.service'
export { CLS_DecideMarketplaceAccessRequest } from './services/_decide-access-request.service'
export { CLS_RevokeMarketplaceAccess } from './services/_revoke-access.service'

// ── US4: Admin - Catálogo de apps ─────────────────────────────────────────────
export { CLS_UpsertMarketplaceApp } from './services/_upsert-marketplace-app.service'
export { CLS_UpdateMarketplaceAppPublication } from './services/_update-app-publication.service'

// ── US5: Admin - Dashboard ────────────────────────────────────────────────────
export { CLS_GetMarketplaceDashboard } from './services/_get-marketplace-dashboard.service'
