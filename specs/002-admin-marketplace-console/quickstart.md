# Quickstart: Panel administrativo del marketplace (Feature 002)

## Prerequisites

- Node >= 22.15.0
- PostgreSQL available for Prisma runtime
- Environment files configured for app server

## Setup

1. Install dependencies.
2. Ensure database connection variables are set.
3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Apply migrations after implementation.
5. Start development server:

```bash
npm run dev
```

## Manual Validation Flow

1. Sign in as `SUPERADMIN` and open admin dashboard.
2. Verify sidebar modules are visible: Dashboard, Usuarios, Apps, Administradores.
3. In Dashboard, verify current counters and 7-day variation blocks are rendered.
4. In Usuarios, approve one pending request and verify status update.
5. In Usuarios, revoke one approved user and verify access is removed.
6. Simulate stale decision attempt from a second admin tab and verify conflict + refresh-required message.
7. In Apps, create one app with basic fields (`name`, `summary`).
8. Edit the same app basic fields and verify persisted update.
9. Publish and unpublish one app and verify user-facing availability changes.
10. In Administradores (SUPERADMIN only), promote an existing `USER` account by email.
11. Attempt duplicate promotion and verify clear blocked response.
12. Verify audit records exist for approve/reject/revoke, publish/unpublish, and admin promotion.

## Validation Commands

```bash
npm run typecheck
npm run lint:strict
npm run format:check
```

## Expected Results

- Only admin-capable roles can access admin dashboard routes.
- Only `SUPERADMIN` can access and mutate the Administradores module.
- User decisions follow first-write-wins behavior under concurrency.
- Dashboard always shows current counters and 7-day variation metrics.
- App module supports basic create/edit plus publish/unpublish in this feature scope.
- Protected administrative actions write auditable events.
