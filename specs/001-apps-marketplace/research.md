# Phase 0 Research: Marketplace de aplicaciones ecommerce

## Decision: Use the project monolith stack as the baseline

**Rationale**: The user explicitly requested mantener el stack actual del proyecto. The repository configuration confirms Node >=22.15.0, TypeScript strict,
React 19.2.x, React Router 7.14.x, Express 5.2.x, Prisma 7.8.x, `@prisma/adapter-pg`, `pg`, Zod, React Hook Form, Radix UI primitives, Recharts, TanStack React
Table, lucide-react, Sonner, Sentry/Google logging, and strict validation scripts. Reusing this stack keeps planning aligned with the existing team's deployment
and coding habits.

**Alternatives considered**: Separate frontend/backend projects were rejected because the current project pattern is a React Router monolith with server files.
A lighter static app was rejected because the feature requires protected loaders, admin mutations, uploads/downloads, audit records, and relational state.

## Decision: React Router route modules own user and admin workflows

**Rationale**: Existing project routes dynamically import server-only controllers from core barrels inside actions/loaders. The marketplace will follow the same
pattern for registration status, app listing, detail pages, use/download actions, admin approval, app publication, uploads, and dashboards.

**Alternatives considered**: Client-side fetching for protected marketplace data was rejected because unauthorized users could receive data too early or
duplicate access logic. Importing services directly in routes was rejected by the constitution.

## Decision: Model marketplace data in Prisma/PostgreSQL

**Rationale**: The feature is state-heavy: access status, publication status, media, artifact metadata, usage events, and audit decisions need relational
integrity and queryable aggregates. The project uses Prisma with PostgreSQL, uuid IDs, explicit indexes, and timestamped models.

**Alternatives considered**: JSON-only metadata on user/app rows was rejected because dashboards and audit trails need reliable filtering and aggregation. A
document store was rejected because the existing stack and operational questions fit relational data.

## Decision: Use one `app/core/marketplace` module for MVP

**Rationale**: Access approvals, app catalog, usage tracking, and marketplace dashboard share one bounded workflow and authorization model. A single module
keeps the MVP simple while still preserving clear DB/service/controller boundaries.

**Alternatives considered**: Separate `access`, `catalog`, `usage`, and `dashboard` modules were rejected for MVP because they add coordination overhead before
the domain is large enough to justify it.

## Decision: Persist files through object storage metadata plus provider-backed blobs

**Rationale**: App packages, icons, screenshots, and optional videos should not live in PostgreSQL. Persist metadata in Prisma and store blobs through the same
provider-style infrastructure the project already carries (`@google-cloud/storage` and AWS S3 client are in the real package). Download routes must verify
authorization before issuing or serving artifacts.

**Alternatives considered**: Database blob storage was rejected for package ZIPs and media due to size and delivery concerns. Public permanent URLs were
rejected because revoked users must lose access immediately.

## Decision: Use route/integration tests for risky workflows plus mandatory validation scripts

**Rationale**: Constitution requires `npm run typecheck`, `npm run lint:strict`, and `npm run format:check`. The feature touches approvals, revoked access,
downloads, uploads, and analytics, so route/integration tests are required for the access gates, admin mutations, event recording, and dashboard aggregates.

**Alternatives considered**: Manual-only validation was rejected because access control and audit behavior are regression-prone. Unit-only service tests were
rejected because the risk lives at route/server boundaries and persisted transitions.
