# Implementation Plan: Marketplace de aplicaciones ecommerce

**Branch**: `001-apps-marketplace` | **Date**: 2026-05-10 | **Spec**: [spec.md](./spec.md) **Input**: Feature specification from
`/specs/001-apps-marketplace/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a controlled ecommerce-app marketplace where users register, wait for admin approval, browse active applications, open Shopify-style detail pages, and use
or download tools while admins manage approvals, listings, publication states, media, artifacts, and operational dashboards. The technical approach mirrors the
current project stack: a single React Router 7 monolith on Node >=22.15.0, server-only route workflows, Prisma 7 with PostgreSQL, `app/core/{module}` business
modules, Command-pattern services, static Prisma DB classes, Zod validation, Radix/shadcn UI primitives, Recharts dashboards, and strict validation through
typecheck, lint, and format checks.

## Technical Context

**Language/Version**: TypeScript strict mode, Node >=22.15.0, ES2022 target, React JSX runtime  
**Primary Dependencies**: React 19.2.x, React Router 7.14.x (`@react-router/dev`, `@react-router/express`, `@react-router/node`, `@react-router/serve`), Express
5.2.x, Prisma 7.8.x, `@prisma/adapter-pg`, `pg`, Zod 4.3.x, React Hook Form, Radix UI/shadcn primitives, Tailwind utility stack, lucide-react, Recharts,
TanStack React Table, Sonner, Sentry/Google logging where operational telemetry is enabled  
**Storage**: PostgreSQL relational database through Prisma schema and migrations in `prisma/`; package artifacts and media use provider-backed object storage
compatible with project patterns (`@google-cloud/storage` or S3 client selected by environment) with metadata persisted in PostgreSQL  
**Testing**: `npm run typecheck`, `npm run lint:strict`, `npm run format:check`; route/integration coverage for approval, authorization, publication, artifact
download/use, and dashboard counters  
**Target Platform**: React Router server-rendered web application served by the monolith Express/server runtime  
**Project Type**: Full-stack React Router monolith with server files and route-owned workflows  
**Performance Goals**: Admin/user dashboards render counts from indexed queries within 500ms p95 on seeded MVP data; approved-user marketplace list opens within
1s p95; detail page interaction recording must not block navigation longer than 300ms p95  
**Constraints**: Unauthorized users must never receive marketplace data from server loaders; all protected mutations verify role and approval state server-side;
package download links must be short-lived or authorization-checked; admin audit events must survive application deactivation/revocation flows  
**Scale/Scope**: MVP targets hundreds to low thousands of controlled users, dozens to hundreds of listed apps, and event volumes suitable for PostgreSQL
aggregate queries before introducing background analytics infrastructure

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **MVP Value**: PASS. The first deliverable is the controlled journey from access request to approved marketplace browsing and app use/download. Payments,
  commissions, public reviews, paid ranking, and broad branding remain out of scope.
- **React Router Workflow**: PASS. Route modules own loaders/actions for auth, blocked states, listing/detail, admin decisions, publication, upload/link
  actions, and dashboards. Server-only behavior is imported dynamically from `app/core/marketplace/marketplace.server.ts`.
- **Core Module Pattern**: PASS. Marketplace domain work is centralized under `app/core/marketplace/` with `marketplace.server.ts`, `db/*.db.ts`,
  `services/_*.service.ts`, `app/lib/interfaces/_marketplace.interfaces.ts`, and `app/lib/types/_marketplace.types.ts`.
- **Prisma Data Boundary**: PASS. Prisma models/enums cover access requests, application listings, media, package artifacts, usage events, and audit events.
  Static DB classes isolate all `db` imports.
- **Access and Audit**: PASS. User loaders enforce pending/approved/rejected/revoked states. Admin mutations require admin role and persist actor/time/action
  records.
- **Verification**: PASS. Required validation is typecheck, strict lint, format check, quickstart, plus route/integration tests for approval, revocation,
  publication, download/use event recording, and dashboard aggregates.

## Project Structure

### Documentation (this feature)

```text
specs/001-apps-marketplace/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── routes/
│   ├── auth/signup.tsx
│   ├── marketplace/_layout.tsx
│   ├── marketplace/_index.tsx
│   ├── marketplace/apps/$appId.tsx
│   ├── marketplace/apps/$appId.use.ts
│   ├── marketplace/apps/$appId.download.ts
│   ├── dashboard/marketplace/users.tsx
│   ├── dashboard/marketplace/apps.tsx
│   ├── dashboard/marketplace/apps/new.tsx
│   ├── dashboard/marketplace/apps/$appId.edit.tsx
│   └── dashboard/marketplace/_index.tsx
├── components/
│   └── ui/              # Radix/shadcn primitives already used by the project
├── modules/
│   └── marketplace/     # App cards, detail view, admin tables, dashboard widgets
├── hooks/
├── lib/
│   ├── interfaces/_marketplace.interfaces.ts
│   ├── interfaces/index.ts
│   ├── types/_marketplace.types.ts
│   ├── types/index.ts
│   ├── schemas/marketplace.schema.ts
│   ├── functions/_track_error.function.ts
│   └── helpers/_marketplace-audit.helper.ts
└── core/
    └── marketplace/
        ├── marketplace.server.ts
        ├── db/access-request.db.ts
        ├── db/marketplace-app.db.ts
        ├── db/app-media.db.ts
        ├── db/app-artifact.db.ts
        ├── db/app-usage-event.db.ts
        ├── db/marketplace-audit-event.db.ts
        └── services/
            ├── _request-access.service.ts
            ├── _get-access-status.service.ts
            ├── _list-published-apps.service.ts
            ├── _get-marketplace-app.service.ts
            ├── _record-app-use.service.ts
            ├── _record-app-download.service.ts
            ├── _list-access-requests.service.ts
            ├── _decide-access-request.service.ts
            ├── _revoke-access.service.ts
            ├── _upsert-marketplace-app.service.ts
            ├── _update-app-publication.service.ts
            └── _get-marketplace-dashboard.service.ts

prisma/
├── schema.prisma
└── migrations/

tests/
├── route/marketplace-access.test.ts
├── route/marketplace-admin.test.ts
├── integration/marketplace-user-journey.test.ts
└── integration/marketplace-dashboard.test.ts
```

**Structure Decision**: Use a single `marketplace` business domain module because registration approval, app listing, usage recording, artifact metadata, and
dashboard aggregates are one bounded marketplace workflow. Split into more modules only after the core journey is stable and there is a demonstrated ownership
boundary.

## Post-Design Constitution Check

_GATE: Re-checked after Phase 1 design artifacts._

- **MVP Value**: PASS. `research.md`, `data-model.md`, route contracts, and quickstart preserve the P1 journey before broader analytics or platform expansion.
- **React Router Workflow**: PASS. `contracts/route-contracts.md` maps loaders/actions, blocked access states, redirects, and dynamic server-barrel imports.
- **Core Module Pattern**: PASS. `contracts/core-contracts.md` maps public controllers, `CONFIG_*` namespaces, Command services, and static DB classes.
- **Prisma Data Boundary**: PASS. `data-model.md` defines relational entities, enums, indexes, validation rules, and state transitions for Prisma/PostgreSQL.
- **Access and Audit**: PASS. Access status enforcement, admin actor requirements, usage events, and audit events are included in the model and contracts.
- **Verification**: PASS. `quickstart.md` includes manual validation and the required `npm run typecheck`, `npm run lint:strict`, and `npm run format:check`
  commands; route/integration test targets are documented in the source tree.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
