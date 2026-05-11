# Feature Specification: Marketplace de aplicaciones ecommerce

**Feature Branch**: `[001-apps-marketplace]`  
**Created**: 2026-05-10  
**Status**: Draft  
**Input**: User description: "tengo una necesidad y es la siguiente, en mi equipo de trabajo hemos desarrollado un sin fin de herramientas opensource para el
comercio electronico y ahora queremos posicionarla en una plataforma estilo marketplace como por ejemplo shopify https://apps.shopify.com/?locale=es, cual es la
forma o dinamica, el usuario se registra con nosotros espera activacion por parte nuestra y una vez ingrese ve un espacio con n aplicaciones listas para usar,
cuando se le da clic a alguna de las apps lo llevaria a una pagina donde se muestra la app sus imagenes,descripcion , video en caso de tener las instrucciones
de uso y el boton de instalar o usar al estilo shopify
https://apps.shopify.com/search-and-discovery?locale=es&surface_detail=recommended-for-you&surface_inter_position=2&surface_intra_position=2&surface_type=home&surface_version=simplified.
el programa debe contar con dos accesos uno del usuario en donde una vez registrado debe esperar aprobacion en donde se le pide los datos y el proceso de estado
de aprobacion. 2. un acceso admin para que el admin vea la cantidad de usuarios un dasbhoard que diga cuantos usuarios nuevos hay cuantos esperan aprobacion
cuantos rechazados y graficas claras sobre eso. 3. el admin puede aprobar o desaprobar accesos o revocarlos. 4. el admin alimenta la vitrina con las apps sea
para cargar una nueva como zip o sea para enlazar alguna app web con sus imagenes, icono de referencia video instructivo y descripcion e instrucciones de uso y
acitvar o desactiva en vitrina, y un dashboard de uso para saber cuales se estan usando cuales no cuales se han descargado etc"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Solicitar acceso y consultar estado (Priority: P1)

Como comerciante o miembro de un equipo ecommerce, quiero registrarme en la plataforma y conocer el estado de mi solicitud, para saber si puedo acceder a la
vitrina de aplicaciones o si debo esperar una decision administrativa.

**Why this priority**: Sin registro y aprobacion no existe una base controlada de usuarios ni acceso seguro al marketplace.

**Independent Test**: Se puede probar creando una solicitud de usuario, verificando que queda pendiente de aprobacion, que el usuario ve su estado al intentar
ingresar y que no puede acceder a la vitrina hasta ser aprobado.

**Acceptance Scenarios**:

1. **Given** una persona sin cuenta, **When** completa el formulario de registro con los datos requeridos, **Then** el sistema crea una solicitud en estado
   pendiente y muestra una confirmacion clara de espera de aprobacion.
2. **Given** un usuario con solicitud pendiente, **When** intenta ingresar, **Then** ve el estado actual de aprobacion y no ve aplicaciones disponibles para
   instalar o usar.
3. **Given** un usuario rechazado o revocado, **When** intenta ingresar, **Then** ve un mensaje de acceso no autorizado con el estado correspondiente y sin
   acceso a la vitrina.

---

### User Story 2 - Explorar y usar aplicaciones aprobadas (Priority: P1)

Como usuario aprobado, quiero ver una vitrina con aplicaciones ecommerce disponibles, revisar el detalle de cada aplicacion y decidir si instalarla, descargarla
o usarla, para adoptar rapidamente herramientas utiles para mi operacion comercial.

**Why this priority**: Es el valor central del producto: convertir herramientas existentes en una experiencia tipo marketplace lista para consumo.

**Independent Test**: Se puede probar aprobando un usuario, publicando al menos una aplicacion activa y verificando que el usuario puede verla en la vitrina,
abrir su pagina de detalle y ejecutar la accion principal disponible.

**Acceptance Scenarios**:

1. **Given** un usuario aprobado y aplicaciones activas, **When** ingresa a la plataforma, **Then** ve una vitrina con las aplicaciones disponibles, sus
   nombres, iconos y resumenes.
2. **Given** una aplicacion visible en vitrina, **When** el usuario abre su detalle, **Then** ve imagenes, descripcion, instrucciones de uso, video instructivo
   si existe y una accion principal para instalar, descargar o usar.
3. **Given** una aplicacion configurada como enlace web, **When** el usuario selecciona la accion principal, **Then** el sistema lo lleva al destino de uso
   definido y registra el uso de la aplicacion.
4. **Given** una aplicacion configurada como paquete descargable, **When** el usuario selecciona la accion principal, **Then** el sistema entrega el paquete
   disponible y registra la descarga.

---

### User Story 3 - Gestionar aprobaciones de usuarios (Priority: P2)

Como administrador, quiero revisar usuarios nuevos, pendientes, aprobados, rechazados y revocados, para controlar quien puede acceder a las aplicaciones del
marketplace.

**Why this priority**: El control de acceso es una regla explicita del flujo y protege la distribucion de las herramientas.

**Independent Test**: Se puede probar ingresando como administrador, revisando una solicitud pendiente, aprobando, rechazando y revocando accesos, y verificando
el efecto inmediato en la experiencia del usuario.

**Acceptance Scenarios**:

1. **Given** solicitudes de usuarios pendientes, **When** el administrador revisa el panel de usuarios, **Then** ve el conteo y listado de solicitudes por
   estado.
2. **Given** una solicitud pendiente, **When** el administrador la aprueba, **Then** el usuario obtiene acceso a la vitrina en su siguiente ingreso.
3. **Given** una solicitud pendiente, **When** el administrador la rechaza, **Then** el usuario queda sin acceso y puede ver su estado de rechazo.
4. **Given** un usuario aprobado, **When** el administrador revoca su acceso, **Then** el usuario pierde acceso a la vitrina y queda identificado como revocado.

---

### User Story 4 - Administrar la vitrina de aplicaciones (Priority: P2)

Como administrador, quiero cargar nuevas aplicaciones, enlazar aplicaciones web, completar su contenido comercial y activar o desactivar su visibilidad, para
mantener actualizada la oferta disponible en el marketplace.

**Why this priority**: La plataforma necesita una operacion interna simple para publicar, retirar y mantener aplicaciones sin depender de cambios manuales fuera
del flujo administrativo.

**Independent Test**: Se puede probar creando una aplicacion con contenido completo, publicandola, verificando que aparece para usuarios aprobados,
desactivandola y confirmando que deja de aparecer.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** registra una aplicacion con nombre, descripcion, icono, imagenes, instrucciones y tipo de acceso, **Then**
   la aplicacion queda guardada como borrador o lista para publicar segun la seleccion del administrador.
2. **Given** una aplicacion tipo paquete, **When** el administrador carga el archivo correspondiente y completa su informacion, **Then** la aplicacion puede
   publicarse con una accion de descarga o instalacion.
3. **Given** una aplicacion tipo web, **When** el administrador define su enlace de uso y completa su informacion, **Then** la aplicacion puede publicarse con
   una accion de uso.
4. **Given** una aplicacion activa, **When** el administrador la desactiva, **Then** deja de mostrarse en la vitrina de los usuarios aprobados sin perder su
   historial de uso.

---

### User Story 5 - Consultar tableros administrativos y uso (Priority: P3)

Como administrador, quiero ver tableros con usuarios nuevos, usuarios pendientes, rechazados, revocados y actividad por aplicacion, para tomar decisiones sobre
aprobaciones, adopcion y mantenimiento de la vitrina.

**Why this priority**: Los tableros mejoran la gestion y priorizacion, pero dependen de que el flujo de usuarios y aplicaciones ya exista.

**Independent Test**: Se puede probar generando actividad de registros, aprobaciones, usos y descargas, y verificando que los indicadores y graficas reflejan
esos eventos de forma comprensible.

**Acceptance Scenarios**:

1. **Given** actividad de usuarios en distintos estados, **When** el administrador abre el dashboard, **Then** ve conteos claros de usuarios nuevos, pendientes,
   aprobados, rechazados y revocados.
2. **Given** aplicaciones con usos y descargas registradas, **When** el administrador consulta el dashboard de uso, **Then** ve cuales aplicaciones se usan mas,
   cuales no tienen actividad y cuales han sido descargadas.
3. **Given** datos historicos disponibles, **When** el administrador consulta graficas del dashboard, **Then** puede interpretar tendencias por periodo sin
   requerir calculos manuales.

### Edge Cases

- Si un usuario intenta acceder a la vitrina sin aprobacion, el sistema debe bloquear el acceso y mostrar el estado de la solicitud.
- Si no hay aplicaciones activas, el usuario aprobado debe ver un estado vacio claro sin acciones de instalacion o uso.
- Si una aplicacion es desactivada mientras un usuario esta viendo su detalle, la accion principal debe quedar indisponible y explicar que la aplicacion ya no
  esta disponible.
- Si una aplicacion no tiene video instructivo, su detalle debe mostrarse correctamente con imagenes, descripcion e instrucciones disponibles.
- Si una carga de paquete no cumple las reglas aceptadas para publicacion, el administrador debe recibir una explicacion accionable y la aplicacion no debe
  publicarse.
- Si un administrador revoca un acceso, el cambio debe aplicarse antes de permitir nuevas acciones sobre aplicaciones.
- Si existen datos insuficientes para graficas, el dashboard debe mostrar conteos y estados vacios comprensibles.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema MUST permitir que una persona solicite una cuenta proporcionando los datos necesarios para evaluar su acceso.
- **FR-002**: El sistema MUST asignar toda nueva solicitud de usuario al estado pendiente hasta que un administrador tome una decision.
- **FR-003**: El sistema MUST mostrar al usuario el estado actual de su solicitud cuando intente ingresar o consultar su cuenta.
- **FR-004**: El sistema MUST impedir que usuarios pendientes, rechazados o revocados accedan a la vitrina de aplicaciones.
- **FR-005**: El sistema MUST permitir que usuarios aprobados vean una vitrina de aplicaciones activas disponibles para uso, descarga o instalacion.
- **FR-006**: El sistema MUST permitir que el usuario aprobado abra una pagina de detalle por aplicacion con icono, imagenes, descripcion, instrucciones de uso
  y video instructivo cuando exista.
- **FR-007**: El sistema MUST mostrar una accion principal por aplicacion segun su modalidad disponible: usar aplicacion web, descargar paquete o instalar
  paquete.
- **FR-008**: El sistema MUST registrar eventos relevantes de interaccion con aplicaciones, incluyendo visualizaciones de detalle, usos, instalaciones o
  descargas.
- **FR-009**: El sistema MUST ofrecer un acceso administrativo separado del acceso de usuario regular.
- **FR-010**: El sistema MUST permitir que administradores vean usuarios agrupados por estado: nuevos, pendientes, aprobados, rechazados y revocados.
- **FR-011**: El sistema MUST permitir que administradores aprueben, rechacen y revoquen accesos de usuarios.
- **FR-012**: El sistema MUST reflejar los cambios de estado de usuario en la experiencia de acceso del usuario afectado.
- **FR-013**: El sistema MUST permitir que administradores creen y editen fichas de aplicaciones con nombre, descripcion, instrucciones, icono, imagenes y video
  opcional.
- **FR-014**: El sistema MUST permitir que administradores configuren una aplicacion como paquete cargado o como aplicacion web enlazada.
- **FR-015**: El sistema MUST permitir que administradores activen o desactiven aplicaciones en la vitrina.
- **FR-016**: El sistema MUST ocultar de la vitrina las aplicaciones inactivas para usuarios aprobados.
- **FR-017**: El sistema MUST conservar el historial de uso y descargas aunque una aplicacion sea desactivada.
- **FR-018**: El sistema MUST mostrar un dashboard administrativo con conteos de usuarios por estado y graficas comprensibles de su evolucion.
- **FR-019**: El sistema MUST mostrar un dashboard de uso de aplicaciones con aplicaciones usadas, no usadas, descargadas e instaladas.
- **FR-020**: El sistema MUST permitir distinguir claramente entre aplicaciones disponibles para usar en linea y aplicaciones disponibles como paquete
  descargable.
- **FR-021**: El sistema MUST validar que una aplicacion tenga la informacion minima requerida antes de activarla en la vitrina.
- **FR-022**: El sistema MUST registrar quien realizo decisiones administrativas relevantes sobre usuarios y aplicaciones.

### Key Entities

- **Usuario**: Persona que solicita acceso a la plataforma. Incluye datos de contacto, datos de evaluacion, estado de aprobacion y fechas relevantes del
  proceso.
- **Administrador**: Persona con permisos para revisar usuarios, tomar decisiones de acceso, administrar aplicaciones y consultar dashboards.
- **Solicitud de acceso**: Proceso de evaluacion asociado a un usuario, con estado pendiente, aprobado, rechazado o revocado, decision administrativa y motivo
  opcional.
- **Aplicacion**: Herramienta ecommerce disponible en la vitrina. Incluye nombre, resumen, descripcion, instrucciones, tipo de acceso, estado de publicacion y
  contenido multimedia.
- **Recurso multimedia**: Icono, imagen o video instructivo asociado a una aplicacion para explicar su valor y uso.
- **Paquete de aplicacion**: Archivo cargado por un administrador para descarga o instalacion por parte de usuarios aprobados.
- **Enlace de aplicacion web**: Direccion de uso asociada a una aplicacion que se consume en linea.
- **Evento de uso**: Registro de visualizacion, uso, instalacion o descarga de una aplicacion por un usuario aprobado.
- **Indicador administrativo**: Conteo, grafica o metrica derivada de usuarios, estados de aprobacion y eventos de uso de aplicaciones.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 95% de usuarios puede completar una solicitud de acceso en menos de 3 minutos con los datos requeridos.
- **SC-002**: El 100% de usuarios no aprobados queda bloqueado de la vitrina y recibe una indicacion clara de su estado.
- **SC-003**: El 90% de usuarios aprobados puede encontrar una aplicacion activa y abrir su detalle en menos de 2 minutos.
- **SC-004**: El 90% de fichas de aplicacion publicadas incluye descripcion, instrucciones, icono e imagenes suficientes para entender su uso sin soporte
  adicional.
- **SC-005**: Los administradores pueden aprobar, rechazar o revocar una solicitud en menos de 1 minuto desde el panel de usuarios.
- **SC-006**: Los dashboards administrativos muestran conteos de usuarios por estado y actividad de aplicaciones con una diferencia maxima de 1 evento respecto
  al historial registrado.
- **SC-007**: El administrador puede identificar las 5 aplicaciones mas usadas y las aplicaciones sin actividad en menos de 2 minutos.
- **SC-008**: Al menos el 85% de usuarios aprobados completa una accion principal de una aplicacion publicada en su primer intento.

## Assumptions

- La plataforma tendra dos experiencias principales: usuario aprobado y administrador.
- Toda cuenta nueva requiere aprobacion administrativa antes de ver o usar aplicaciones.
- Los estados iniciales de usuario seran pendiente, aprobado, rechazado y revocado.
- Las aplicaciones publicadas pueden ser de dos modalidades: paquete cargado o aplicacion web enlazada.
- El video instructivo de una aplicacion es opcional; icono, descripcion, instrucciones y al menos una imagen son obligatorios para publicar.
- Los dashboards muestran informacion suficiente para gestion operativa, no analitica financiera avanzada.
- El alcance inicial no incluye cobros, planes, comisiones, reseñas publicas ni ranking comercial pagado.
- Las decisiones administrativas deben quedar auditables para trazabilidad interna.
