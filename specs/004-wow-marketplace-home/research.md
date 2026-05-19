# Phase 0 Research: Home wow del marketplace orientada a resultados

## Decision: Mantener la curaduría de objetivos y stacks fija en código durante la v1

**Rationale**: La spec aclarada define que las rutas por objetivo y los stacks curados se mantienen en configuración versionada. Esto permite lanzar la nueva
home sin abrir un flujo administrativo adicional ni introducir nuevos modelos persistidos para editar narrativa, orden o agrupaciones.

**Alternatives considered**: Guardar la curaduría en base de datos sin UI fue descartado porque añade complejidad operativa y sincronización sin un beneficio
claro en la v1. Crear authoring admin para objetivos y stacks fue descartado porque expande el alcance hacia tooling interno en vez de mejorar el descubrimiento
del usuario final.

## Decision: Resolver la experiencia guiada dentro de `/marketplace` con estado en URL y sin crear una ruta nueva para stacks

**Rationale**: La spec ya cerró que el stack curado se abre dentro de la misma home con scroll o anchor y foco visual. Mantener un solo punto de entrada
preserva el flujo mental del usuario, evita duplicar loaders y hace más simple compartir contexto con query params como `goal`, `search` y `stack_focus`.

**Alternatives considered**: Crear rutas dedicadas por stack fue descartado porque introduce más navegación, más contratos y más superficie de mantenimiento
para una experiencia editorial que en v1 debe sentirse integrada a la home. Usar modal o drawer fue descartado porque complica mobile, historial del navegador y
URLs compartibles.

## Decision: Reutilizar `CLS_ListPublishedMarketplaceApps` como fuente de datos y mover la curaduría a helpers puros del módulo público

**Rationale**: El servicio actual ya resuelve control de acceso aprobado, listado de apps activas, iconos resueltos y metadatos básicos del catálogo. La nueva
feature añade composición narrativa y filtrado por objetivos, no una nueva frontera de persistencia ni una mutación protegida. Por eso, la mejor frontera para
v1 es ruta + helper puro del módulo público, sin un nuevo controller del core.

**Alternatives considered**: Crear un nuevo `CLS_GetMarketplaceHomeExperience` fue descartado para v1 porque duplicaría comportamiento del listado publicado y
empujaría al core decisiones que hoy son puramente editoriales y fijas en código. Importar DB classes directo desde la ruta fue descartado por la constitución y
por el patrón actual del repositorio.

## Decision: Convertir la home guiada en una superficie de descubrimiento sin paginación visible durante la v1

**Rationale**: El design system del marketplace ya define la vitrina sin paginación en MVP. Además, la experiencia guiada necesita ver el conjunto activo para
resolver objetivos, stacks y el catálogo completo bajo la lógica de intersección entre objetivo y búsqueda. A escala de v1, pedir el conjunto activo dentro de
un tamaño acotado razonable es suficiente y simplifica la UX.

**Alternatives considered**: Mantener la paginación visible actual fue descartado porque rompe la continuidad entre hero, objetivos, stacks y catálogo, y
complica la semántica de búsqueda dentro de un objetivo. Hacer fallback automático a otra página del catálogo cuando no hay coincidencias fue descartado porque
la spec exige recuperación explícita, no implícita.

## Decision: Preservar intactos los contratos actuales de detalle, uso y descarga de apps

**Rationale**: La propuesta wow afecta el descubrimiento y el framing comercial de la home, pero no cambia el hecho de que una app activa debe abrir su detalle
actual, registrar uso y descargar artefactos con las protecciones existentes. Mantener estas rutas estables reduce riesgo y evita mezclar descubrimiento con
cambios operativos.

**Alternatives considered**: Introducir CTAs nuevas que salten directo a la app o a la descarga desde la home fue descartado porque podría saltarse contexto
importante del detalle y complicar la trazabilidad del journey. Cambiar el detalle o el fallback storefront en la misma feature fue descartado por alcance.

## Decision: Implementar la nueva UI en un submódulo `app/modules/marketplace/public/home/` y reutilizar `public/catalog/`

**Rationale**: El módulo público del marketplace ya separa `catalog` y `detail`. La home guiada agrega una capa editorial con hero, selector de objetivos,
stacks y secciones de recuperación, por lo que merece un subdominio propio que no contamine `catalog/` con lógica contextual. `AppCard` y `AppGrid` siguen
siendo piezas reutilizables del catálogo.

**Alternatives considered**: Incrustar toda la UI nueva en `app/routes/marketplace/_index.tsx` fue descartado por la regla constitucional de rutas delgadas.
Mezclar hero, objetivos y stacks dentro de `catalog/` fue descartado porque `catalog/` debe seguir siendo reutilizable y contexto-agnóstico.

## Decision: Validar la feature con `typecheck`, `lint:strict`, `format:check` y quickstart manual porque el repo no tiene runner de tests activo

**Rationale**: El repositorio contiene archivos de tests de ruta e integración, pero hoy están documentados como placeholders y no existe script de `test` ni
dependencia activa de Vitest/Jest en `package.json`. La forma coherente de entregar la v1 sin expandir alcance es usar la batería estándar de validación del
repo más un quickstart manual detallado.

**Alternatives considered**: Instalar Vitest/Supertest como parte de esta feature fue descartado porque el valor principal está en el rediseño público del
marketplace y no en abrir una nueva iniciativa de infraestructura de tests. Omitir por completo escenarios de prueba fue descartado por la constitución y por el
riesgo de regresión en la ruta pública.
