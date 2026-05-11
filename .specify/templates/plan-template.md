# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link] **Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript strict mode on Node >=22.15.0  
**Primary Dependencies**: React 19, React Router 7, Prisma 7, Zod, shadcn/Radix UI as applicable  
**Storage**: Prisma-backed relational database with schema and migrations in `prisma/`  
**Testing**: `npm run typecheck`, `npm run lint:strict`, `npm run format:check`, plus story-specific route/integration coverage when required  
**Target Platform**: React Router server-rendered web application **Project Type**: Full-stack React Router web app  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Document pass/fail evidence for each SomaUp constitutional gate:

- **MVP Value**: Plan identifies the independently demonstrable user journey and excludes nonessential platform scope.
- **React Router Workflow**: Plan maps route modules responsible for data loading, mutations, redirects, blocked access states, and dynamic `await import()`
  calls to server-only core controllers.
- **Core Module Pattern**: Plan maps each affected `app/core/{module}/` directory, `{module}.server.ts` barrel, internal `_*.service.ts` files, DB classes,
  interfaces, and `CONFIG_*` namespaces.
- **Prisma Data Boundary**: Plan lists Prisma schema/migration changes and the static `app/core/{module}/db/{entity}.db.ts` classes that isolate persistence.
- **Access and Audit**: Plan defines role checks, approval-state enforcement, and audit records for admin or protected actions.
- **Verification**: Plan lists automated tests, type/lint checks, and quickstart validation required for the affected user stories.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/
├── routes/              # React Router route modules and page-level workflows
├── components/          # Presentation-focused reusable UI
├── modules/             # Feature UI composition modules when needed
├── hooks/               # Reusable React hooks
├── lib/
│   ├── interfaces/      # Domain input contracts re-exported from index.ts
│   ├── types/           # CONFIG_* namespaces re-exported from index.ts
│   ├── functions/       # Internal _*.function.ts utilities
│   └── helpers/         # Internal _*.helper.ts utilities
└── core/
  └── {module}/
    ├── {module}.server.ts              # Only public server entry point
    ├── db/{entity}.db.ts               # Static Prisma data-access class
    ├── services/_{action}-{entity}.service.ts
    └── providers/                      # Only if multiple strategies exist

prisma/
├── schema.prisma
└── migrations/

tests/
├── route/               # Route behavior, access state, loaders/actions
├── integration/         # User/admin journeys across routes and persistence
└── unit/                # Pure domain or utility behavior
```

**Structure Decision**: [Document the selected structure and reference the real directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                             | Why Needed                     | Simpler Alternative Rejected Because                            |
| ------------------------------------- | ------------------------------ | --------------------------------------------------------------- |
| [e.g., 4th project]                   | [current need]                 | [why 3 projects insufficient]                                   |
| [e.g., provider/factory/orchestrator] | [specific multi-strategy need] | [why standard controller -> service -> DB flow is insufficient] |
