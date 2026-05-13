<!--
Sync Impact Report
Version change: 1.2.0 -> 1.3.0
Modified principles: II. React Router Owns User Workflows; VI. Frontend Modular Composition and Form Contracts
Added principles: VII. Feature Module Topology and Public API Barrels
Added sections: Architecture & Product Constraints; Development Workflow & Quality Gates
Removed sections: none
Templates requiring updates:
- none required (governance clarified without template contract changes)
- not applicable: .specify/templates/commands/*.md was not present
Follow-up TODOs: none

-->

# Marketplace Ecommerce Constitution

## Core Principles

### I. MVP Value Before Platform Complexity

Every feature MUST deliver a complete, independently demonstrable user journey before adding secondary platform capabilities. Marketplace work MUST prioritize
the path from requesting access, receiving approval, discovering an application, reading its detail, and using or downloading it. Features that add dashboards,
configuration, automation, or monetization MUST state which core journey they improve and MUST avoid expanding scope beyond the approved specification.

Rationale: This project is being built as an operational marketplace, so value comes from users reaching useful tools quickly, not from premature platform
breadth.

### II. React Router Owns User Workflows

User and admin workflows MUST be modeled around React Router route modules. Route modules MAY parse form data, validate route-level input, call auth/session
helpers, and return `data()` or `redirect()` outcomes. Route modules MUST import server-only core controllers with dynamic `await import()` from
`{module}.server.ts` barrels and MUST NOT import DB classes, internal `_*.service.ts` files, Prisma clients, or providers directly. Reusable React components
MUST remain presentation-focused and MUST NOT perform direct persistence, approval decisions, or cross-route orchestration. Redirects and blocked access states
MUST be explicit in the route flow.

Route modules MUST stay lean: auth checks, loader/action orchestration, intent dispatch, and composition of feature components. Large UI trees, multistep state
machines, and derived readiness logic MUST live in feature modules under `app/modules/{feature}/` via dedicated components, hooks, or helpers.

Default route rendering MUST delegate to feature shells from `app/modules/{feature}/...` instead of embedding page-sized JSX trees inside route files. Route
files MAY assemble loader/action data and pass it to shells, but route files MUST NOT become long-lived UI containers.

Rationale: Keeping workflow ownership in routes makes the app understandable, testable, and consistent as the marketplace grows.

### III. Prisma Data Integrity and Boundaries

Persistent business state MUST be represented in Prisma schema and migrations before application behavior depends on it. Approval states, application
publication states, download/use events, and admin decisions MUST use explicit persisted models or enums, not informal strings scattered through UI code.
Persistence MUST live in `app/core/{module}/db/{entity}.db.ts` static DB classes that import `db` from `@/db.server`, return Prisma ORM types, receive domain
interface inputs from `@lib/interfaces`, manage `created_at` and `updated_at` manually, and avoid service-style business branching. Services and routes MUST NOT
import the database client directly.

Rationale: The marketplace depends on auditable status transitions and usage metrics; clear data boundaries prevent fragile coupling and preserve traceability.

### IV. Access Control, Auditability, and Admin Trust

Every protected user action MUST verify the current approval state and role at the server boundary before returning data or mutating state. Admin actions that
approve, reject, revoke, publish, unpublish, upload, link, or modify applications MUST record who performed the action and when. User-facing states MUST
distinguish pending, approved, rejected, and revoked access without exposing unauthorized marketplace data.

Rationale: This project controls access to internal ecommerce tools, so trust depends on clear authorization, reversible operations, and accountable admin
decisions.

### V. Verifiable Incremental Delivery

Each user story MUST include an independent test path before implementation starts. Features touching routes, Prisma models, permissions, uploads, downloads, or
usage analytics MUST include coverage for the affected route behavior and data transition. At minimum, completion requires `npm run typecheck`,
`npm run lint:strict`, `npm run format:check`, and manual quickstart validation unless the plan documents an approved exception. Automated tests MUST be added
when a test harness exists or when the feature introduces security, billing, approval, upload/download, or analytics risk.

Delivery verification MUST include architecture checks for boundaries: route files cannot import `@/db.server`, core DB classes, or internal `_*.service.ts`
implementations. These constraints MUST be enforced by lint configuration and validated in feature reviews.

Rationale: Incremental delivery only stays safe when each slice can be verified on its own and does not silently break previously delivered marketplace flows.

### VI. Frontend Modular Composition and Form Contracts

Frontend code MUST follow feature modularity inspired by SomaUp standards:

- Shared primitives and design-system wrappers live in `app/components/`.
- Feature UI lives in `app/modules/{feature}/` and SHOULD be split into `components`, `forms`, `hooks`, `lib`, and `types` when complexity increases.
- Generic cross-feature hooks live in `app/hooks/`; feature-specific hooks stay inside each module.
- Mature feature modules MUST avoid flat file sprawl at module root. Module roots SHOULD contain domain folders (for example `admin/`, `public/`, `shared/`)
  plus curated `index.ts` exports.

Forms with nontrivial behavior (multistep flows, conditional validation, async server feedback, file metadata workflows) MUST use `react-hook-form` with
`zodResolver` on the client and matching Zod schemas on server actions. Trivial single-action forms MAY use plain React Router `<Form>`.

Actions with multiple intents MUST use explicit intent dispatch and per-intent schema validation, rather than ad-hoc parsing branches.

Rationale: Modular composition and strict form contracts reduce regressions, simplify onboarding, and keep UI flows maintainable as features grow.

### VII. Feature Module Topology and Public API Barrels

Feature modules MUST present an intentional filesystem topology and explicit public APIs:

- `app/modules/{feature}/index.ts` is the feature entry point and MUST re-export only approved public members.
- Subdomains (for example `admin/apps/edit/components`, `admin/dashboard/widgets`, `public/catalog`) MUST expose local `index.ts` barrels when they contain
  multiple files.
- Routes and external modules MUST import through feature/domain barrels (for example `@modules/{feature}/admin/...`) instead of reaching private files by deep
  relative paths.
- When moving or splitting module files, the same change MUST update all affected barrels/imports so there are no orphaned exports or legacy paths.

Rationale: Stable import surfaces and domain-based folders prevent component sprawl, reduce coupling, and make large refactors safe.

## Architecture & Product Constraints

The project MUST be planned as a React 19 and React Router 7 application using Prisma 7 for persistence and TypeScript strict mode for application code. Feature
plans MUST document the real source layout before implementation begins, including route modules, reusable UI, domain core modules, `CONFIG_*` types,
interfaces, Prisma schema/migrations, and validation commands.

Frontend feature plans MUST include the module decomposition strategy when touching UI-heavy routes, especially for wizard-like flows, media management, and
data-entry pages.

Each business domain MUST live under `app/core/{module}/`. The only public entry point for a core module MUST be `app/core/{module}/{module}.server.ts`.
Internal services, types, helpers, functions, factories, and orchestrators MUST use the `_` filename prefix and MUST NOT be imported directly from routes. Core
modules MUST follow this shape unless the plan justifies a narrower read-only module:

```text
app/core/{module}/
├── {module}.server.ts
├── db/{entity}.db.ts
├── services/_{action}-{entity}.service.ts
└── providers/                 # only for multiple strategies
```

Service classes MUST follow the Command Pattern: `CLS_{ActionEntity}` classes, private `_` fields, `main()` as the public executor, a sequential `steps`
pipeline, and early exit through the `RequestStatus` enum inside the matching `CONFIG_*` namespace. DB steps MUST catch errors locally, set `_statusRequest` and
`_requestResponse`, and call `trackError()` with method, controller, error, and relevant context. Noncritical activity or audit logging MUST NOT break the main
flow.

Operation types MUST live in `app/lib/types` as `CONFIG_{ACTION}_{ENTITY}` namespaces with `RequestStatus`, `Payload` or filters, and `RequestResponse`. Domain
DB input interfaces MUST live in `app/lib/interfaces`, use `interface` for data contracts, and be re-exported from `app/lib/interfaces/index.ts`. Path aliases
MUST match project patterns: `@/*`, `@lib/*`, `@types`, `@components/*`, `@ui/*`, `@hooks/*`, `@modules/*`, and `@routes/*`.

When a feature has both user-facing and admin-facing experiences, module decomposition SHOULD separate those surfaces under dedicated folders (for example
`public/` and `admin/`) and keep shared UI in explicit shared folders rather than ad-hoc root files.

The product experience MUST feel like a focused operational marketplace, not a generic landing page. The first usable screen for approved users MUST expose
available applications; admin screens MUST prioritize counts, pending work, clear filters, and actionable tables or charts. MVP scope MUST exclude payments,
commissions, public reviews, paid ranking, and broad branding systems unless a later specification amends that scope.

Application publication MUST require enough content for a user to understand what the tool does: name, icon, description, instructions, at least one visual
reference, access mode, and either a web link or package artifact. Optional videos MUST enhance a listing without blocking publication.

## Development Workflow & Quality Gates

Specs MUST describe user value, roles, data entities, access states, edge cases, and measurable success criteria before planning begins. Plans MUST pass the
Constitution Check before research and again after design. Tasks MUST be grouped by independently testable user story and MUST include Prisma, route,
access-control, audit, and test work whenever those areas are affected.

Implementation MUST proceed in priority order: foundational data/access boundaries first, then the smallest P1 user journey, then later admin or analytics
enhancements. Any complexity that adds providers, factories, orchestrators, background processing, storage mechanisms, or cross-cutting abstractions MUST be
justified against the standard route -> controller -> service -> DB flow in the plan. Documentation and quickstart steps MUST be updated when a feature changes
setup, environment variables, migrations, admin workflows, user workflows, validation commands, or public core-module contracts.

When a feature includes significant frontend authoring UX, implementation MUST explicitly cover:

- Route slimming and extraction of module hooks/components.
- Shared form primitives reuse.
- Zod schema alignment between client and server.
- Boundaries preventing persistence logic in route/component layers.
- Module topology checks: no new page-sized feature components left loose at `app/modules/{feature}` root, and barrels updated for every moved/added subdomain.

## Governance

This constitution supersedes conflicting project practices for this project's feature work. Every specification, plan, task list, review, and implementation
MUST verify compliance with the Core Principles and Quality Gates. If a feature intentionally violates a principle, the plan MUST record the violation, business
reason, rejected simpler alternative, and mitigation before implementation starts.

Amendments require updating this file, adding a Sync Impact Report, reviewing dependent templates, and documenting the version bump rationale. Semantic
versioning applies: MAJOR for removed or redefined principles, MINOR for new principles or materially expanded governance, and PATCH for clarifications that do
not change obligations.

**Version**: 1.3.0 | **Ratified**: 2026-05-10 | **Last Amended**: 2026-05-12
