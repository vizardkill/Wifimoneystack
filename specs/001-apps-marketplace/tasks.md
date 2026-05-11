# Tasks: Marketplace de aplicaciones ecommerce

**Input**: Design documents from `/specs/001-apps-marketplace/` **Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Route/integration tests are REQUIRED because the feature affects approvals, auth, downloads/uploads, dashboards, and auditability. All phases MUST
end with `npm run typecheck`, `npm run lint:strict`, and `npm run format:check`.

**Organization**: Tasks are grouped by user story so each slice can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definir el sistema visual, theme base y estructura inicial de rutas/layouts para el monolito.

- [x] T001 Generar y persistir el design system base con `.github/prompts/ui-ux-pro-max/scripts/search.py` en `design-system/MASTER.md` y
      `design-system/pages/auth.md`
- [x] T002 Implementar tokens Tailwind basados en la referencia visual en `app/tailwind.css` usando charcoal `#050505`, ivory `#F8FAFC`, neon `#39FF14`, gold
      `#E8C56B`, danger `#FF3B3B`, navy `#0F172A`, heading `Playfair Display` y body `Inter`
- [x] T003 [P] Configurar el shell responsive, fonts y árbol inicial de rutas en `app/root.tsx` y `app/routes.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dejar listas las bases de datos, contratos tipados, schemas y capa core antes de tocar historias.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Crear los primeros schemas Prisma y la migración inicial del marketplace en `prisma/schema.prisma` y `prisma/migrations/`
- [x] T005 [P] Crear interfaces de dominio del marketplace en `app/lib/interfaces/_marketplace.interfaces.ts` y exportarlas desde `app/lib/interfaces/index.ts`
- [x] T006 [P] Crear namespaces `CONFIG_*` del marketplace en `app/lib/types/_marketplace.types.ts` y exportarlos desde `app/lib/types/index.ts`
- [x] T007 [P] Crear schemas Zod y mapeos de formularios para auth, apps y decisiones admin en `app/lib/schemas/marketplace.schema.ts`
- [x] T008 [P] Implementar DB classes base para solicitudes y catalogo en `app/core/marketplace/db/access-request.db.ts`,
      `app/core/marketplace/db/marketplace-app.db.ts` y `app/core/marketplace/db/marketplace-audit-event.db.ts`
- [x] T009 [P] Implementar DB classes base para media, artefactos y uso en `app/core/marketplace/db/app-media.db.ts`,
      `app/core/marketplace/db/app-artifact.db.ts` y `app/core/marketplace/db/app-usage-event.db.ts`
- [x] T010 Crear helper de auditoria, helper de acceso y barrel publico del modulo en `app/lib/helpers/_marketplace-audit.helper.ts`,
      `app/lib/helpers/_marketplace-access.helper.ts` y `app/core/marketplace/marketplace.server.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Solicitar acceso y consultar estado (Priority: P1)

**Goal**: Entregar el onboarding visual responsive con login/signup, opcion de Google y pantalla de estado de aprobacion.

**Independent Test**: Un usuario nuevo puede registrarse por email o elegir Google, queda en `PENDING`, y al entrar ve su estado sin acceder al marketplace
hasta ser aprobado.

### Tests for User Story 1

- [x] T011 [P] [US1] Crear test de rutas para signup, login, Google CTA y estado bloqueado en `tests/route/marketplace-auth-access.test.ts`
- [x] T012 [P] [US1] Crear test de integracion para onboarding y consulta de estado en `tests/integration/marketplace-auth-onboarding.test.ts`

### Implementation for User Story 1

- [x] T013 [P] [US1] Crear shell y formularios auth con apoyo de Magic MCP en `app/modules/auth/auth-shell.tsx` y `app/modules/auth/auth-form.tsx`
- [x] T014 [P] [US1] Implementar rutas responsive de login y signup con CTA de Google en `app/routes/auth/login.tsx` y `app/routes/auth/signup.tsx`
- [x] T015 [P] [US1] Implementar pantalla de estado de acceso en `app/routes/auth/access-status.tsx`
- [x] T016 [US1] Implementar `CLS_RequestMarketplaceAccess` y `CLS_GetMarketplaceAccessStatus` en `app/core/marketplace/services/_request-access.service.ts` y
      `app/core/marketplace/services/_get-access-status.service.ts`
- [x] T017 [US1] Exponer controladores de solicitud y consulta de estado en `app/core/marketplace/marketplace.server.ts`
- [x] T018 [US1] Conectar layout auth y redirecciones de acceso bloqueado en `app/routes/auth/_layout.tsx` y `app/routes/marketplace/_layout.tsx`
- [x] T019 [US1] Implementar rutas OAuth de Google para el flujo auth en `app/routes/api/v1/auth/oauth.google.ts` y
      `app/routes/api/v1/auth/oauth.google.callback.ts`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Explorar y usar aplicaciones aprobadas (Priority: P1)

**Goal**: Entregar la vitrina responsive, el detalle tipo marketplace y las acciones de usar/descargar para usuarios aprobados.

**Independent Test**: Con un usuario aprobado y apps activas, la vitrina lista apps, el detalle muestra media e instrucciones, y las acciones `use` y `download`
registran eventos correctamente.

### Tests for User Story 2

- [x] T020 [P] [US2] Crear test de rutas para listado, detalle, `use` y `download` en `tests/route/marketplace-apps.test.ts`
- [x] T021 [P] [US2] Crear test de integracion para el journey de usuario aprobado en `tests/integration/marketplace-user-journey.test.ts`

### Implementation for User Story 2

- [x] T022 [P] [US2] Crear modulos visuales del marketplace con apoyo de Magic MCP en `app/modules/marketplace/app-grid.tsx`,
      `app/modules/marketplace/app-card.tsx` y `app/modules/marketplace/app-detail.tsx`
- [x] T023 [P] [US2] Implementar rutas de vitrina y detalle en `app/routes/marketplace/_index.tsx` y `app/routes/marketplace/apps/$appId.tsx`
- [x] T024 [P] [US2] Implementar rutas de accion para usar y descargar apps en `app/routes/marketplace/apps/$appId.use.ts` y
      `app/routes/marketplace/apps/$appId.download.ts`
- [x] T025 [US2] Implementar `CLS_ListPublishedMarketplaceApps`, `CLS_GetMarketplaceApp`, `CLS_RecordMarketplaceAppUse` y `CLS_RecordMarketplaceAppDownload` en
      `app/core/marketplace/services/_list-published-apps.service.ts`, `app/core/marketplace/services/_get-marketplace-app.service.ts`,
      `app/core/marketplace/services/_record-app-use.service.ts` y `app/core/marketplace/services/_record-app-download.service.ts`
- [x] T026 [US2] Exponer controladores de lista, detalle, uso y descarga en `app/core/marketplace/marketplace.server.ts`
- [x] T027 [US2] Integrar estados vacios, disponibilidad de media/artefactos y tracking de eventos en `app/routes/marketplace/_layout.tsx` y
      `app/modules/marketplace/app-detail.tsx`
- [x] T028 [US2] Ajustar la composicion visual de vitrina y detalle al design system persistido en `design-system/MASTER.md` y
      `design-system/pages/marketplace.md`

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Gestionar aprobaciones de usuarios (Priority: P2)

**Goal**: Permitir que un admin liste solicitudes y tome decisiones de aprobar, rechazar o revocar con trazabilidad.

**Independent Test**: Un admin puede entrar al panel de usuarios, filtrar por estado, aprobar/rechazar/revocar y el usuario afectado ve el cambio en su
siguiente ingreso.

### Tests for User Story 3

- [x] T029 [P] [US3] Crear test de rutas para decisiones admin de acceso en `tests/route/marketplace-admin-users.test.ts`
- [x] T030 [P] [US3] Crear test de integracion para aprobar, rechazar y revocar accesos en `tests/integration/marketplace-admin-access.test.ts`

### Implementation for User Story 3

- [x] T031 [P] [US3] Crear tabla, filtros y dialogo de decision del panel de accesos en `app/modules/marketplace/admin-access-table.tsx` y
      `app/modules/marketplace/access-decision-dialog.tsx`
- [x] T032 [P] [US3] Implementar la ruta admin de gestion de usuarios en `app/routes/dashboard/marketplace/users.tsx`
- [x] T033 [US3] Implementar `CLS_ListMarketplaceAccessRequests`, `CLS_DecideMarketplaceAccessRequest` y `CLS_RevokeMarketplaceAccess` en
      `app/core/marketplace/services/_list-access-requests.service.ts`, `app/core/marketplace/services/_decide-access-request.service.ts` y
      `app/core/marketplace/services/_revoke-access.service.ts`
- [x] T034 [US3] Exponer controladores admin de accesos en `app/core/marketplace/marketplace.server.ts`
- [x] T035 [US3] Integrar razones de auditoria, server-side role checks y badges de estado en `app/routes/dashboard/marketplace/users.tsx` y
      `app/lib/helpers/_marketplace-audit.helper.ts`

**Checkpoint**: User Stories 1, 2 and 3 are independently functional.

---

## Phase 6: User Story 4 - Administrar la vitrina de aplicaciones (Priority: P2)

**Goal**: Permitir al admin crear, editar, activar y desactivar fichas de apps con media y artefactos/enlaces.

**Independent Test**: Un admin puede crear una app en borrador, cargar media, enlazar una web o registrar un ZIP, activarla y luego ocultarla sin perder
historial.

### Tests for User Story 4

- [x] T036 [P] [US4] Crear test de rutas para crear, editar y publicar apps en `tests/route/marketplace-admin-apps.test.ts`
- [x] T037 [P] [US4] Crear test de integracion para el flujo de catalogo admin en `tests/integration/marketplace-admin-apps.test.ts`

### Implementation for User Story 4

- [x] T038 [P] [US4] Crear formulario admin, gestor de media y panel de artefacto/enlace en `app/modules/marketplace/app-form.tsx`,
      `app/modules/marketplace/media-gallery-manager.tsx` y `app/modules/marketplace/artifact-panel.tsx`
- [x] T039 [P] [US4] Implementar rutas admin del catalogo en `app/routes/dashboard/marketplace/apps.tsx`, `app/routes/dashboard/marketplace/apps/new.tsx` y
      `app/routes/dashboard/marketplace/apps/$appId.edit.tsx`
- [x] T040 [US4] Implementar `CLS_UpsertMarketplaceApp` y `CLS_UpdateMarketplaceAppPublication` en
      `app/core/marketplace/services/_upsert-marketplace-app.service.ts` y `app/core/marketplace/services/_update-app-publication.service.ts`
- [x] T041 [US4] Exponer controladores del catalogo y validacion de publicacion en `app/core/marketplace/marketplace.server.ts`
- [x] T042 [US4] Integrar reglas de icono, screenshots, video opcional, enlace web y ZIP activo en `app/modules/marketplace/app-form.tsx` y
      `app/routes/dashboard/marketplace/apps/$appId.edit.tsx`

**Checkpoint**: User Stories 1 through 4 are independently functional.

---

## Phase 7: User Story 5 - Consultar tableros administrativos y uso (Priority: P3)

**Goal**: Entregar dashboard admin con conteos por estado, apps mas usadas, apps sin actividad y graficas base.

**Independent Test**: Con datos sembrados de registros, aprobaciones, usos y descargas, el dashboard muestra conteos y tendencias coherentes sin calculos
manuales.

### Tests for User Story 5

- [x] T043 [P] [US5] Crear test de rutas para agregados del dashboard en `tests/route/marketplace-dashboard.test.ts`
- [x] T044 [P] [US5] Crear test de integracion para metricas y estados vacios del dashboard en `tests/integration/marketplace-dashboard.test.ts`

### Implementation for User Story 5

- [x] T045 [P] [US5] Crear KPIs, charts y panel de baja actividad en `app/modules/marketplace/dashboard-kpis.tsx`,
      `app/modules/marketplace/dashboard-charts.tsx` y `app/modules/marketplace/no-activity-panel.tsx`
- [x] T046 [P] [US5] Implementar la ruta principal del dashboard marketplace en `app/routes/dashboard/marketplace/_index.tsx`
- [x] T047 [US5] Implementar `CLS_GetMarketplaceDashboard` en `app/core/marketplace/services/_get-marketplace-dashboard.service.ts`
- [x] T048 [US5] Exponer el controlador dashboard y los queries agregados necesarios en `app/core/marketplace/marketplace.server.ts` y
      `app/core/marketplace/db/app-usage-event.db.ts`

**Checkpoint**: All user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar documentacion, consistencia visual, accesibilidad y validacion completa.

- [x] T049 [P] Documentar el modelo de negocio del marketplace en espanol para negocio en `docs/modelo-negocio-marketplace.md`
- [x] T050 [P] Documentar el modelo relacional y flujos de base de datos en espanol en `docs/base-de-datos-marketplace.md`
- [x] T051 [P] Enlazar la documentacion del marketplace en `docs/_sidebar.md` y `docs/README.md`
- [x] T052 [P] Persistir overrides finales del design system para auth y marketplace en `design-system/pages/auth.md` y `design-system/pages/marketplace.md`
- [x] T053 Revisar responsive, accesibilidad, control de acceso y auditoria en `app/routes/`, `app/modules/auth/` y `app/modules/marketplace/`
- [x] T054 Ejecutar la validacion manual descrita en `specs/001-apps-marketplace/quickstart.md`
- [x] T055 Ejecutar `npm run typecheck`
- [x] T056 Ejecutar `npm run lint:strict`
- [x] T057 Ejecutar `npm run format:check`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phases 3-7)**: Depend on Foundational completion.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational - no dependency on other stories.
- **User Story 2 (P1)**: Starts after Foundational and can be validated with seeded approved users from US1 flows.
- **User Story 3 (P2)**: Starts after Foundational - independent admin queue and decision logic.
- **User Story 4 (P2)**: Starts after Foundational - independent app catalog flow.
- **User Story 5 (P3)**: Starts after Foundational but gains meaningful validation after US3 and US4 produce audit and usage data.

### Within Each User Story

- Tests MUST be written and fail before implementation.
- Prisma schema/migrations before DB classes.
- Interfaces and `CONFIG_*` namespaces before services.
- DB classes before Command services.
- Command services before `marketplace.server.ts` exports.
- Server barrels before route modules.
- Story UI should consume the design-system artifacts created in Phase 1.

### Parallel Opportunities

- T002 and T003 can run in parallel after T001.
- T005, T006, T007, T008 and T009 can run in parallel after T004.
- US1 UI tasks T013, T014 and T015 can run in parallel.
- US2 UI tasks T022, T023 and T024 can run in parallel.
- US3 UI tasks T031 and T032 can run in parallel.
- US4 UI tasks T038 and T039 can run in parallel.
- US5 UI tasks T045 and T046 can run in parallel.
- Polish tasks T049, T050, T051 and T052 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch tests for User Story 1 together:
Task: "Crear test de rutas para signup, login, Google CTA y estado bloqueado en tests/route/marketplace-auth-access.test.ts"
Task: "Crear test de integracion para onboarding y consulta de estado en tests/integration/marketplace-auth-onboarding.test.ts"

# Launch independent UI tasks together:
Task: "Crear shell y formularios auth en app/modules/auth/auth-shell.tsx y app/modules/auth/auth-form.tsx"
Task: "Implementar rutas de login y signup en app/routes/auth/login.tsx y app/routes/auth/signup.tsx"
Task: "Implementar pantalla de estado de acceso en app/routes/auth/access-status.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate login/signup/Google/status independently.
5. Complete Phase 4: User Story 2 to unlock the first end-to-end marketplace MVP.

### Incremental Delivery

1. Setup + Foundational establish the monolith structure, Tailwind system and first Prisma schemas.
2. US1 delivers onboarding and approval-state control.
3. US2 delivers the first approved-user marketplace experience.
4. US3 and US4 unlock internal operations.
5. US5 closes the admin visibility loop with dashboards.
6. Phase 8 leaves the feature documented for negocio and technically validated.

### Parallel Team Strategy

1. One developer owns Phase 1 and Phase 2.
2. After Foundational:
   - Developer A: US1 auth and approval state.
   - Developer B: US2 marketplace vitrina and detail.
   - Developer C: US3 admin approvals.
3. US4 and US5 start once catalog entities and usage events are stable.
