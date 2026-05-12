# Tasks: Panel administrativo del marketplace

**Input**: Design documents from `/specs/002-admin-marketplace-console/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Route/integration tests are REQUIRED because this feature affects security roles, approval decisions, concurrency control, auditability, and admin
analytics. All phases MUST end with `npm run typecheck`, `npm run lint:strict`, and `npm run format:check`.

**Organization**: Tasks are grouped by user story to allow independent implementation and validation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dejar lista la base mínima de rutas y archivos nuevos para el módulo admin console 002.

- [x] T001 Registrar la ruta base del módulo administradores en `app/routes.ts`
- [x] T002 [P] Crear archivo base de la nueva ruta admin en `app/routes/dashboard/marketplace/admins.tsx`
- [x] T003 [P] Crear esqueletos de pruebas nuevas para admin console en `tests/route/marketplace-admin-admins.test.ts` y
      `tests/integration/marketplace-admin-console.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Resolver cambios transversales de datos, roles y contratos que bloquean todas las historias.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Actualizar enums `Role` y `MarketplaceAuditAction` para incluir `SUPERADMIN` y `ADMIN_PROMOTED` en `prisma/schema.prisma`
- [x] T005 Generar y versionar migración Prisma de enums e índices en `prisma/migrations/`
- [x] T006 [P] Extender contratos de rol para incluir `SUPERADMIN` en `app/lib/interfaces/_auth.interfaces.ts`
- [x] T007 [P] Extender `CONFIG_*` para conflicto de decisiones y variación de 7 días en `app/lib/types/_marketplace.types.ts`
- [x] T008 [P] Implementar actualización condicional first-write-wins en `app/core/marketplace/db/access-request.db.ts`
- [x] T009 [P] Implementar agregados de auditoría por ventana de 7 días en `app/core/marketplace/db/marketplace-audit-event.db.ts`
- [x] T010 [P] Implementar listados y promoción por email de usuarios admin en `app/core/auth/db/user.db.ts`
- [x] T011 Implementar servicio de promoción administrativa en `app/core/auth/services/_promote-admin-user.service.ts`
- [x] T012 Exponer controladores de listado/promoción admin en `app/core/auth/auth.server.ts`
- [x] T013 Ajustar validaciones de acceso para permitir `ADMIN` o `SUPERADMIN` en `app/routes/dashboard/_layout.tsx`,
      `app/routes/dashboard/marketplace/_index.tsx`, `app/routes/dashboard/marketplace/users.tsx`, `app/routes/dashboard/marketplace/apps.tsx`,
      `app/routes/dashboard/marketplace/apps/new.tsx` y `app/routes/dashboard/marketplace/apps/$appId.edit.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Navegar panel con menú lateral y dashboard (Priority: P1) 🎯 MVP

**Goal**: Entregar shell admin con navegación lateral estable y dashboard con métricas actuales + variación de 7 días.

**Independent Test**: Un admin autenticado entra al panel, ve los 4 módulos en sidebar y consulta dashboard con conteos actuales y variaciones de 7 días.

### Tests for User Story 1

- [x] T014 [P] [US1] Actualizar pruebas de dashboard para validar KPIs actuales y variación 7 días en `tests/route/marketplace-dashboard.test.ts`
- [x] T015 [P] [US1] Implementar prueba de integración de navegación lateral y módulo activo en `tests/integration/marketplace-admin-console.test.ts`

### Implementation for User Story 1

- [x] T016 [P] [US1] Extender servicio de dashboard para responder métricas actuales y variación 7 días en
      `app/core/marketplace/services/_get-marketplace-dashboard.service.ts`
- [x] T017 [US1] Actualizar loader y render del dashboard admin para mostrar bloques de variación 7 días en `app/routes/dashboard/marketplace/_index.tsx`
- [x] T018 [US1] Añadir navegación lateral completa con módulo Administradores en `app/routes/dashboard/_layout.tsx`
- [x] T019 [US1] Ajustar componentes visuales del dashboard para estados vacíos y datos de variación en `app/modules/marketplace/dashboard-kpis.tsx` y
      `app/modules/marketplace/no-activity-panel.tsx`
- [x] T020 [US1] Ajustar contrato de respuesta del dashboard en `app/lib/types/_marketplace.types.ts`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Gestionar usuarios y decisiones de acceso (Priority: P1)

**Goal**: Permitir aprobar, rechazar y revocar con regla first-write-wins y feedback de conflicto por datos stale.

**Independent Test**: Desde el módulo usuarios, un admin toma decisiones válidas y un segundo admin con vista stale recibe conflicto y debe refrescar.

### Tests for User Story 2

- [x] T021 [P] [US2] Actualizar pruebas de decisiones admin incluyendo conflicto por concurrencia en `tests/route/marketplace-admin-users.test.ts`
- [x] T022 [P] [US2] Crear prueba de integración de first-write-wins con doble sesión admin en `tests/integration/marketplace-admin-user-decisions.test.ts`

### Implementation for User Story 2

- [x] T023 [US2] Incluir `updated_at` o token de estaleness en respuestas de listado de solicitudes en
      `app/core/marketplace/services/_list-access-requests.service.ts`
- [x] T024 [US2] Aplicar validación de conflicto en decisiones approve/reject en `app/core/marketplace/services/_decide-access-request.service.ts`
- [x] T025 [US2] Aplicar validación de conflicto en revocación en `app/core/marketplace/services/_revoke-access.service.ts`
- [x] T026 [US2] Enviar token de estaleness desde formularios y manejar mensajes de conflicto en `app/routes/dashboard/marketplace/users.tsx`
- [x] T027 [US2] Ajustar payloads y estados de respuesta de decisiones con conflicto en `app/lib/types/_marketplace.types.ts`

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Administrar apps de vitrina (Priority: P2)

**Goal**: Habilitar CRUD básico de ficha (`name`, `summary`, `status`) más publicar/despublicar dentro del módulo Apps.

**Independent Test**: Un admin crea y edita ficha básica de app, luego publica/despublica y ve el cambio reflejado en disponibilidad.

### Tests for User Story 3

- [x] T028 [P] [US3] Actualizar pruebas de catálogo básico y publicación en `tests/route/marketplace-admin-apps.test.ts`
- [x] T029 [P] [US3] Crear prueba de integración para creación/edición/publicación básica de apps en `tests/integration/marketplace-admin-apps-console.test.ts`

### Implementation for User Story 3

- [x] T030 [US3] Implementar validación de campos básicos requeridos (`name`, `summary`) en `app/core/marketplace/services/_upsert-marketplace-app.service.ts`
- [x] T031 [US3] Ajustar persistencia de ficha básica y estado operativo en `app/core/marketplace/db/marketplace-app.db.ts`
- [x] T032 [US3] Ajustar formulario de creación a alcance básico del feature en `app/routes/dashboard/marketplace/apps/new.tsx`
- [x] T033 [US3] Ajustar formulario de edición a alcance básico del feature en `app/routes/dashboard/marketplace/apps/$appId.edit.tsx`
- [x] T034 [US3] Ajustar listado y acciones de publish/unpublish del catálogo admin en `app/routes/dashboard/marketplace/apps.tsx`

**Checkpoint**: User Stories 1, 2 and 3 are independently functional.

---

## Phase 6: User Story 4 - Agregar nuevos administradores (Priority: P2)

**Goal**: Permitir que solo superadmin promueva por email cuentas existentes a admin y registrar auditoría `ADMIN_PROMOTED`.

**Independent Test**: Un superadmin lista cuentas admin, promueve por email una cuenta existente y el sistema bloquea duplicados o no elegibles.

### Tests for User Story 4

- [x] T035 [P] [US4] Implementar pruebas de ruta para módulo administradores y promoción por email en `tests/route/marketplace-admin-admins.test.ts`
- [x] T036 [P] [US4] Implementar prueba de integración de promoción superadmin y bloqueo de duplicados en `tests/integration/marketplace-admin-admins.test.ts`

### Implementation for User Story 4

- [x] T037 [US4] Implementar loader/action superadmin-only para módulo administradores en `app/routes/dashboard/marketplace/admins.tsx`
- [x] T038 [US4] Conectar la nueva ruta de administradores en `app/routes.ts` y navegación final en `app/routes/dashboard/_layout.tsx`
- [x] T039 [US4] Implementar lógica de promoción por email y validación de elegibilidad en `app/core/auth/services/_promote-admin-user.service.ts`
- [x] T040 [US4] Consumir controladores de auth para listar/promover admins en `app/routes/dashboard/marketplace/admins.tsx`
- [x] T041 [US4] Registrar evento de auditoría `ADMIN_PROMOTED` en `app/lib/helpers/_marketplace-audit.helper.ts` y
      `app/core/marketplace/db/marketplace-audit-event.db.ts`
- [x] T042 [US4] Ajustar contratos de tipos para respuestas de módulo administradores en `app/lib/types/_marketplace.types.ts` y
      `app/lib/interfaces/_auth.interfaces.ts`

**Checkpoint**: All user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar validación integral, documentación y calidad transversal.

- [x] T043 [P] Actualizar guía operativa del flujo admin en `specs/002-admin-marketplace-console/quickstart.md`
- [x] T044 [P] Documentar comportamiento de superadmin y módulo administradores en `docs/como-funciona-el-sistema.md`
- [x] T045 [P] Documentar métricas actuales + variación 7 días en `docs/modelo-negocio-marketplace.md`
- [x] T046 Ejecutar validación manual completa de quickstart en `specs/002-admin-marketplace-console/quickstart.md`
- [x] T047 Ejecutar `npm run typecheck` desde `package.json`
- [x] T048 Ejecutar `npm run lint:strict` y `npm run format:check` desde `package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phases 3-6)**: Depend on Foundational completion.
- **Polish (Phase 7)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational and delivers MVP admin shell + dashboard.
- **User Story 2 (P1)**: Starts after Foundational; can run in paralelo con US1 backend, pero depende del shell admin para validación UI completa.
- **User Story 3 (P2)**: Starts after Foundational; no dependencia funcional dura con US2.
- **User Story 4 (P2)**: Starts after Foundational y depende de cambios de rol/auditoría de Phase 2.

### Within Each User Story

- Tests MUST be created first and fail before implementation.
- Prisma schema/migrations before DB classes/services that use new enums.
- Interfaces and `CONFIG_*` namespaces before services and route actions.
- DB classes before command services.
- Command services before route modules that consume them.
- Route loader/action wiring before UI polish.

### Parallel Opportunities

- T002 y T003 pueden ejecutarse en paralelo después de T001.
- T006, T007, T008, T009 y T010 pueden ejecutarse en paralelo después de T005.
- En US1, T014 y T015 pueden ejecutarse en paralelo.
- En US2, T021 y T022 pueden ejecutarse en paralelo.
- En US3, T028 y T029 pueden ejecutarse en paralelo.
- En US4, T035 y T036 pueden ejecutarse en paralelo.
- En Polish, T043, T044 y T045 pueden ejecutarse en paralelo.

---

## Parallel Example: User Story 4

```bash
# Launch tests for User Story 4 together:
Task: "Implementar pruebas de ruta para módulo administradores y promoción por email en tests/route/marketplace-admin-admins.test.ts"
Task: "Implementar prueba de integración de promoción superadmin y bloqueo de duplicados en tests/integration/marketplace-admin-admins.test.ts"

# Launch core and route work in parallel once tests exist:
Task: "Implementar lógica de promoción por email en app/core/auth/services/_promote-admin-user.service.ts"
Task: "Implementar loader/action superadmin-only en app/routes/dashboard/marketplace/admins.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate User Story 1 independently with route/integration tests.
5. Demo and baseline release before expanding scope.

### Incremental Delivery

1. Setup + Foundational.
2. Deliver US1 (admin shell + dashboard metrics).
3. Deliver US2 (user decisions + first-write-wins).
4. Deliver US3 (apps basic CRUD + publication).
5. Deliver US4 (superadmin promotions).
6. Finish with Polish + quality gates.

### Parallel Team Strategy

1. Team aligns on Phase 1 and Phase 2.
2. After foundational checkpoint:
   - Developer A: US1 dashboard + sidebar.
   - Developer B: US2 users + conflict control.
   - Developer C: US3 apps basic flows.
   - Developer D: US4 superadmin promotions.
3. Merge by story checkpoints, then run Phase 7 quality gates.
