# Core Contracts: Admin Console 002

Route modules must dynamically import only barrel exports from core modules.

## Module: app/core/marketplace

Public entry point: [app/core/marketplace/marketplace.server.ts](app/core/marketplace/marketplace.server.ts)

### CLS_GetMarketplaceDashboard (updated)

**Purpose**: Return dashboard KPIs with current counters and 7-day variation.

**Input contract**:

- `days_window`: fixed to `7` for variation

**Output contract**:

- `kpis_current`: current counters by user/app status
- `kpis_variation_7d`:
  - `new_users_7d`
  - `access_decisions_7d`
  - `apps_activated_7d`
  - `apps_deactivated_7d`

**Dependencies**:

- `AccessRequestDB`
- `MarketplaceAppDB`
- `AppUsageEventDB`
- `MarketplaceAuditEventDB` (for decision/app status variation)

### CLS_ListMarketplaceAccessRequests

**Purpose**: List users by access status for admin operations.

**Output requirements**:

- include enough user detail for decision view
- include `updated_at` (or decision state token) to support first-write-wins action safety

### CLS_DecideMarketplaceAccessRequest (updated)

**Purpose**: Approve/reject pending requests with first-write-wins semantics.

**Behavior contract**:

- success only when current persisted status matches expected status from read phase
- stale writes return conflict status and refresh-required message

### CLS_RevokeMarketplaceAccess (updated)

**Purpose**: Revoke approved users with first-write-wins semantics.

**Behavior contract**:

- revoke only if current status is still `APPROVED`
- stale writes return conflict status

### CLS_UpsertMarketplaceApp / CLS_UpdateMarketplaceAppPublication

**Purpose**: Keep app module scoped to basic catalog fields and publication state changes.

**Feature-specific contract**:

- basic create/edit requires `name` and `summary`
- publication/unpublication maintains existing marketplace validation rules

## Module: app/core/auth

Public entry point: [app/core/auth/auth.server.ts](app/core/auth/auth.server.ts)

### listAdminAccountsController (new)

**Purpose**: Return current admin/superadmin accounts for Administradores module.

**Input contract**:

- actor id (must be `SUPERADMIN`)
- optional pagination/search

**Output contract**:

- account id, email, display name, role, created_at

**Dependencies**:

- `UserDB`

### promoteUserToAdminController (new)

**Purpose**: Promote an existing account by email to `ADMIN`.

**Input contract**:

- `actor_user_id` (must be `SUPERADMIN`)
- `target_email`

**Behavior contract**:

- target account must exist
- duplicate promotion is blocked when role already admin-capable
- writes audit event with action `ADMIN_PROMOTED`

**Dependencies**:

- `UserDB`
- `MarketplaceAuditEventDB` (or equivalent audit writer)

## CONFIG Namespace Updates

Planned type updates in [app/lib/types/\_marketplace.types.ts](app/lib/types/_marketplace.types.ts) and related auth type files:

- Add conflict status to decision/revocation response namespaces.
- Extend dashboard response namespace with `kpis_variation_7d` block.
- Add auth/admin namespaces for listing admins and promotion by email.
