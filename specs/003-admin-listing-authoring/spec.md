# Feature Specification: Authoring avanzado de vitrinas de apps

**Feature Branch**: `[003-admin-listing-authoring]`  
**Created**: 2026-05-12  
**Status**: Draft  
**Input**: User description: "bien ahora vamos con un nuevo feature, necesito que me ayudes a pensar y a construir esta especificacion para este nuevo feature
lo primero es que tenemos que dar un mejor UX ui para la parte admin en donde el admin pueda cargar correctamente toda la informacion de una aplicacion para
mostrarse en vitrina al estilo shopify ... tiene imagenes, descripcion, video en caso de tener, idiomas instrucciones desarrollado por etc ... que el admin
pueda generar ese contenido para que la app renderice ese mismo estilo"

## Clarifications

### Session 2026-05-12

- Q: Cuando se edita una app ya visible, como deben convivir borrador y version publica? → A: Mantener borrador separado y reemplazar la version publica solo al
  confirmar publicacion.
- Q: Cual es el minimo obligatorio para considerar lista una vitrina enriquecida? → A: Requerir icono, resumen, descripcion, minimo 1 screenshot, desarrollador,
  idiomas e instrucciones; soporte y video son opcionales.
- Q: Que informacion exacta debe tener el bloque desarrollado por? → A: Requerir nombre visible y sitio web publico del desarrollador; el soporte queda en un
  bloque aparte opcional.
- Q: Como deben registrarse los idiomas soportados? → A: Seleccion multiple desde un catalogo predefinido de idiomas.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Cargar una ficha comercial completa de la app (Priority: P1)

Como administrador del marketplace, quiero completar una ficha comercial rica y ordenada para cada app, para que la vitrina publique informacion suficiente,
confiable y atractiva sin depender de ajustes manuales fuera del panel.

**Why this priority**: Es la capacidad central del feature. Sin authoring completo no existe la vitrina enriquecida que el negocio quiere mostrar.

**Independent Test**: Abrir una app existente desde el panel admin, completar los bloques de contenido de vitrina, guardar como borrador y volver a entrar
verificando que toda la informacion queda persistida y organizada por secciones.

**Acceptance Scenarios**:

1. **Given** una app existente en el marketplace, **When** el administrador abre su experiencia de authoring, **Then** encuentra la informacion organizada por
   bloques claros de contenido, media, informacion del desarrollador, idiomas desde un catalogo controlado y orientacion de uso.
2. **Given** una ficha incompleta, **When** el administrador guarda avances parciales, **Then** el sistema conserva el contenido ya cargado sin obligarlo a
   completar todo en una sola sesion.
3. **Given** que el administrador registra descripcion detallada, imagenes, idiomas soportados desde un catalogo predefinido, instrucciones y el nombre visible
   con sitio web publico del desarrollador, **When** guarda la ficha, **Then** el contenido queda asociado a esa app para su futura presentacion en vitrina.
4. **Given** una app con contenido ya existente, **When** el administrador edita solo uno de los bloques, **Then** el resto de la ficha permanece intacto.

---

### User Story 2 - Previsualizar y validar la vitrina antes de exponerla (Priority: P1)

Como administrador del marketplace, quiero ver una previsualizacion de la ficha tal como se mostrara en la vitrina y entender que falta para completarla, para
evitar publicar experiencias incompletas o desordenadas.

**Why this priority**: La calidad visual y de contenido depende de que el equipo admin pueda revisar la experiencia final antes de exponerla a usuarios reales.

**Independent Test**: Completar una ficha parcial y una ficha completa, abrir la previsualizacion y verificar que el sistema indica contenido faltante cuando la
ficha no esta lista y muestra la vitrina final cuando si lo esta.

**Acceptance Scenarios**:

1. **Given** una ficha con informacion faltante, **When** el administrador intenta marcarla como lista para vitrina enriquecida, **Then** el sistema identifica
   con claridad si faltan icono, resumen, descripcion, al menos una captura, desarrollador, idiomas o instrucciones y evita exponerla como completa.
2. **Given** una ficha con la informacion minima requerida, **When** el administrador abre la previsualizacion, **Then** visualiza la estructura publica con el
   mismo orden narrativo esperado para la vitrina.
3. **Given** una app ya visible en el marketplace, **When** el administrador actualiza su contenido enriquecido, **Then** puede revisar la nueva
   previsualizacion antes de confirmar la version a exponer sin alterar la version publica vigente.
4. **Given** una ficha sin video u otros elementos opcionales, **When** el administrador previsualiza la vitrina, **Then** la experiencia sigue viendose
   coherente sin espacios vacios ni secciones rotas.

---

### User Story 3 - Consultar una vitrina enriquecida desde el marketplace (Priority: P2)

Como usuario aprobado del marketplace, quiero encontrar en una sola pagina toda la informacion comercial y operativa relevante de una app, para evaluar
rapidamente si me sirve sin salir a buscar contexto adicional.

**Why this priority**: El valor final del feature aparece cuando la informacion authorada por admin mejora la decision de descubrimiento y evaluacion en la
vitrina.

**Independent Test**: Abrir el detalle de una app con ficha enriquecida y comprobar que muestra descripcion, media, desarrollador, idiomas e instrucciones;
luego abrir una app aun no enriquecida y confirmar que conserva su presentacion simplificada sin romper el flujo actual.

**Acceptance Scenarios**:

1. **Given** una app activa con ficha enriquecida lista, **When** un usuario aprobado abre su detalle, **Then** ve una vitrina rica con imagenes, descripcion
   extendida, informacion del desarrollador, idiomas soportados e instrucciones.
2. **Given** una app con video promocional, **When** el usuario abre su detalle, **Then** el video aparece como parte de la experiencia de descubrimiento sin
   reemplazar la galeria principal.
3. **Given** una app activa sin ficha enriquecida completa, **When** el usuario abre su detalle, **Then** el sistema mantiene la presentacion simplificada
   existente hasta que la ficha enriquecida este lista.
4. **Given** una ficha enriquecida con bloques opcionales vacios, **When** el usuario navega la vitrina, **Then** solo se muestran los bloques con contenido
   real.

### Edge Cases

- Si una app tiene galeria de imagenes pero no tiene video, la vitrina debe seguir viendose completa sin reservar espacios inutiles.
- Si el administrador guarda una ficha parcial, el sistema debe mantenerla como borrador sin tratarla como lista para vitrina enriquecida.
- Si el administrador elimina contenido requerido de un borrador de una app previamente lista, el sistema debe marcar ese borrador como incompleto sin retirar
  la version publica vigente hasta que se confirme una nueva publicacion lista.
- Si la ficha tiene icono y contenido textual completo pero no tiene al menos una captura de pantalla, no debe considerarse lista para vitrina enriquecida.
- Si la ficha tiene nombre visible del desarrollador pero no sitio web publico, no debe considerarse lista para vitrina enriquecida.
- Si el administrador intenta registrar un idioma fuera del catalogo controlado, el sistema debe rechazarlo y pedir una seleccion valida.
- Si la descripcion o las instrucciones son extensas, la vitrina debe seguir siendo legible y escaneable sin romper el orden del contenido.
- Si una app activa existente aun no fue enriquecida, debe seguir visible con la presentacion actual para no afectar continuidad comercial durante el rollout.
- Si el administrador reordena la media, la vitrina debe respetar el orden elegido en la siguiente visualizacion publica.
- Si se actualizan idiomas soportados o datos del desarrollador, la ficha publica debe reflejar el cambio sin mezclar informacion anterior.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST proporcionar a administradores una experiencia dedicada para authoring de contenido comercial de apps del marketplace.
- **FR-002**: The system MUST organizar la carga de contenido en bloques claros que reduzcan sobrecarga operativa y faciliten el escaneo del formulario.
- **FR-003**: The system MUST permitir guardar una ficha enriquecida como borrador aunque aun no este completa, sin alterar la version publica actualmente
  visible.
- **FR-004**: The system MUST permitir registrar para cada app una descripcion extendida orientada a vitrina, distinta del resumen basico ya existente.
- **FR-005**: The system MUST permitir cargar y ordenar activos visuales de vitrina, incluyendo icono, imagenes de galeria y video opcional.
- **FR-006**: The system MUST permitir registrar nombre visible y sitio web publico del desarrollador como informacion obligatoria de confianza para la vitrina.
- **FR-007**: The system MUST permitir registrar idiomas soportados por la app mediante seleccion multiple desde un catalogo predefinido de idiomas.
- **FR-008**: The system MUST permitir registrar instrucciones de implementacion, activacion o uso inicial visibles en la vitrina.
- **FR-009**: The system MUST permitir registrar de forma opcional informacion de soporte o contacto asociada a la app para consulta del usuario final.
- **FR-010**: The system MUST mostrar al administrador el estado de completitud de la ficha y de sus bloques principales.
- **FR-011**: The system MUST permitir previsualizar la ficha con la misma jerarquia de contenido que vera el usuario final en la vitrina.
- **FR-012**: The system MUST impedir que una app sea tratada como lista para vitrina enriquecida cuando le falte icono, resumen, descripcion extendida, al
  menos una captura de pantalla, nombre visible del desarrollador, sitio web publico del desarrollador, al menos un idioma soportado del catalogo controlado o
  instrucciones.
- **FR-013**: The system MUST permitir editar una ficha enriquecida existente sin perder bloques no modificados.
- **FR-014**: The system MUST dar mensajes claros de guardado, validacion, error y confirmacion durante el flujo de authoring.
- **FR-015**: The system MUST mantener separado el estado operativo de la app del progreso de authoring de su ficha enriquecida, para permitir preparar
  contenido antes de exponerlo.
- **FR-016**: The system MUST renderizar una vitrina enriquecida para apps cuya ficha este lista, usando la informacion authorada por admin.
- **FR-017**: The system MUST conservar la presentacion simplificada actual para apps activas que aun no tengan ficha enriquecida lista.
- **FR-018**: The system MUST ocultar en la vitrina publica los bloques opcionales que no tengan contenido real.
- **FR-019**: The system MUST reflejar el orden definido por el administrador para la galeria visual de la app.
- **FR-020**: The system MUST registrar trazabilidad de cambios que afecten contenido publico o estado de readiness de la ficha enriquecida.
- **FR-021**: The system MUST mantener una version publica estable de la ficha mientras exista un borrador en edicion y solo reemplazarla cuando un
  administrador confirme la nueva publicacion.

### Key Entities _(include if feature involves data)_

- **Ficha Enriquecida de App**: Representacion comercial extendida de una app para vitrina, compuesta por contenido descriptivo, visual y de confianza.
- **Borrador de Vitrina**: Version editable de la ficha enriquecida que puede estar incompleta y no se muestra al usuario final mientras no sea confirmada.
- **Version Publica de Vitrina**: Version confirmada de la ficha enriquecida visible para usuarios finales hasta que otra publicacion la reemplace.
- **Bloque de Contenido de Vitrina**: Seccion authorable de la ficha, como descripcion extendida, desarrollador, idiomas, instrucciones o soporte.
- **Activo Visual de Vitrina**: Recurso visual asociado a una app para presentacion publica, incluyendo icono, imagenes y video opcional.
- **Perfil Visible del Desarrollador**: Informacion obligatoria de presentacion de quien desarrolla la app, compuesta por nombre visible y sitio web publico.
- **Idioma Soportado**: Valor seleccionado desde un catalogo controlado de idiomas permitidos para mostrar compatibilidad visible en la vitrina.
- **Canal de Soporte Visible**: Informacion opcional de contacto o soporte asociada a la app para consulta del usuario final.
- **Estado de Readiness de Vitrina**: Indicador de si la ficha esta incompleta, en borrador o lista para mostrarse como experiencia enriquecida.
- **Evento de Auditoria de Vitrina**: Registro del actor administrativo, momento y cambio aplicado sobre contenido o readiness publico.

### Core Operations _(include if feature involves server behavior)_

- **GuardarBorradorDeFichaEnriquecida**: Registrar avances parciales del contenido authorado sin exponerlos como experiencia enriquecida.
- **EvaluarReadinessDeVitrina**: Determinar si la ficha cumple las condiciones minimas para mostrarse como vitrina enriquecida.
- **PrevisualizarFichaEnriquecida**: Entregar al administrador una vista previa de la experiencia publica antes de confirmarla.
- **ActualizarBorradorDeFichaEnriquecida**: Aplicar cambios sobre el borrador de la ficha enriquecida de una app manteniendo integridad del resto del contenido.
- **ConfirmarPublicacionDeFichaEnriquecida**: Reemplazar la version publica vigente por el borrador validado cuando el administrador confirme su exposicion.
- **RenderizarDetallePublicoDeApp**: Mostrar la experiencia enriquecida o la presentacion simplificada segun el estado de readiness de la ficha.

### Access & Audit Notes _(include if feature involves protected data or admin actions)_

- **Roles**: Cuentas con permisos administrativos pueden authorar y actualizar fichas enriquecidas; usuarios aprobados del marketplace consumen la vitrina
  publica.
- **States**: La app conserva su estado operativo actual y, de forma adicional, la ficha enriquecida tiene su propio estado de readiness para determinar si se
  muestra como experiencia completa.
- **Audit Events**: Deben quedar auditados los cambios de contenido de borrador, cambios de readiness y cada confirmacion que altere la informacion publica
  mostrada al usuario final.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 90% de administradores completa una ficha enriquecida lista para vitrina en menos de 15 minutos a partir de una app ya creada.
- **SC-002**: El 95% de administradores identifica los bloques faltantes para completar una vitrina enriquecida en su primer intento de validacion, sin apoyo
  externo.
- **SC-003**: El 90% de usuarios aprobados puede identificar desde una sola pagina que hace la app, quien la desarrolla, en que idiomas opera y como empezar a
  usarla.
- **SC-004**: El 100% de apps con ficha enriquecida lista muestran contenido obligatorio sin placeholders ni bloques vacios visibles al usuario final.
- **SC-005**: El 100% de cambios que afectan contenido publico de una vitrina quedan asociados a un actor administrativo y un momento de ejecucion.
- **SC-006**: El 100% de apps activas existentes permanece visible durante el rollout, ya sea mediante vitrina enriquecida o mediante la presentacion
  simplificada actual.

## Assumptions

- Se reutiliza el modelo actual de roles administrativos para authoring de fichas enriquecidas.
- La primera version cubre authoring de una sola variante de contenido por app; no incluye traducciones completas de todos los textos por idioma.
- Los idiomas se gestionan como informacion visible sobre compatibilidad o soporte de la app mediante un catalogo controlado, no como contenido multilenguaje
  completo en esta fase.
- El video promocional es opcional; la experiencia enriquecida debe poder funcionar solo con icono e imagenes.
- El bloque desarrollado por exige nombre visible y sitio web publico; los datos de soporte se cargan aparte y siguen siendo opcionales en esta fase.
- Las apps activas existentes que aun no tengan ficha enriquecida lista continuan usando la presentacion simplificada actual hasta ser enriquecidas.
- Reviews, ratings, pricing detallado y comparativos entre apps quedan fuera de alcance de esta feature.
- La nueva experiencia debe priorizar claridad visual, jerarquia de contenido y facilidad de mantenimiento para el equipo admin.
