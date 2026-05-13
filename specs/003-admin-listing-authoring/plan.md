# Implementation Plan: Authoring avanzado de vitrinas de apps

**Branch**: `[003-admin-listing-authoring]` | **Date**: 2026-05-12 | **Spec**: [spec.md](./spec.md) **Input**: Feature specification from
`/specs/003-admin-listing-authoring/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Deliver a Shopify-style storefront authoring workspace inside the existing admin app edit flow: admins can save draft storefront content, manage
icon/screenshots and optional video, select supported languages from a controlled catalog, preview readiness, and explicitly publish a new storefront version
without altering the currently visible public version until confirmation. Public marketplace detail continues to fall back to the existing legacy presentation
when an app has no published enriched storefront.

## Technical Context

**Language/Version**: TypeScript strict mode, Node >=22.15.0, React 19 + React Router 7  
**Primary Dependencies**: Prisma 7, Zod, Radix/shadcn UI primitives, lucide-react, existing auth/session helpers, existing GCS-backed storage service and media
proxy  
**Storage**: PostgreSQL via Prisma for app/storefront state plus Google Cloud Storage/media proxy for uploaded icon and screenshot assets  
**Testing**: `npm run typecheck`, `npm run lint:strict`, `npm run format:check`, route coverage for admin authoring and public detail rendering, integration
coverage for draft-save/publish/fallback flows  
**Target Platform**: Server-rendered React Router monolith running on Express runtime  
**Project Type**: Full-stack React Router web application  
**Performance Goals**: Admin authoring loader/preview p95 <= 700ms on seeded data; draft save/publish/media registration actions p95 <= 400ms server processing;
public app detail p95 <= 500ms without regressing current marketplace UX  
**Constraints**: The public storefront version must remain stable while a new draft is edited; app operational status (`DRAFT`/`ACTIVE`/`INACTIVE`) must stay
independent from storefront readiness/publication; supported languages must come from a controlled catalog; videos are external URLs in MVP rather than binary
uploads; route modules must dynamically import only core barrels; object storage should reuse the current media proxy and a dedicated marketplace media folder  
**Scale/Scope**: Low dozens of admins, hundreds of apps, one mutable draft plus one published storefront snapshot per app, and up to tens of media assets per
app in MVP

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **MVP Value**: PASS. The independent P1 journey is an admin enriching a single existing app, previewing it, and publishing it without breaking current public
  listings. Reviews, ratings, pricing systems, full multilingual copy authoring, and new marketplace browsing surfaces remain out of scope.
- **React Router Workflow**: PASS. Workflow ownership stays in `app/routes/dashboard/marketplace/apps/$appId.edit.tsx` for admin authoring and
  `app/routes/marketplace/apps/$appId.tsx` for public consumption, both dynamically importing controllers from `app/core/marketplace/marketplace.server.ts`.
- **Core Module Pattern**: PASS. New behavior remains inside `app/core/marketplace/` with `CLS_*` services, new DB classes for storefront persistence, updated
  interfaces, and `CONFIG_*` namespaces in `app/lib/types`.
- **Prisma Data Boundary**: PASS. Draft/public storefront state, language catalog membership, and storefront media associations are modeled explicitly in Prisma
  and isolated through static DB classes.
- **Access and Audit**: PASS. Only `ADMIN`/`SUPERADMIN` can author or publish storefront content; only approved marketplace users can consume public detail; all
  draft saves, storefront publications, and media-affecting updates remain auditable.
- **Verification**: PASS. The plan includes route/integration coverage for admin save/publish flows, legacy fallback behavior, and standard type/lint/format
  plus quickstart validation.

## Project Structure

### Documentation (this feature)

```text
specs/003-admin-listing-authoring/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── core-contracts.md
│   └── route-contracts.md
└── tasks.md            # generated later by /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── routes/
│   ├── marketplace/apps/$appId.tsx                     # update public detail loader/render flow
│   ├── dashboard/marketplace/apps.tsx                 # optional authoring status badges/actions
│   ├── dashboard/marketplace/apps/new.tsx             # keep create -> authoring redirect
│   └── dashboard/marketplace/apps/$appId.edit.tsx     # expand into storefront authoring workspace
├── modules/marketplace/
│   ├── app-form.tsx
│   ├── app-detail.tsx
│   ├── media-gallery-manager.tsx
│   ├── storefront-authoring-form.tsx                  # new
│   ├── storefront-preview.tsx                         # new
│   ├── storefront-readiness-panel.tsx                 # new
│   └── language-multi-select.tsx                      # new
├── core/marketplace/
│   ├── marketplace.server.ts
│   ├── db/marketplace-app.db.ts
│   ├── db/app-media.db.ts
│   ├── db/app-storefront-version.db.ts                # new
│   ├── db/app-storefront-version-media.db.ts          # new
│   ├── db/app-storefront-version-language.db.ts       # new
│   ├── db/language-catalog.db.ts                      # new
│   └── services/
│       ├── _get-marketplace-app.service.ts
│       ├── _upsert-marketplace-app.service.ts
│       ├── _update-app-publication.service.ts
│       ├── _get-marketplace-app-authoring.service.ts  # new
│       ├── _save-storefront-draft.service.ts          # new
│       ├── _publish-storefront.service.ts             # new
│       ├── _prepare-app-media-upload.service.ts       # new
│       ├── _register-app-media.service.ts             # new
│       ├── _remove-app-media.service.ts               # new
│       └── _reorder-storefront-media.service.ts       # new
├── lib/
│   ├── interfaces/_marketplace.interfaces.ts
│   ├── types/_marketplace.types.ts
│   ├── schemas/marketplace.schema.ts
│   └── services/_storage.service.ts
└── routes.ts

prisma/
├── schema.prisma
└── migrations/

tests/
├── route/
│   ├── marketplace-admin-apps.test.ts
│   └── marketplace-apps.test.ts
└── integration/
    ├── marketplace-admin-apps-console.test.ts
    └── marketplace-user-journey.test.ts
```

**Structure Decision**: Keep authoring inside the existing admin edit route instead of creating a second admin workspace, keep public rendering in the current
marketplace app detail route, and concentrate all domain behavior in the marketplace core module. Reuse the existing storage service/media proxy rather than
introducing a new provider layer.

## Post-Design Constitution Check

_GATE: Re-checked after Phase 1 design artifacts._

- **MVP Value**: PASS. Research and contracts keep this increment focused on admin authoring, preview, and controlled publication with public fallback.
- **React Router Workflow**: PASS. Route contracts map the full workflow to the existing admin edit route and public detail route without bypassing route-level
  orchestration.
- **Core Module Pattern**: PASS. Core contracts define one marketplace barrel, explicit `CLS_*` services, and new DB classes for storefront draft/public state.
- **Prisma Data Boundary**: PASS. Data model introduces explicit storefront version, language catalog, and version-media association models instead of ad hoc UI
  state.
- **Access and Audit**: PASS. Design artifacts require admin-only mutations, approved-user detail access, and storefront-specific audit events.
- **Verification**: PASS. Quickstart and planned tests cover draft save, readiness validation, media registration, storefront publication, and legacy fallback.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
