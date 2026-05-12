# Implementation Plan: Panel administrativo del marketplace

**Branch**: `[002-apps-marketplace]` | **Date**: 2026-05-11 | **Spec**: [spec.md](./spec.md) **Input**: Feature specification from
`/specs/002-admin-marketplace-console/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Deliver the admin console increment for marketplace operations: keep the left-sidebar admin shell, enforce admin role access, add the Administradores module for
superadmin-only promotion by email, harden user decision flows with first-write-wins conflict behavior, and evolve dashboard metrics to include current counters
plus 7-day variation for key operational events. Implementation follows existing stack and constitutional boundaries (route loaders/actions -> core controllers
-> command services -> DB classes).

## Technical Context

**Language/Version**: TypeScript strict mode, Node >=22.15.0, React 19 + React Router 7  
**Primary Dependencies**: Prisma 7, Zod, Radix/shadcn UI primitives, lucide-react, existing internal auth/session helpers  
**Storage**: PostgreSQL via Prisma schema and migrations in [prisma/schema.prisma](prisma/schema.prisma) and [prisma/migrations](prisma/migrations)  
**Testing**: `npm run typecheck`, `npm run lint:strict`, `npm run format:check`, route/integration coverage for admin access, decision conflicts, dashboard
variation, app basic CRUD, and admin promotion flow  
**Target Platform**: Server-rendered React Router monolith running on Express runtime  
**Project Type**: Full-stack React Router web application  
**Performance Goals**: Admin dashboard loader p95 <= 500ms on seeded data; user decision and admin promotion actions p95 <= 300ms server processing; admin
navigation transitions without full-page reload regressions  
**Constraints**: First-write-wins for concurrent decisions; only `SUPERADMIN` can promote admins; app scope limited to basic card fields + status changes in
this feature; route modules must dynamically import core server barrels only  
**Scale/Scope**: MVP operational scope for hundreds to low-thousands of users, low dozens of admins, and dashboards using direct relational aggregates

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **MVP Value**: PASS. Scope focuses on daily admin operation (dashboard, users, apps, admin promotion) and excludes advanced platform expansion.
- **React Router Workflow**: PASS. Route modules in [app/routes/dashboard](app/routes/dashboard) own loaders/actions and dynamically import server controllers.
- **Core Module Pattern**: PASS. Business logic remains in [app/core/marketplace](app/core/marketplace) and [app/core/auth](app/core/auth) with command services
  and DB classes.
- **Prisma Data Boundary**: PASS. Role/audit updates are modeled in Prisma; persistence changes stay in DB classes.
- **Access and Audit**: PASS. Role enforcement and audit writes are explicit for decisions, publication updates, and admin promotion.
- **Verification**: PASS. Plan includes route/integration test targets plus mandatory typecheck/lint/format and quickstart validation.

## Project Structure

### Documentation (this feature)

```text
specs/002-admin-marketplace-console/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── core-contracts.md
│   └── route-contracts.md
└── tasks.md            # generated in /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── routes/
│   ├── dashboard/_layout.tsx
│   ├── dashboard/marketplace/_index.tsx
│   ├── dashboard/marketplace/users.tsx
│   ├── dashboard/marketplace/apps.tsx
│   ├── dashboard/marketplace/apps/new.tsx
│   ├── dashboard/marketplace/apps/$appId.edit.tsx
│   └── dashboard/marketplace/admins.tsx            # new
├── modules/marketplace/
│   ├── dashboard-kpis.tsx
│   ├── admin-access-table.tsx
│   └── app-form.tsx
├── core/
│   ├── marketplace/
│   │   ├── marketplace.server.ts
│   │   ├── db/access-request.db.ts
│   │   ├── db/marketplace-app.db.ts
│   │   ├── db/marketplace-audit-event.db.ts
│   │   └── services/
│   │       ├── _get-marketplace-dashboard.service.ts
│   │       ├── _decide-access-request.service.ts
│   │       ├── _revoke-access.service.ts
│   │       └── _upsert-marketplace-app.service.ts
│   └── auth/
│       ├── auth.server.ts
│       ├── db/user.db.ts
│       └── services/_promote-admin-user.service.ts # new
├── lib/
│   ├── interfaces/_auth.interfaces.ts
│   ├── interfaces/_marketplace.interfaces.ts
│   ├── types/_marketplace.types.ts
│   └── helpers/_marketplace-audit.helper.ts
└── routes.ts

prisma/
├── schema.prisma
└── migrations/

tests/
├── route/marketplace-admin-users.test.ts
├── route/marketplace-admin-apps.test.ts
├── route/marketplace-dashboard.test.ts
├── route/marketplace-admin-admins.test.ts          # new
└── integration/marketplace-admin-console.test.ts   # new
```

**Structure Decision**: Keep all admin console workflow in existing dashboard marketplace routes, keep marketplace decisions and dashboard aggregation inside
the marketplace core module, and place role promotion inside auth core because role mutation is an identity concern.

## Post-Design Constitution Check

_GATE: Re-checked after Phase 1 design artifacts._

- **MVP Value**: PASS. Research and contracts keep this slice focused on operational admin value without introducing invitation systems or advanced analytics.
- **React Router Workflow**: PASS. Route contracts map concrete loaders/actions including the new `/dashboard/marketplace/admins` route.
- **Core Module Pattern**: PASS. Core contracts define controller and service responsibilities for both marketplace and auth role-promotion workflows.
- **Prisma Data Boundary**: PASS. Data model captures enum/index updates and concurrency-safe persistence contracts through DB class methods.
- **Access and Audit**: PASS. Data model and contracts require explicit role checks and audit events including `ADMIN_PROMOTED`.
- **Verification**: PASS. Quickstart and testing strategy include conflict behavior, role restrictions, dashboard variation, and admin promotion validation.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
