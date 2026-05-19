# Feature Specification: Home wow del marketplace orientada a resultados

**Feature Branch**: `[004-wow-storefront]`  
**Created**: 2026-05-18  
**Status**: Draft  
**Input**: User description: "Rediseñar la vitrina pública del marketplace para que deje de verse vacía y sorprenda al usuario con una propuesta de valor
fuerte, hero, rutas por objetivos, stacks curados y una experiencia guiada hacia resultados antes de mostrar el catálogo completo."

## Clarifications

### Session 2026-05-18

- Q: ¿Cuál debe ser la fuente de verdad de las rutas por objetivo y los stacks curados? → A: Curaduría fija en código para v1; rutas, stacks y orden se definen
  en configuración versionada y referencian apps activas existentes.
- Q: Cuando existe un objetivo activo y además una búsqueda, ¿qué regla debe seguir el marketplace? → A: La búsqueda refina dentro del objetivo activo; se
  muestra la intersección y, si no hay resultados, la UI ofrece acciones claras para limpiar búsqueda, limpiar objetivo o volver al catálogo.
- Q: En esta v1, ¿cómo debe comportarse un stack curado cuando el usuario lo abre? → A: Navega a una sección dedicada dentro de la misma home, usando scroll o
  anchor y foco visual en el stack seleccionado, sin abrir una ruta nueva.
- Q: ¿Cuáles deben ser las rutas por objetivo canónicas de la v1? → A: Vender más, lanzar más rápido, validar productos y ordenar operación.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Entender de inmediato por dónde empezar (Priority: P1)

Como usuario aprobado que entra al marketplace por primera vez, quiero entender en segundos qué resultados puedo lograr y cuál es la mejor ruta de inicio para
mi situación, para no sentir que entré a un catálogo vacío o genérico.

**Why this priority**: El problema principal no es la falta de navegación sino la falta de orientación y promesa de valor al primer vistazo. Sin resolver esto,
el catálogo seguirá sintiéndose frío aunque aumente el número de apps.

**Independent Test**: Abrir la home del marketplace con un catálogo pequeño y verificar que un usuario nuevo pueda identificar una promesa clara, elegir un
objetivo principal y avanzar hacia apps relevantes sin depender del buscador.

**Acceptance Scenarios**:

1. **Given** un usuario aprobado que entra a la home del marketplace, **When** carga la pantalla, **Then** primero ve una propuesta de valor clara enfocada en
   resultados antes del grid de apps.
2. **Given** un usuario que no sabe qué app abrir primero, **When** revisa las rutas destacadas por objetivo, **Then** puede elegir una dirección entre vender
   más, lanzar más rápido, validar productos u ordenar operación.
3. **Given** un catálogo con pocas apps activas, **When** el usuario entra al marketplace, **Then** la experiencia sigue sintiéndose curada, útil y completa en
   vez de vacía.
4. **Given** un usuario en mobile, **When** entra por primera vez, **Then** la promesa principal y el siguiente paso recomendado siguen siendo visibles sin
   depender de hover o de exploración extensa.

---

### User Story 2 - Explorar stacks curados según el resultado que busca (Priority: P1)

Como usuario aprobado, quiero ver combinaciones curadas de apps agrupadas por resultado de negocio, para entender cómo usar varias soluciones juntas y no
evaluar herramientas de forma aislada.

**Why this priority**: La propuesta wow no sale de mostrar más tarjetas, sino de convertir el catálogo en una experiencia de curaduría y camino guiado hacia
resultados concretos.

**Independent Test**: Entrar a la home, abrir un stack recomendado y comprobar que el usuario entiende qué resultado obtiene, para quién aplica, qué apps
incluye y cuál debería ser su siguiente paso.

**Acceptance Scenarios**:

1. **Given** un usuario que selecciona una ruta por objetivo, **When** el marketplace muestra stacks curados, **Then** cada stack explica el resultado esperado,
   el contexto ideal de uso y las apps incluidas.
2. **Given** un stack con apps web y apps descargables, **When** el usuario lo revisa, **Then** entiende con claridad qué puede usar al instante y qué requiere
   descarga o instalación.
3. **Given** una app incluida en un stack que no tenga storefront enriquecido completo, **When** se renderiza el stack, **Then** la experiencia mantiene
   coherencia visual sin mostrar huecos rotos ni contenido inválido.
4. **Given** un usuario que abre un stack curado desde la home, **When** activa su entrada principal, **Then** el marketplace lo lleva a una sección dedicada
   dentro de la misma home con foco visual en ese stack, sin cambiar a una ruta nueva.
5. **Given** un usuario interesado en profundizar, **When** abre una app desde un stack curado, **Then** llega al detalle actual de la app sin perder el
   contexto de descubrimiento.

---

### User Story 3 - Navegar el catálogo completo sin perder el contexto narrativo (Priority: P2)

Como usuario aprobado que ya sabe lo que busca o que vuelve al marketplace, quiero seguir pudiendo buscar y explorar todo el catálogo, pero sin perder la
orientación visual y comercial de la experiencia guiada.

**Why this priority**: El marketplace debe servir tanto al usuario que necesita guía como al que quiere ir directo al catálogo. El rediseño no puede sacrificar
utilidad por marketing.

**Independent Test**: Aplicar búsqueda, activar una ruta por objetivo, limpiar filtros y seguir navegando el catálogo completo verificando que la narrativa
principal y los caminos de recuperación siguen presentes.

**Acceptance Scenarios**:

1. **Given** un usuario con una búsqueda activa, **When** no encuentra resultados, **Then** el marketplace le ofrece una salida clara hacia rutas recomendadas o
   al catálogo completo.
2. **Given** un usuario con un objetivo activo y además una búsqueda, **When** la búsqueda reduce los resultados, **Then** el marketplace muestra solo la
   intersección entre ambos contextos y conserva acciones claras para recuperar amplitud.
3. **Given** un usuario con una ruta por objetivo seleccionada, **When** decide volver a explorar todo el catálogo, **Then** puede resetear el contexto en una
   sola acción sin perder claridad de navegación.
4. **Given** un usuario que vuelve repetidamente al marketplace, **When** entra a la home, **Then** puede pasar rápidamente del contenido guiado al catálogo
   completo y a los detalles de app.
5. **Given** un catálogo con mezcla de resúmenes cortos, nombres largos o assets incompletos, **When** el usuario explora el grid completo, **Then** la
   jerarquía visual sigue siendo escaneable y consistente.

### Edge Cases

- Si hay menos apps activas que slots destacados en hero, stacks o secciones curadas, la experiencia debe seguir viéndose intencional y no como una maqueta
  incompleta.
- Si una de las rutas canónicas de la v1 no tiene suficientes apps relevantes, el sistema debe mostrar una alternativa útil o sugerir otro objetivo canónico
  relacionado en vez de dejar un vacío.
- Si una búsqueda no arroja resultados dentro de un objetivo activo, la experiencia debe mantener ese contexto visible y ofrecer acciones explícitas para
  limpiar la búsqueda, limpiar el objetivo o volver al catálogo completo sin recargar la página.
- Si una app activa no tiene icono o storefront enriquecido completo, debe seguir pudiendo aparecer con fallbacks seguros sin romper el layout.
- Si una misma app aporta valor a más de un objetivo, la experiencia debe poder reutilizarla sin generar mensajes contradictorios.
- Si el usuario entra con un enlace compartido con búsqueda u objetivo preseleccionado, la home debe respetar ese contexto desde el primer render.
- Si el usuario llega a un stack curado desde un enlace compartido o desde refresco del navegador, la home debe poder restaurar ese foco dentro de la misma
  página sin enviarlo a una ruta separada.
- Si el usuario navega desde mobile, las secciones guiadas deben seguir siendo comprensibles con scroll natural y sin depender de hover.
- Si el catálogo crece con el tiempo, la experiencia debe seguir permitiendo llegar al grid completo sin quedar bloqueada en las secciones destacadas.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST reemplazar la introducción actual basada solo en título y buscador por una entrada orientada a propuesta de valor antes del
  catálogo.
- **FR-002**: The system MUST comunicar en la home qué problemas o resultados ayuda a resolver el marketplace antes de pedirle al usuario que elija una app.
- **FR-003**: The system MUST presentar como rutas canónicas de descubrimiento de la v1 vender más, lanzar más rápido, validar productos y ordenar operación, y
  no solo un listado de herramientas.
- **FR-004**: Users MUST be able to elegir una ruta por objetivo y ver inmediatamente recomendaciones relacionadas con ese objetivo.
- **FR-005**: The system MUST mostrar stacks curados que agrupen una o más apps alrededor de un resultado concreto, definidos mediante curaduría fija en código
  durante la v1.
- **FR-006**: The system MUST explicar en cada stack curado el resultado esperado, el contexto ideal de uso, las apps incluidas y un siguiente paso recomendado.
- **FR-006A**: The system MUST abrir cada stack curado dentro de una sección dedicada en la misma home, usando scroll o anchor y foco visual claro, sin
  introducir una ruta nueva en la v1.
- **FR-007**: The system MUST mantener el catálogo completo de apps publicadas accesible desde la misma experiencia guiada.
- **FR-008**: The system MUST conservar la búsqueda directa de apps y permitir combinarla o limpiarla sin perder el contexto general de descubrimiento, usando
  la búsqueda como refinamiento del objetivo activo cuando ambos estén presentes.
- **FR-009**: The system MUST ofrecer señales de valor más fuertes que un simple nombre y resumen, de modo que el usuario entienda por qué una app o stack le
  sirve.
- **FR-010**: The system MUST distinguir con claridad entre apps web y recursos descargables tanto en las secciones guiadas como en el catálogo completo.
- **FR-011**: The system MUST degradar con elegancia cuando una app carezca de assets opcionales o storefront enriquecido, sin mostrar placeholders rotos ni
  bloques vacíos.
- **FR-012**: The system MUST proporcionar una salida clara cuando una búsqueda o ruta por objetivo no produzca resultados suficientes, incluyendo acciones
  explícitas para limpiar búsqueda, limpiar objetivo o volver al catálogo completo.
- **FR-013**: The system MUST preservar el acceso protegido actual para que solo usuarios aprobados del marketplace puedan ver la nueva experiencia.
- **FR-014**: The system MUST mantener intactos los caminos existentes hacia detalle de app, abrir app web y descargar artefactos.
- **FR-015**: The system MUST funcionar de forma coherente en desktop y mobile, con jerarquía clara y acciones primarias visibles en ambos contextos.
- **FR-016**: The system MUST seguir sintiéndose valioso incluso cuando el número de apps publicadas sea bajo respecto al diseño ideal de vitrinas destacadas.
- **FR-017**: The system MUST poder lanzarse en v1 apoyándose en apps activas ya publicadas y framing curado, sin exigir nuevo contenido bespoke para todas las
  apps antes del rollout.
- **FR-018**: The system MUST permitir volver al estado neutral de catálogo completo desde cualquier ruta guiada o combinación de filtros en una sola acción
  clara, sin alterar automáticamente el significado del contexto activo.
- **FR-019**: The system MUST preservar el estado de búsqueda y objetivo seleccionado al refrescar o compartir la vista para no romper la continuidad del
  descubrimiento, manteniendo la lógica de intersección cuando ambos existan.
- **FR-019A**: The system MUST poder preservar o restaurar el stack curado enfocado dentro de la misma home cuando exista contexto compartido o refresh
  compatible con esa vista.
- **FR-020**: The system MUST mantener una jerarquía consistente entre promesa principal, rutas guiadas, stacks curados y grid de catálogo para que el usuario
  siempre entienda cuál es el siguiente paso.

### Frontend Composition Notes _(mandatory for UI-heavy features)_

- **FC-001**: La shell pública del marketplace conserva la responsabilidad de autenticación y acceso aprobado; la home pública asume la composición de propuesta
  de valor, rutas guiadas, stacks curados, herramientas de búsqueda y catálogo completo.
- **FC-002**: La presentación pública debe descomponerse en piezas reutilizables para hero narrativo, selector de objetivos, rail o grilla de stacks curados,
  señales de valor y catálogo enriquecido, manteniendo separado el contenido guiado del grid general.
- **FC-002A**: La apertura de un stack curado debe resolverse dentro de la misma home mediante una sección dedicada y focalizada, no mediante una ruta
  independiente ni modal en la v1.
- **FC-003**: La búsqueda y la selección de objetivo deben usar un contrato liviano y predecible de estado en URL; cuando ambos existan, la búsqueda refina
  dentro del objetivo activo. Esta fase no requiere wizard, modal de onboarding ni formulario multi-step.
- **FC-004**: Las acciones de buscar, seleccionar objetivo y limpiar contexto deben tratarse como intents independientes para que el usuario pueda combinarlas o
  revertirlas sin ambigüedad, y la recuperación desde cero resultados debe ser explícita, no automática.

### Key Entities _(include if feature involves data)_

- **Ruta de Objetivo**: Camino de descubrimiento orientado a un resultado de negocio, como vender más, lanzar más rápido, validar productos u ordenar operación.
- **Stack Curado**: Agrupación recomendada de apps del marketplace presentada como un sistema de trabajo y no como herramientas aisladas.
- **Señal de Valor**: Texto o distintivo que ayuda al usuario a entender por qué una app o stack es relevante para su contexto actual.
- **Estado de Descubrimiento de Home**: Combinación visible de búsqueda activa, objetivo seleccionado, stack enfocado opcional y vista neutral del catálogo
  completo, donde la búsqueda refina dentro del objetivo cuando ambos coexisten.

### Core Operations _(include if feature involves server behavior)_

- **ConstruirHomeGuiadaDelMarketplace**: Entregar la experiencia inicial de la vitrina pública combinando apps activas con narrativa, rutas y stacks destacados
  definidos en configuración versionada.
- **ResolverDescubrimientoPorObjetivoYBusqueda**: Determinar qué apps y secciones deben resaltarse cuando existe un objetivo activo, una búsqueda o ambos,
  aplicando una lógica de intersección y recuperación explícita si no hay resultados.
- **ResolverStacksCuradosVisibles**: Seleccionar y ordenar los stacks destacados que se muestran antes del catálogo completo a partir de la curaduría fija en
  código de la v1.

### Access & Audit Notes _(include if feature involves protected data or admin actions)_

- **Roles**: La experiencia sigue siendo exclusiva para usuarios aprobados del marketplace; la administración y publicación de apps permanece en los flujos
  existentes del panel.
- **States**: Solo deben destacarse apps activas y publicadas; la home debe tolerar mezclas entre apps con storefront enriquecido y apps con presentación
  legacy.
- **Audit Events**: Esta feature no introduce nuevas decisiones administrativas; si se mide el descubrimiento, esa medición debe servir para evaluar uso de
  rutas y stacks sin alterar el modelo de auditoría existente.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: En pruebas con usuarios aprobados de primera visita, al menos el 85% identifica una ruta de inicio relevante en menos de 30 segundos desde que
  entra al marketplace.
- **SC-002**: Al menos el 80% de usuarios de primera visita llega a un stack curado o a un detalle de app en dos interacciones o menos.
- **SC-003**: Al menos el 90% de usuarios evaluados puede describir correctamente, después de una sola visita, tres o más tipos de resultados que el marketplace
  ayuda a resolver.
- **SC-004**: El marketplace mantiene una experiencia de descubrimiento coherente y con un siguiente paso claro incluso cuando hay menos de 10 apps publicadas.
- **SC-005**: Las consultas de soporte o confusión equivalentes a "no sé por dónde empezar" se reducen en al menos 30% durante los primeros 30 días posteriores
  al lanzamiento.

## Assumptions

- Se reutiliza el acceso aprobado actual del marketplace y la lista existente de apps activas publicadas.
- La primera versión usa una curaduría fija en código para objetivos, stacks y orden de aparición, sin requerir un nuevo flujo administrativo de authoring o
  configuración dinámica.
- Una misma app puede participar en más de una ruta o stack si aporta valor a distintos resultados de negocio.
- La personalización por historial del usuario, rol comercial o comportamiento previo queda fuera del alcance inicial.
- Los detalles de app existentes siguen siendo la fuente principal para profundizar, abrir apps web o descargar artefactos.
- Si una app no tiene storefront enriquecido completo, la home usará fallbacks seguros de contenido en vez de bloquear su descubrimiento.
- La primera entrega prioriza orientación, claridad y sensación de valor percibido; rankings complejos, recomendaciones personalizadas y comparativas profundas
  entre apps quedan fuera de alcance.
