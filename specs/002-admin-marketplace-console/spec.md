# Feature Specification: Panel administrativo del marketplace

**Feature Branch**: `[002-apps-marketplace]`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "bien ahora necesito generar una visual para el admin la idea es que al entrar tengamos un menu lateral, en donde tengamos el
dashboard para ver metricas; tengamos un modulo de usuarios para aprobar o rechazar usuarios y ver detalles; un modulo para administrar las apps que estan en la
vitrina; y un modulo para agregar nuevos administradores"

## Clarifications

### Session 2026-05-11

- Q: Como se debe dar de alta un nuevo administrador? → A: Promover una cuenta existente por email, solo por un superadmin.
- Q: Cual es el alcance exacto de decisiones en el modulo de usuarios? → A: Aprobar o rechazar pendientes, y revocar usuarios aprobados.
- Q: Cual es el alcance del modulo de Apps en esta feature? → A: Listar, ver detalle, crear y editar ficha basica (nombre, resumen, estado), ademas de
  activar/desactivar.
- Q: Cuales son las metricas minimas obligatorias del Dashboard? → A: Conteos actuales + variacion de ultimos 7 dias para nuevos usuarios, decisiones de acceso
  y apps activadas/desactivadas.
- Q: Cual es la regla de concurrencia para decisiones sobre usuarios? → A: La primera decision confirmada gana; intentos posteriores devuelven conflicto y
  exigen refrescar.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Navegar el panel con menu lateral y dashboard (Priority: P1)

Como administrador, quiero entrar a un panel con menu lateral y un dashboard inicial de metricas, para entender rapidamente el estado operativo del marketplace
y moverme entre modulos sin friccion.

**Why this priority**: Define la base visual y de operacion diaria para el equipo admin. Sin este punto no existe una experiencia administrativa coherente.

**Independent Test**: Iniciar sesion con cuenta administrativa y verificar que al entrar se muestra el menu lateral con los modulos esperados y un dashboard con
metricas visibles.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** ingresa al panel administrativo, **Then** ve un menu lateral con accesos a Dashboard, Usuarios, Apps y
   Administradores.
2. **Given** un administrador en el panel, **When** selecciona un modulo desde el menu lateral, **Then** el contenido principal cambia al modulo seleccionado y
   el menu resalta la seccion activa.
3. **Given** un administrador en el dashboard, **When** consulta la vista inicial, **Then** ve conteos actuales y variacion de los ultimos 7 dias para nuevos
   usuarios, decisiones de acceso y apps activadas/desactivadas.

---

### User Story 2 - Gestionar usuarios y decisiones de acceso (Priority: P1)

Como administrador, quiero revisar usuarios, ver su detalle y aprobar, rechazar o revocar accesos, para controlar de forma segura quien puede entrar al
marketplace.

**Why this priority**: El control de acceso es critico para la gobernanza del producto y para la seguridad de la vitrina.

**Independent Test**: Cargar usuarios en distintos estados, abrir el modulo de usuarios, revisar un perfil y ejecutar decisiones de aprobacion, rechazo y
revocacion verificando el cambio de estado.

**Acceptance Scenarios**:

1. **Given** usuarios con estados mixtos, **When** el administrador abre el modulo de usuarios, **Then** ve listado y estado actual de cada usuario.
2. **Given** un usuario pendiente, **When** el administrador abre su detalle, **Then** puede ver informacion suficiente para decidir y ejecutar aprobar o
   rechazar.
3. **Given** una decision de aprobacion o rechazo, **When** el administrador confirma la accion, **Then** el estado del usuario se actualiza y queda reflejado
   en el modulo.
4. **Given** un usuario aprobado, **When** el administrador ejecuta revocacion, **Then** el usuario queda en estado revocado y pierde acceso operativo al
   marketplace.
5. **Given** dos administradores actuando sobre el mismo usuario, **When** una decision ya fue confirmada, **Then** cualquier intento posterior recibe conflicto
   y debe refrescar antes de continuar.

---

### User Story 3 - Administrar apps de la vitrina (Priority: P2)

Como administrador, quiero gestionar las apps de la vitrina creando y editando su ficha basica, para mantener actualizada la oferta visible para usuarios
aprobados.

**Why this priority**: Sostiene el valor del marketplace, pero depende de tener primero panel y control de usuarios funcionando.

**Independent Test**: Abrir el modulo de apps, revisar listado, crear una app con ficha basica, editar su ficha y cambiar su estado operativo verificando que la
vitrina refleje el cambio.

**Acceptance Scenarios**:

1. **Given** apps registradas en la vitrina, **When** el administrador abre el modulo de apps, **Then** ve una lista con estado y datos principales de cada app.
2. **Given** que el administrador ingresa nombre, resumen y estado inicial validos, **When** crea una nueva app desde el modulo, **Then** la app queda
   registrada en la vitrina administrativa.
3. **Given** una app existente, **When** el administrador consulta su detalle y edita su nombre, resumen o estado, **Then** los cambios quedan guardados y
   visibles en el modulo.
4. **Given** una app activa, **When** el administrador la desactiva, **Then** deja de estar disponible para usuarios finales y permanece administrable
   internamente.

---

### User Story 4 - Agregar nuevos administradores (Priority: P2)

Como superadmin, quiero promover cuentas existentes a administradores, para distribuir operacion y continuidad del panel sin crear credenciales nuevas desde
este modulo.

**Why this priority**: Permite escalar operacion y evitar cuellos de botella de una sola persona administradora.

**Independent Test**: Ingresar al modulo de administradores, registrar un nuevo admin valido y verificar que aparece en el listado de administradores
habilitados.

**Acceptance Scenarios**:

1. **Given** un superadmin autenticado, **When** abre el modulo de administradores, **Then** ve el listado actual de cuentas administrativas.
2. **Given** un email de una cuenta existente y elegible, **When** el superadmin la promueve a administradora, **Then** la cuenta queda habilitada para acceder
   al panel administrativo.
3. **Given** un intento de alta con una cuenta ya administrativa, **When** el sistema procesa la solicitud, **Then** muestra un mensaje claro y evita
   duplicados.

### Edge Cases

- Si no hay datos historicos, el dashboard debe mostrar estado vacio claro en lugar de bloques rotos o metricas ambiguas.
- Si dos administradores intentan decidir el mismo usuario al mismo tiempo, la primera decision confirmada debe ganar y los intentos posteriores deben devolver
  conflicto con instruccion de refrescar.
- Si un usuario ya fue aprobado o rechazado, el modulo debe evitar transiciones invalidas desde acciones duplicadas.
- Si una app desactivada se consulta desde enlaces previos, debe mostrarse como no disponible para usuarios finales.
- Si el administrador intenta crear o editar una app sin nombre o resumen, el sistema debe bloquear el guardado e indicar los campos requeridos.
- Si se intenta registrar un administrador sin datos minimos requeridos, el sistema debe bloquear el alta e indicar campos faltantes.
- Si se intenta agregar una cuenta administrativa duplicada, el sistema debe impedirlo sin alterar registros existentes.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST proporcionar un acceso administrativo diferenciado del acceso de usuarios finales.
- **FR-002**: The system MUST mostrar un menu lateral persistente en el panel admin con los modulos Dashboard, Usuarios, Apps y Administradores.
- **FR-003**: The system MUST cargar por defecto el Dashboard al entrar al panel admin.
- **FR-004**: The system MUST mostrar en el Dashboard conteos actuales de usuarios por estado y estado general de apps en vitrina.
- **FR-020**: The system MUST mostrar variacion de los ultimos 7 dias para nuevos usuarios, decisiones de acceso y apps activadas/desactivadas.
- **FR-005**: The system MUST permitir navegar entre modulos desde el menu lateral manteniendo indicador visible de modulo activo.
- **FR-006**: The system MUST permitir listar usuarios con su estado de acceso en el modulo de Usuarios.
- **FR-007**: The system MUST permitir ver detalle individual de usuario con informacion suficiente para decision administrativa.
- **FR-008**: The system MUST permitir aprobar usuarios pendientes.
- **FR-009**: The system MUST permitir rechazar usuarios pendientes y revocar usuarios aprobados.
- **FR-010**: The system MUST reflejar de forma inmediata en el panel el estado actualizado de un usuario despues de una decision.
- **FR-011**: The system MUST permitir listar apps de vitrina con su estado operativo.
- **FR-012**: The system MUST permitir crear apps de vitrina mediante ficha basica con nombre, resumen y estado inicial.
- **FR-013**: The system MUST permitir consultar detalle administrativo y editar la ficha basica (nombre, resumen, estado) de una app de vitrina.
- **FR-014**: The system MUST impedir que una app desactivada aparezca como disponible para usuarios finales.
- **FR-015**: The system MUST mostrar el listado de administradores actuales en el modulo de Administradores.
- **FR-016**: The system MUST permitir que solo un superadmin promueva por email cuentas existentes y elegibles a rol administrativo.
- **FR-017**: The system MUST impedir registros administrativos duplicados sobre la misma cuenta.
- **FR-018**: The system MUST registrar trazabilidad de acciones administrativas criticas sobre usuarios, apps y altas de administradores.
- **FR-019**: The system MUST mostrar mensajes claros de exito o error para cada accion administrativa principal.
- **FR-021**: The system MUST aplicar regla first-write-wins para decisiones de usuario y devolver conflicto a intentos posteriores sobre un estado ya
  actualizado.

### Key Entities _(include if feature involves data)_

- **Cuenta Administrativa**: Persona con acceso al panel de administracion, incluyendo permisos administrativos y estado de habilitacion.
- **Usuario del Marketplace**: Persona candidata o habilitada para usar la vitrina, con estado de acceso y datos de evaluacion.
- **Decision de Acceso**: Registro de aprobacion, rechazo o revocacion aplicado a un usuario, con fecha y actor administrativo.
- **App de Vitrina**: Aplicacion gestionada por admins, con ficha basica (nombre, resumen, estado) y estado operativo en el marketplace.
- **Snapshot de Metricas**: Agregado de conteos y estados actuales con variacion de ultimos 7 dias para mostrar el dashboard operativo de admin.
- **Evento de Auditoria Admin**: Registro de acciones criticas ejecutadas en modulos de Usuarios, Apps y Administradores.

### Core Operations _(include if feature involves server behavior)_

- **ConsultarPanelAdminInicial**: Entregar dashboard operativo y estructura de navegacion admin para la vista de entrada.
- **GestionarDecisionesDeUsuario**: Listar usuarios, mostrar detalle y aplicar decisiones de aprobacion, rechazo y revocacion.
- **GestionarConflictosDeDecision**: Rechazar decisiones tardias sobre usuarios ya actualizados y requerir refresco de datos antes de reintentar.
- **GestionarAppsDeVitrina**: Listar apps, crear y editar ficha basica, consultar detalle y actualizar su estado operativo.
- **GestionarAltasAdministrativas**: Listar cuentas admin y registrar nuevos administradores elegibles.

### Access & Audit Notes _(include if feature involves protected data or admin actions)_

- **Roles**: Solo cuentas con permisos administrativos pueden acceder al panel admin; solo cuentas con rol superadmin pueden promover nuevos administradores.
- **States**: Estados de usuario contemplados para este feature: pendiente, aprobado, rechazado y revocado. Estados de app contemplados: activa e inactiva.
- **Audit Events**: Deben registrarse decisiones de aprobacion/rechazo/revocacion de usuario, cambios de estado de apps y altas de nuevos administradores.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de ingresos administrativos muestra menu lateral y dashboard inicial sin pasos adicionales.
- **SC-002**: El 95% de administradores completa una decision de aprobacion, rechazo o revocacion en menos de 60 segundos desde que abre el detalle del usuario.
- **SC-003**: El 95% de altas o ediciones de ficha basica y cambios de estado de apps queda reflejado en la vitrina administrativa y en disponibilidad para
  usuario final en menos de 1 minuto.
- **SC-004**: El 90% de administradores encuentra el detalle de un usuario o app especifica en menos de 45 segundos.
- **SC-005**: El 100% de intentos de alta administrativa duplicada es bloqueado con mensaje claro para el operador.
- **SC-006**: El 100% de acciones administrativas criticas del alcance queda con trazabilidad de actor y momento de ejecucion.
- **SC-007**: El 100% de dashboards administrativos muestra conteos actuales y variacion de ultimos 7 dias para nuevos usuarios, decisiones de acceso y apps
  activadas/desactivadas.

## Assumptions

- Se reutiliza el esquema de autenticacion existente para diferenciar cuentas administrativas de cuentas de usuario final.
- El dashboard administrativo se centra en metricas operativas de usuarios y apps; analitica financiera avanzada no entra en este alcance.
- La alta de nuevos administradores se realiza promoviendo por email cuentas existentes y elegibles, sin crear credenciales nuevas en este alcance.
- Las decisiones de aprobacion, rechazo y revocacion se aplican dentro del modulo de usuarios del panel administrativo.
- En concurrencia de decisiones sobre un mismo usuario, aplica first-write-wins y los intentos tardios devuelven conflicto.
- El modulo de apps en esta feature cubre ficha basica (nombre, resumen, estado) y cambios de estado; gestion avanzada de media, video y artefactos queda fuera
  de alcance.
- La variacion operativa del dashboard se calcula con ventana fija de 7 dias naturales.
- El panel administrativo debe ser usable en escritorio y movil con una navegacion lateral adaptable.
