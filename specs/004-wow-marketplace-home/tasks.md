# Tasks: Home wow del marketplace orientada a resultados

**Input**: Design documents from `/specs/004-wow-marketplace-home/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No se generan tareas de tests automatizados en esta fase porque el repo actualmente no tiene un runner ejecutable de Vitest/Jest. La validación
obligatoria para este feature se hace con el flujo manual de `specs/004-wow-marketplace-home/quickstart.md`, más `npm run typecheck`, `npm run lint:strict` y
`npm run format:check`.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Crear la base del submódulo público de home guiada y su configuración inicial.

- [x] T001 Create the guided home module scaffold in app/modules/marketplace/public/home/index.ts and app/modules/marketplace/public/home/components/index.ts
- [x] T002 [P] Define guided-home UI types in app/modules/marketplace/public/home/types/marketplace-home.types.ts
- [x] T003 [P] Create the initial curated-home config shell in app/modules/marketplace/public/home/lib/curated-marketplace-home.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Preparar el estado de descubrimiento y la composición base que todas las historias reutilizan.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [x] T004 [P] Implement the URL discovery-state parser in app/modules/marketplace/public/home/lib/build-home-discovery-state.ts
- [x] T005 [P] Implement the curated home view-model builder in app/modules/marketplace/public/home/lib/build-curated-home-view-model.ts
- [x] T006 Update public marketplace barrels in app/modules/marketplace/public/index.ts and app/modules/marketplace/index.ts to export the new home module
- [x] T007 Refactor app/routes/marketplace/\_index.tsx to parse goal, search, and stack_focus and pass typed discovery props while preserving dynamic import of
      app/core/marketplace/marketplace.server.ts

**Checkpoint**: Foundation ready - guided home work can now proceed by user story.

---

## Phase 3: User Story 1 - Entender de inmediato por dónde empezar (Priority: P1) 🎯 MVP

**Goal**: Darle al usuario aprobado una primera impresión fuerte con promesa de valor y rutas claras de inicio.

**Independent Test**: Entrar a `/marketplace` con un usuario `APPROVED` y comprobar que la home muestra hero + objetivos canónicos antes del catálogo,
permitiendo elegir una dirección clara sin depender del buscador.

- [x] T008 [P] [US1] Define hero copy and canonical goal metadata in app/modules/marketplace/public/home/lib/curated-marketplace-home.config.ts
- [x] T009 [P] [US1] Implement the editorial hero in app/modules/marketplace/public/home/components/home-hero.tsx
- [x] T010 [P] [US1] Implement the canonical goal selector in app/modules/marketplace/public/home/components/goal-selector.tsx
- [x] T011 [US1] Implement the guided home shell composition in app/modules/marketplace/public/home/components/marketplace-home-shell.tsx
- [x] T012 [US1] Update app/routes/marketplace/\_index.tsx to render the guided shell and objective-driven first fold for approved users

**Checkpoint**: User Story 1 delivers an MVP where the marketplace no longer feels like a raw catalog on first load.

---

## Phase 4: User Story 2 - Explorar stacks curados según el resultado que busca (Priority: P1)

**Goal**: Mostrar combinaciones curadas de apps y permitir abrir un stack dentro de la misma home sin perder orientación.

**Independent Test**: Seleccionar un objetivo en `/marketplace`, abrir un stack curado y verificar que la misma home enfoca una sección dedicada con resultado,
contexto, apps incluidas y siguiente paso.

- [x] T013 [P] [US2] Define curated stack metadata and goal-to-stack mapping in app/modules/marketplace/public/home/lib/curated-marketplace-home.config.ts
- [x] T014 [P] [US2] Implement the curated stack overview grid in app/modules/marketplace/public/home/components/curated-stack-grid.tsx
- [x] T015 [P] [US2] Implement the focused stack section in app/modules/marketplace/public/home/components/focused-stack-section.tsx
- [x] T016 [US2] Extend app/modules/marketplace/public/home/lib/build-curated-home-view-model.ts to resolve visible stacks, focused stack payloads, and safe app
      fallbacks
- [x] T017 [US2] Extend app/modules/marketplace/public/home/components/marketplace-home-shell.tsx and app/routes/marketplace/\_index.tsx to drive stack_focus
      behavior inside /marketplace

**Checkpoint**: User Story 2 makes the home feel curated and guided, not just browsable.

---

## Phase 5: User Story 3 - Navegar el catálogo completo sin perder el contexto narrativo (Priority: P2)

**Goal**: Permitir búsqueda, recuperación desde cero resultados y vuelta al catálogo completo sin romper la narrativa de descubrimiento.

**Independent Test**: Activar un objetivo, buscar dentro de él, provocar cero resultados y luego recuperar el catálogo completo mediante acciones explícitas,
manteniendo el contexto en URL al refrescar.

- [x] T018 [P] [US3] Implement the guided zero-results recovery section in app/modules/marketplace/public/home/components/discovery-empty-state.tsx
- [x] T019 [P] [US3] Update app/modules/marketplace/public/catalog/app-card.tsx to show stronger value signals and access-mode cues for guided discovery
- [x] T020 [P] [US3] Update app/modules/marketplace/public/catalog/app-grid.tsx to support guided-home framing and contextual empty states
- [x] T021 [US3] Extend app/modules/marketplace/public/home/lib/build-home-discovery-state.ts and
      app/modules/marketplace/public/home/lib/build-curated-home-view-model.ts to enforce goal-plus-search intersection and explicit recovery actions
- [x] T022 [US3] Finalize app/routes/marketplace/\_index.tsx and app/modules/marketplace/public/home/components/marketplace-home-shell.tsx to preserve goal,
      search, and stack_focus on refresh/share and remove visible pagination from the home

**Checkpoint**: User Story 3 completes the guided discovery loop while preserving access to the full catalog.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Asegurar coherencia final de interacción, mobile y validación del feature completo.

- [x] T023 [P] Review focus, anchor, and scroll recovery behavior in app/modules/marketplace/public/home/components/focused-stack-section.tsx and
      app/modules/marketplace/public/home/components/marketplace-home-shell.tsx
- [x] T024 [P] Review mobile hierarchy, copy coherence, and fallback rendering in app/modules/marketplace/public/home/lib/curated-marketplace-home.config.ts and
      app/modules/marketplace/public/catalog/app-card.tsx
- [ ] T025 Run the manual validation flow in specs/004-wow-marketplace-home/quickstart.md
- [x] T026 Run npm run typecheck
- [x] T027 Run npm run lint:strict
- [x] T028 Run npm run format:check

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion - this is the MVP slice.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and integrates most cleanly after the US1 shell exists.
- **User Story 3 (Phase 5)**: Depends on Foundational completion and should layer after the US1 shell so search/recovery logic lands on the guided home surface.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1**: No story dependency after Foundational - delivers the first meaningful wow experience.
- **US2**: Builds on the guided home surface introduced in US1, but its configuration and component work can be prepared in parallel once Foundational is
  complete.
- **US3**: Builds on the same guided home surface and should follow US1 for lower conflict; parts of catalog-context work can overlap with US2 if coordinated
  carefully.

### Within Each User Story

- Discovery config and typed helpers should be updated before route composition that depends on them.
- New UI components should land before shell composition that wires them together.
- Route orchestration should be updated after the module shell can receive typed props.
- Manual quickstart validation for the story slice should pass before moving to the next priority.

### Parallel Opportunities

- **Setup**: T002 and T003 can run in parallel once T001 defines the folder/barrel scaffold.
- **Foundational**: T004 and T005 can run in parallel because they target separate helper files.
- **US1**: T008, T009, and T010 can run in parallel; T011 and T012 depend on them.
- **US2**: T013, T014, and T015 can run in parallel; T016 and T017 depend on them.
- **US3**: T018, T019, and T020 can run in parallel; T021 and T022 depend on them.
- **Polish**: T023 and T024 can run in parallel before the final validation commands.

---

## Parallel Example: User Story 1

```bash
# Parallel metadata + component work for the MVP slice
Task: "Define hero copy and canonical goal metadata in app/modules/marketplace/public/home/lib/curated-marketplace-home.config.ts"
Task: "Implement the editorial hero in app/modules/marketplace/public/home/components/home-hero.tsx"
Task: "Implement the canonical goal selector in app/modules/marketplace/public/home/components/goal-selector.tsx"
```

## Parallel Example: User Story 2

```bash
# Parallel stack-building work once the home shell already exists
Task: "Define curated stack metadata and goal-to-stack mapping in app/modules/marketplace/public/home/lib/curated-marketplace-home.config.ts"
Task: "Implement the curated stack overview grid in app/modules/marketplace/public/home/components/curated-stack-grid.tsx"
Task: "Implement the focused stack section in app/modules/marketplace/public/home/components/focused-stack-section.tsx"
```

## Parallel Example: User Story 3

```bash
# Parallel catalog and recovery work for contextual navigation
Task: "Implement the guided zero-results recovery section in app/modules/marketplace/public/home/components/discovery-empty-state.tsx"
Task: "Update app/modules/marketplace/public/catalog/app-card.tsx to show stronger value signals and access-mode cues for guided discovery"
Task: "Update app/modules/marketplace/public/catalog/app-grid.tsx to support guided-home framing and contextual empty states"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate the wow first-load experience on `/marketplace` for an approved user.

### Incremental Delivery

1. Ship the guided hero + canonical goals (US1).
2. Add curated stacks and same-page focus behavior (US2).
3. Add contextual search, zero-result recovery, and full-catalog continuity (US3).
4. Finish with polish and repo-standard validation commands.

### Parallel Team Strategy

1. One developer can own route orchestration in app/routes/marketplace/\_index.tsx.
2. A second developer can own `app/modules/marketplace/public/home/components/` after the foundational types/helpers exist.
3. A third developer can own catalog enrichment in `app/modules/marketplace/public/catalog/` once US1 has stabilized the new shell.

---

## Notes

- No Prisma tasks are included because the approved plan explicitly avoids schema and migration changes in v1.
- No new core command-service tasks are included because discovery curation stays in UI-layer config and pure helpers.
- If the repo later gains a runnable test harness, the natural extension points for automated coverage are tests/route/marketplace-apps.test.ts and
  tests/integration/marketplace-user-journey.test.ts.
