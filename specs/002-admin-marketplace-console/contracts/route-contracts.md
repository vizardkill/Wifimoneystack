# Route Contracts: Admin Console 002

All admin routes must:

- resolve user from session token
- allow access for `ADMIN` or `SUPERADMIN` where applicable
- reserve administrator-management mutations for `SUPERADMIN` only
- dynamically import server controllers from core barrels

## Route: /dashboard (layout)

Source: [app/routes/dashboard/\_layout.tsx](app/routes/dashboard/_layout.tsx)

**Loader contract**:

- redirect unauthenticated users to `/login`
- redirect non-admin roles to `/marketplace`
- return user identity and role for sidebar UI

**UI contract**:

- sidebar must include modules:
  - Dashboard
  - Usuarios
  - Apps
  - Administradores
- active module must be highlighted

## Route: /dashboard/marketplace

Source: [app/routes/dashboard/marketplace/\_index.tsx](app/routes/dashboard/marketplace/_index.tsx)

**Loader contract**:

- return dashboard payload with:
  - current counters
  - 7-day variation counters
- return safe empty-state payload when no data exists

## Route: /dashboard/marketplace/users

Source: [app/routes/dashboard/marketplace/users.tsx](app/routes/dashboard/marketplace/users.tsx)

**Loader contract**:

- return list by status filter with decision metadata
- include staleness token (`updated_at` or equivalent) required for first-write-wins action

**Action contract**:

- intents: `approve`, `reject`, `revoke`
- on stale decision conflict, return conflict response with refresh-required message
- persist audit event for every successful decision

## Route: /dashboard/marketplace/apps

Source: [app/routes/dashboard/marketplace/apps.tsx](app/routes/dashboard/marketplace/apps.tsx)

**Loader contract**:

- list app catalog entries with basic fields and status

**Action contract**:

- intents: `publish`, `unpublish`
- preserve publication guardrails from marketplace core

## Route: /dashboard/marketplace/apps/new

Source: [app/routes/dashboard/marketplace/apps/new.tsx](app/routes/dashboard/marketplace/apps/new.tsx)

**Action contract**:

- create app with basic card fields (`name`, `summary`, `status` default flow)
- return validation errors for missing required basic fields

## Route: /dashboard/marketplace/apps/:appId/edit

Source: [app/routes/dashboard/marketplace/apps/$appId.edit.tsx](app/routes/dashboard/marketplace/apps/$appId.edit.tsx)

**Loader contract**:

- return app detail for editing

**Action contract**:

- update basic card fields and status-related fields in scope
- return field-level validation messages when applicable

## Route: /dashboard/marketplace/admins (new)

Planned source: [app/routes/dashboard/marketplace/admins.tsx](app/routes/dashboard/marketplace/admins.tsx)

**Loader contract**:

- allow only `SUPERADMIN`
- return current admin/superadmin accounts

**Action contract**:

- intent: `promote_admin`
- input: `email`
- behavior:
  - promote existing eligible account by email
  - block duplicates with clear message
  - record `ADMIN_PROMOTED` audit event

**Error contract**:

- unauthorized actor -> 403
- target not found -> not found message
- duplicate role -> validation/conflict message
