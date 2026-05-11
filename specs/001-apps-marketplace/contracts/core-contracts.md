# Core Contracts: `app/core/marketplace`

The only public server entrypoint for marketplace behavior is `app/core/marketplace/marketplace.server.ts`. Routes must not import DB classes or internal
services directly.

## Public Controllers

### `requestMarketplaceAccessController(userId, payload, actor?)`

Creates or updates a pending access request for the authenticated user.

**CONFIG namespace**: `CONFIG_REQUEST_MARKETPLACE_ACCESS`

**Service**: `CLS_RequestMarketplaceAccess`

**DB classes**: `AccessRequestDB`, `MarketplaceAuditEventDB`

### `getMarketplaceAccessStatusController(userId)`

Returns current marketplace access status and safe user-facing reason.

**CONFIG namespace**: `CONFIG_GET_MARKETPLACE_ACCESS_STATUS`

**Service**: `CLS_GetMarketplaceAccessStatus`

**DB classes**: `AccessRequestDB`

### `listPublishedMarketplaceAppsController(userId, filters)`

Checks approved access and returns active apps for marketplace listing.

**CONFIG namespace**: `CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS`

**Service**: `CLS_ListPublishedMarketplaceApps`

**DB classes**: `AccessRequestDB`, `MarketplaceAppDB`, `AppMediaDB`

### `getMarketplaceAppController(userId, appIdOrSlug)`

Checks approved access, returns active app details, and records detail view.

**CONFIG namespace**: `CONFIG_GET_MARKETPLACE_APP`

**Service**: `CLS_GetMarketplaceApp`

**DB classes**: `AccessRequestDB`, `MarketplaceAppDB`, `AppMediaDB`, `AppArtifactDB`, `AppUsageEventDB`

### `recordMarketplaceAppUseController(userId, appId)`

Checks approved access, records `WEB_OPEN`, and returns the destination URL.

**CONFIG namespace**: `CONFIG_RECORD_MARKETPLACE_APP_USE`

**Service**: `CLS_RecordMarketplaceAppUse`

**DB classes**: `AccessRequestDB`, `MarketplaceAppDB`, `AppUsageEventDB`

### `recordMarketplaceAppDownloadController(userId, appId)`

Checks approved access, records `PACKAGE_DOWNLOAD`, and returns authorized artifact delivery metadata.

**CONFIG namespace**: `CONFIG_RECORD_MARKETPLACE_APP_DOWNLOAD`

**Service**: `CLS_RecordMarketplaceAppDownload`

**DB classes**: `AccessRequestDB`, `MarketplaceAppDB`, `AppArtifactDB`, `AppUsageEventDB`

### `listMarketplaceAccessRequestsController(adminUserId, filters)`

Requires admin role and returns paginated access requests.

**CONFIG namespace**: `CONFIG_LIST_MARKETPLACE_ACCESS_REQUESTS`

**Service**: `CLS_ListMarketplaceAccessRequests`

**DB classes**: `AccessRequestDB`

### `decideMarketplaceAccessRequestController(adminUserId, payload)`

Approves or rejects a pending request and writes audit event.

**CONFIG namespace**: `CONFIG_DECIDE_MARKETPLACE_ACCESS_REQUEST`

**Service**: `CLS_DecideMarketplaceAccessRequest`

**DB classes**: `AccessRequestDB`, `MarketplaceAuditEventDB`

### `revokeMarketplaceAccessController(adminUserId, payload)`

Revokes approved user access and writes audit event.

**CONFIG namespace**: `CONFIG_REVOKE_MARKETPLACE_ACCESS`

**Service**: `CLS_RevokeMarketplaceAccess`

**DB classes**: `AccessRequestDB`, `MarketplaceAuditEventDB`

### `upsertMarketplaceAppController(adminUserId, payload)`

Creates or updates an app listing and writes audit event.

**CONFIG namespace**: `CONFIG_UPSERT_MARKETPLACE_APP`

**Service**: `CLS_UpsertMarketplaceApp`

**DB classes**: `MarketplaceAppDB`, `AppMediaDB`, `AppArtifactDB`, `MarketplaceAuditEventDB`

### `updateMarketplaceAppPublicationController(adminUserId, payload)`

Activates or deactivates an app after publication validation and writes audit event.

**CONFIG namespace**: `CONFIG_UPDATE_MARKETPLACE_APP_PUBLICATION`

**Service**: `CLS_UpdateMarketplaceAppPublication`

**DB classes**: `MarketplaceAppDB`, `AppMediaDB`, `AppArtifactDB`, `MarketplaceAuditEventDB`

### `getMarketplaceDashboardController(adminUserId, filters)`

Requires admin role and returns user/app usage aggregates.

**CONFIG namespace**: `CONFIG_GET_MARKETPLACE_DASHBOARD`

**Service**: `CLS_GetMarketplaceDashboard`

**DB classes**: `AccessRequestDB`, `MarketplaceAppDB`, `AppUsageEventDB`

## Command Service Rules

- Class name must be `CLS_{ActionEntity}`.
- Constructor receives resolved IDs and typed payload/filter objects.
- Public executor is `main()`.
- Each service has private `_statusRequest` and `_requestResponse`.
- Steps run sequentially while status remains `Pending`.
- DB/critical failures call `trackError()` with method, controller, error, and context.
- Audit/activity failures are tracked and do not break a successful main flow unless the action itself is an audit-only operation.
