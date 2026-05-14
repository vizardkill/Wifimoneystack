# Tasks: Authoring avanzado de vitrinas de apps

**Input**: Design documents from `/specs/003-admin-listing-authoring/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Tests**: Omitidos en este desglose por indicación del usuario; se mantiene validación manual y comandos de calidad al cierre.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar utilidades y contratos compartidos antes de tocar persistencia y flujos.

- [x] T001 Add a dedicated marketplace storefront upload folder and proxy-safe helper support in app/lib/services/\_storage.service.ts
- [x] T002 [P] Extend storefront draft, media, publication, and language selection schemas in app/lib/schemas/marketplace.schema.ts
- [x] T003 [P] Expand storefront domain interfaces and CONFIG namespaces in app/lib/interfaces/\_marketplace.interfaces.ts and
      app/lib/types/\_marketplace.types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persistencia, catálogos y auditoría que bloquean cualquier historia de usuario.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Update storefront enums, models, joins, and seed migration files in prisma/schema.prisma and prisma/migrations/
- [x] T005 [P] Implement storefront version and language catalog DB classes in app/core/marketplace/db/app-storefront-version.db.ts,
      app/core/marketplace/db/app-storefront-version-language.db.ts, app/core/marketplace/db/app-storefront-version-media.db.ts, and
      app/core/marketplace/db/language-catalog.db.ts
- [x] T006 [P] Update existing app and media DB helpers for storefront fallback, readiness checks, and external video URLs in
      app/core/marketplace/db/marketplace-app.db.ts and app/core/marketplace/db/app-media.db.ts
- [x] T007 [P] Extend storefront audit action handling in app/lib/helpers/\_marketplace-audit.helper.ts and
      app/core/marketplace/db/marketplace-audit-event.db.ts

**Checkpoint**: Foundation ready - storefront authoring work can begin

---

## Phase 3: User Story 1 - Cargar una ficha comercial completa de la app (Priority: P1) 🎯

**Goal**: Permitir al admin cargar, guardar y reabrir un borrador completo de vitrina con contenido, idiomas y media.

**Independent Test**: Abrir una app en `/dashboard/marketplace/apps/:appId/edit`, cargar contenido parcial o completo, guardar, recargar la página y verificar
que el borrador mantiene bloques, idiomas y media seleccionada.

### Implementation for User Story 1

- [x] T008 [P] [US1] Implement the authoring snapshot loader service in app/core/marketplace/services/\_get-marketplace-app-authoring.service.ts and
      app/core/marketplace/marketplace.server.ts
- [x] T009 [P] [US1] Implement storefront draft save and language membership replacement in app/core/marketplace/services/\_save-storefront-draft.service.ts
- [x] T010 [P] [US1] Implement media upload preparation and asset registration services in app/core/marketplace/services/\_prepare-app-media-upload.service.ts
      and app/core/marketplace/services/\_register-app-media.service.ts
- [x] T011 [P] [US1] Implement draft media removal and ordering services in app/core/marketplace/services/\_remove-app-media.service.ts and
      app/core/marketplace/services/\_reorder-storefront-media.service.ts
- [x] T012 [P] [US1] Create the storefront authoring UI blocks in app/modules/marketplace/storefront-authoring-form.tsx,
      app/modules/marketplace/language-multi-select.tsx, and app/modules/marketplace/storefront-readiness-panel.tsx
- [x] T013 [P] [US1] Adapt media editing for storefront icon, screenshot, and external video flows in app/modules/marketplace/media-gallery-manager.tsx
- [x] T014 [US1] Expand admin app edit loader and action intents for save_basic, save_storefront_draft, prepare_media_upload, register_media, remove_media, and
      reorder_media in app/routes/dashboard/marketplace/apps/$appId.edit.tsx
- [x] T015 [US1] Integrate the sectioned authoring workspace and exports in app/routes/dashboard/marketplace/apps/$appId.edit.tsx and
      app/modules/marketplace/index.ts

**Checkpoint**: User Story 1 should allow saving and reopening storefront drafts independently

---

## Phase 4: User Story 2 - Previsualizar y validar la vitrina antes de exponerla (Priority: P1)

**Goal**: Permitir preview, validación de readiness y publicación explícita sin romper la versión pública vigente.

**Independent Test**: Con una app ya creada, guardar un borrador incompleto y verificar bloqueos de publicación; luego completar mínimos obligatorios,
previsualizar y publicar sin alterar la versión pública anterior hasta la confirmación.

### Implementation for User Story 2

- [x] T016 [P] [US2] Implement the storefront publication command that replaces only the published snapshot in
      app/core/marketplace/services/\_publish-storefront.service.ts and app/core/marketplace/marketplace.server.ts
- [x] T017 [P] [US2] Create the storefront preview component and preview exports in app/modules/marketplace/storefront-preview.tsx and
      app/modules/marketplace/index.ts
- [x] T018 [US2] Add publish_storefront intent, readiness validation feedback, and draft-versus-published messaging in
      app/routes/dashboard/marketplace/apps/$appId.edit.tsx
- [x] T019 [US2] Wire preview rendering and publish controls into the authoring workspace in app/routes/dashboard/marketplace/apps/$appId.edit.tsx and
      app/modules/marketplace/storefront-readiness-panel.tsx

**Checkpoint**: User Story 2 should safely preview and publish a ready storefront without mutating the active public version during draft edits

---

## Phase 5: User Story 3 - Consultar una vitrina enriquecida desde el marketplace (Priority: P2)

**Goal**: Mostrar la vitrina enriquecida al usuario aprobado y mantener el fallback legacy para apps aún no publicadas.

**Independent Test**: Abrir una app con storefront publicado y confirmar render enriquecido; abrir otra app activa sin storefront publicado y confirmar que se
mantiene el detalle legacy actual.

### Implementation for User Story 3

- [x] T020 [P] [US3] Extend the public app detail service to resolve presentation_mode and storefront payloads in
      app/core/marketplace/services/\_get-marketplace-app.service.ts and app/core/marketplace/marketplace.server.ts
- [x] T021 [P] [US3] Update public storefront rendering for developer, languages, support, ordered media, and optional video in
      app/modules/marketplace/app-detail.tsx
- [x] T022 [US3] Update the public app detail route to consume storefront-versus-legacy responses safely in app/routes/marketplace/apps/$appId.tsx

**Checkpoint**: All user stories should now work with enriched storefront rendering and legacy fallback

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cierre operativo, documentación y validación final.

- [x] T023 [P] Update storefront authoring and publication docs in docs/como-funciona-el-sistema.md and docs/modelo-negocio-marketplace.md
- [x] T024 Review storefront access-control and audit coverage in app/routes/dashboard/marketplace/apps/$appId.edit.tsx, app/routes/marketplace/apps/$appId.tsx,
      and app/lib/helpers/\_marketplace-audit.helper.ts
- [ ] T025 Run manual validation from specs/003-admin-listing-authoring/quickstart.md
- [x] T026 Run npm run typecheck in /root/proyectos/marketplace-ecommerce
- [x] T027 Run npm run lint:strict in /root/proyectos/marketplace-ecommerce
- [x] T028 Run npm run format:check in /root/proyectos/marketplace-ecommerce

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 because preview/publication operates on the storefront draft created there
- **User Story 3 (Phase 5)**: Depends on User Story 2 because public rendering consumes the published storefront contract
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: First deliverable slice after foundation; no dependency on later stories
- **User Story 2 (P1)**: Requires the authoring draft workflow from User Story 1
- **User Story 3 (P2)**: Requires published storefront data from User Story 2

### Within Each User Story

- Shared schemas, interfaces, Prisma models, and DB classes must land before route/service orchestration
- Core services must be implemented before route actions/loaders consume them
- Admin route integration should happen after the new UI modules are available
- Public rendering should only switch to storefront mode after the published storefront contract is stable

### Parallel Opportunities

- `T002` and `T003` can run in parallel after `T001`
- `T005`, `T006`, and `T007` can run in parallel after `T004`
- `T008`, `T009`, `T010`, `T011`, `T012`, and `T013` can run in parallel after Foundation completes
- `T016` and `T017` can run in parallel after User Story 1 is complete
- `T020` and `T021` can run in parallel after User Story 2 is complete

---

## Parallel Example: User Story 1

```bash
Task: "Implement the authoring snapshot loader service in app/core/marketplace/services/_get-marketplace-app-authoring.service.ts and app/core/marketplace/marketplace.server.ts"
Task: "Implement storefront draft save and language membership replacement in app/core/marketplace/services/_save-storefront-draft.service.ts"
Task: "Create the storefront authoring UI blocks in app/modules/marketplace/storefront-authoring-form.tsx, app/modules/marketplace/language-multi-select.tsx, and app/modules/marketplace/storefront-readiness-panel.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Implement the storefront publication command that replaces only the published snapshot in app/core/marketplace/services/_publish-storefront.service.ts and app/core/marketplace/marketplace.server.ts"
Task: "Create the storefront preview component and preview exports in app/modules/marketplace/storefront-preview.tsx and app/modules/marketplace/index.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Extend the public app detail service to resolve presentation_mode and storefront payloads in app/core/marketplace/services/_get-marketplace-app.service.ts and app/core/marketplace/marketplace.server.ts"
Task: "Update public storefront rendering for developer, languages, support, ordered media, and optional video in app/modules/marketplace/app-detail.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 and 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Complete Phase 4: User Story 2
5. **STOP and VALIDATE**: Confirm admins can author, preview, and publish a storefront safely before exposing public rendering work

### Incremental Delivery

1. Complete Setup + Foundational → data and service foundation ready
2. Add User Story 1 → Validate draft authoring flow
3. Add User Story 2 → Validate preview and publish flow
4. Add User Story 3 → Validate public enriched storefront with legacy fallback
5. Finish Polish phase and quality commands

### Parallel Team Strategy

1. One developer handles Prisma and DB foundations while another advances shared schemas/types after Phase 1
2. Once Foundation is complete:
   - Developer A: core authoring services
   - Developer B: admin authoring UI modules
3. After User Story 1 is stable:
   - Developer A: publication flow
   - Developer B: preview UX
4. After User Story 2 is stable:
   - Developer A: public detail service contract
   - Developer B: public storefront rendering updates

---

## Notes

- All tasks follow the required checklist format `- [ ] T### [P] [US#] Description with file path`
- `[P]` marks tasks that can proceed on different files without waiting for another incomplete task in the same phase
- Tests were intentionally omitted from this task list by user request
- Suggested MVP scope: User Stories 1 and 2
