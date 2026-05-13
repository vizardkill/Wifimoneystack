---
description: 'Task list template for feature implementation'
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/` **Prerequisites**: plan.md (required), spec.md (required for user stories), research.md,
data-model.md, contracts/

**Tests**: Route/integration tests are REQUIRED when the feature affects security, approvals, billing, uploads/downloads, or analytics. All features MUST run
`npm run typecheck`, `npm run lint:strict`, and `npm run format:check` before completion.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **SomaUp web app**: `app/routes/`, `app/components/`, `app/modules/`, `app/core/`, `app/lib/`, `prisma/`, `tests/`
- **Feature module decomposition**: `app/modules/{feature}/components/`, `app/modules/{feature}/forms/`, `app/modules/{feature}/hooks/`,
  `app/modules/{feature}/lib/`, `app/modules/{feature}/types/`
- **Core module**: `app/core/{module}/{module}.server.ts`, `app/core/{module}/db/{entity}.db.ts`, `app/core/{module}/services/_{action}-{entity}.service.ts`
- **Types/interfaces**: `app/lib/types/_{module}.types.ts`, `app/lib/types/index.ts`, `app/lib/interfaces/_{module}.interfaces.ts`,
  `app/lib/interfaces/index.ts`
- **Route tests**: `tests/route/`
- **Integration tests**: `tests/integration/`
- **Unit tests**: `tests/unit/`
- Paths MUST be adjusted to the concrete structure documented in plan.md.

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Confirm React Router, Prisma, TypeScript, aliases, and validation scripts from package/tsconfig
- [ ] T003 [P] Configure or verify linting, formatting, and Prisma generation commands

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Setup Prisma schema changes and migrations in prisma/
- [ ] T005 [P] Implement authentication, approval-state, and role enforcement boundaries
- [ ] T006 [P] Setup React Router route modules, loaders/actions, and redirect patterns
- [ ] T006a [P] Define route slimming and module extraction plan for UI-heavy routes
- [ ] T007 Create base static DB classes in app/core/[module]/db/[entity].db.ts
- [ ] T008 Create CONFIG\_\* namespaces and domain interfaces in app/lib/types and app/lib/interfaces
- [ ] T009 Configure audit/activity logging for protected user and admin actions
- [ ] T009a Configure form validation contracts (react-hook-form + zodResolver + server Zod schemas) for nontrivial forms

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Route behavior test for [route] in tests/route/[name].test.ts
- [ ] T011 [P] [US1] Integration test for [user journey] in tests/integration/[name].test.ts

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create or update Prisma model for [Entity] in prisma/schema.prisma
- [ ] T013 [P] [US1] Create domain interfaces in app/lib/interfaces/\_[module].interfaces.ts and export them
- [ ] T014 [P] [US1] Create CONFIG*\* namespace in app/lib/types/*[module].types.ts and export it
- [ ] T015 [US1] Create static DB class in app/core/[module]/db/[entity].db.ts
- [ ] T016 [US1] Implement Command service CLS*[ActionEntity] in app/core/[module]/services/*[action]-[entity].service.ts
- [ ] T017 [US1] Expose controller in app/core/[module]/[module].server.ts
- [ ] T018 [US1] Implement React Router route module in app/routes/[route].tsx using dynamic await import() of the server barrel
- [ ] T019 [US1] Add validation, blocked access handling, error states, and audit/usage event recording

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2

- [ ] T020 [P] [US2] Route behavior test for [route] in tests/route/[name].test.ts
- [ ] T021 [P] [US2] Integration test for [user journey] in tests/integration/[name].test.ts

### Implementation for User Story 2

- [ ] T022 [P] [US2] Create or update Prisma model and migration in prisma/
- [ ] T023 [US2] Implement interfaces, CONFIG\_\* namespace, DB class, Command service, and server barrel changes
- [ ] T024 [US2] Implement React Router route module in app/routes/[route].tsx using dynamic await import()
- [ ] T025 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3

- [ ] T026 [P] [US3] Route behavior test for [route] in tests/route/[name].test.ts
- [ ] T027 [P] [US3] Integration test for [user journey] in tests/integration/[name].test.ts

### Implementation for User Story 3

- [ ] T028 [P] [US3] Create or update Prisma model and migration in prisma/
- [ ] T029 [US3] Implement interfaces, CONFIG\_\* namespace, DB class, Command service, and server barrel changes
- [ ] T030 [US3] Implement React Router route module in app/routes/[route].tsx using dynamic await import()

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Access-control and audit review
- [ ] TXXX Run quickstart.md validation
- [ ] TXXX Run npm run typecheck
- [ ] TXXX Run npm run lint:strict
- [ ] TXXX Run npm run format:check

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Required tests MUST be written and FAIL before implementation
- Prisma schema/migrations before DB classes
- Interfaces and CONFIG\_\* namespaces before services
- DB classes before Command services
- Command services before `{module}.server.ts` controller exports
- Server barrels before route modules
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Independent interfaces, CONFIG\_\* namespaces, and DB classes marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together when required:
Task: "Route behavior test for [route] in tests/route/[name].test.ts"
Task: "Integration test for [user journey] in tests/integration/[name].test.ts"

# Launch independent core contract tasks together:
Task: "Create domain interfaces in app/lib/interfaces/_[module].interfaces.ts"
Task: "Create CONFIG_* namespace in app/lib/types/_[module].types.ts"
Task: "Create static DB class in app/core/[module]/db/[entity].db.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
