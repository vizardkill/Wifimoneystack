# Implementation Plan: Home wow del marketplace orientada a resultados

**Branch**: `[004-wow-storefront]` | **Date**: 2026-05-18 | **Spec**: [spec.md](./spec.md) **Input**: Feature specification from
`/specs/004-wow-marketplace-home/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Rediseñar `/marketplace` para que deje de sentirse como un catálogo vacío y pase a operar como una home guiada por resultados: hero editorial, cuatro objetivos
canónicos, stacks curados y catálogo completo dentro de la misma ruta. La implementación reutiliza `CLS_ListPublishedMarketplaceApps` y los contratos actuales
de detalle/uso/descarga, mueve la nueva composición a `app/modules/marketplace/public/home/`, mantiene la curaduría fija en código y evita cambios de Prisma en
la v1.

## Technical Context

**Language/Version**: TypeScript strict mode, Node >=22.15.0, React 19 + React Router 7  
**Primary Dependencies**: Existing marketplace core services, Tailwind-based UI, lucide-react icons, current public marketplace modules (`catalog`, `detail`);
no new dependency is required for v1  
**Storage**: No new persistence; reuse existing Prisma-backed marketplace app, media and storefront data already exposed by public controllers  
**Testing**: `npm run typecheck`, `npm run lint:strict`, `npm run format:check`, manual quickstart validation; repo test files exist as placeholders but there
is no runnable `test` script or active Vitest/Jest harness today  
**Target Platform**: Server-rendered React Router marketplace for approved users  
**Project Type**: Full-stack React Router web application  
**Performance Goals**: Marketplace home p95 server response <= 700ms for approved users with current-scale active catalog; guided sections must remain smooth on
mobile and avoid broken layout shifts when stacks focus inside the same page  
**Constraints**: Preserve `/marketplace` and existing detail/use/download routes; no Prisma schema/migrations; goal/search/stack focus state must live in URL;
search refines inside active goal; stack focus must stay in the same home route; only approved users can access the experience  
**Scale/Scope**: Low hundreds of active apps, four canonical goals, low double-digit curated stacks, one public route redesign and one new public home module in
v1

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Document pass/fail evidence for each SomaUp constitutional gate:

- **MVP Value**: PASS. The independently demonstrable journey is: approved user lands on `/marketplace`, understands value, chooses an objective, opens a
  curated stack, then drills into an existing app detail. The plan explicitly excludes admin authoring for goals/stacks, personalization, ranking systems, and
  new route trees.
- **React Router Workflow**: PASS. `app/routes/marketplace/_index.tsx` remains the workflow owner for query parsing, access-safe loader orchestration and page
  composition. Existing `/marketplace/apps/$appId`, `/use`, and `/download` routes remain intact. Route loaders continue dynamic `await import()` from
  `app/core/marketplace/marketplace.server.ts` only.
- **Core Module Pattern**: PASS. The feature reuses `CLS_ListPublishedMarketplaceApps`, `CLS_GetMarketplaceApp`, `CLS_RecordMarketplaceAppUse`, and
  `CLS_RecordMarketplaceAppDownload` through the existing barrel. No new DB class, provider, Prisma model or protected mutation is introduced because curated
  discovery is fixed in code and handled by pure helpers under the public module.
- **Prisma Data Boundary**: PASS. No Prisma schema or migration changes are planned. Persistent business state remains isolated in current marketplace DB
  classes and is only read through existing core services.
- **Frontend Composition and Forms**: PASS. The route is slimmed by moving hero, goal selector, stack rail/focus, recovery states and catalog framing into a new
  `app/modules/marketplace/public/home/` module. No nontrivial forms are introduced, so `react-hook-form` + `zodResolver` is not needed for this feature.
- **Access and Audit**: PASS. Access enforcement remains unchanged in `marketplace/_layout.tsx` plus the existing published-app and detail/use/download
  controllers. The feature introduces no new admin action or audit requirement in v1.
- **Verification**: PASS. The plan uses the repo-standard gates (`typecheck`, `lint:strict`, `format:check`) plus a manual quickstart journey because the
  repository currently has placeholder test files but no runnable test harness.

## Project Structure

### Documentation (this feature)

```text
specs/004-wow-marketplace-home/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── core-contracts.md
│   └── route-contracts.md
└── tasks.md             # generated later by /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── routes/
│   ├── marketplace/_layout.tsx                     # preserves approved-user gate
│   ├── marketplace/_index.tsx                      # guided home loader + page composition
│   ├── marketplace/apps/$appId.tsx                 # preserved detail route
│   ├── marketplace/apps/$appId.use.ts              # preserved use route
│   └── marketplace/apps/$appId.download.ts         # preserved download route
├── modules/marketplace/
│   ├── public/
│   │   ├── home/                                   # new guided home module
│   │   │   ├── components/
│   │   │   │   ├── marketplace-home-shell.tsx
│   │   │   │   ├── home-hero.tsx
│   │   │   │   ├── goal-selector.tsx
│   │   │   │   ├── curated-stack-grid.tsx
│   │   │   │   ├── focused-stack-section.tsx
│   │   │   │   └── discovery-empty-state.tsx
│   │   │   ├── lib/
│   │   │   │   ├── curated-marketplace-home.config.ts
│   │   │   │   ├── build-home-discovery-state.ts
│   │   │   │   └── build-curated-home-view-model.ts
│   │   │   ├── types/
│   │   │   │   └── marketplace-home.types.ts
│   │   │   └── index.ts
│   │   ├── catalog/
│   │   │   ├── app-card.tsx                        # enrich value signals and contextual chips
│   │   │   ├── app-grid.tsx                        # reused catalog rendering surface
│   │   │   └── index.ts
│   │   ├── detail/
│   │   │   └── app-detail.tsx                      # preserved detail presentation
│   │   └── index.ts                                # export home + catalog + detail
│   └── index.ts
├── core/marketplace/
│   ├── marketplace.server.ts                       # reused barrel only
│   └── services/_list-published-apps.service.ts    # reused published-list source
├── lib/types/_marketplace.types.ts                 # existing marketplace contracts remain unchanged for v1
└── components/                                     # existing shared primitives reused as needed

prisma/
└── schema.prisma                                   # no changes planned

tests/
├── route/marketplace-apps.test.ts                 # extend once runnable route harness exists
└── integration/marketplace-user-journey.test.ts   # extend once runnable integration harness exists
```

**Structure Decision**: Keep the public workflow centered on `app/routes/marketplace/_index.tsx`, but extract all new page-sized UI into a dedicated
`app/modules/marketplace/public/home/` submodule. Reuse `public/catalog/` and `public/detail/` rather than duplicating app-card or detail behavior. Reuse
existing core controllers and avoid Prisma changes because v1 discovery is editorial, fixed in code, and URL-driven rather than persisted.

## Post-Design Constitution Check

_GATE: Re-checked after Phase 1 design artifacts._

- **MVP Value**: PASS. Research, contracts and quickstart stay focused on a single approved-user discovery journey without adding personalization, admin tooling
  or new operational flows.
- **React Router Workflow**: PASS. Route contracts keep `/marketplace` as the single orchestrating route for guided discovery while preserving existing
  detail/use/download flows.
- **Core Module Pattern**: PASS. Core contracts explicitly reuse the current marketplace barrel and avoid introducing an unnecessary new command service for
  fixed code-curated discovery logic.
- **Prisma Data Boundary**: PASS. Data model confirms no Prisma schema or migration work is required in v1.
- **Frontend Composition and Forms**: PASS. The design artifacts isolate the new editorial experience into `app/modules/marketplace/public/home/` and do not
  introduce nontrivial forms.
- **Access and Audit**: PASS. The feature continues to depend on current approved-user access boundaries and does not add new admin or audit mutations.
- **Verification**: PASS. Quickstart and plan align on repo-standard validation commands plus manual journey checks that reflect the current absence of a
  runnable test harness.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
