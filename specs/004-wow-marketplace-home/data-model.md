# Data Model: Home wow del marketplace orientada a resultados

## Persistent Model Impact

No se planean cambios de Prisma, nuevas tablas, nuevos enums ni migraciones en la v1. La feature reutiliza las apps activas ya publicadas, sus media asociados y
la lógica actual de fallback de storefront en detalle.

## Existing Data Reused

### MarketplaceApp (existing)

Representa la unidad base del catálogo publicado.

**Fields reused in this feature**:

- `id`
- `slug`
- `name`
- `summary`
- `access_mode`
- `status`
- `published_at`

**Role in this feature**:

- Sigue siendo la fuente de verdad de qué apps están activas y pueden aparecer en la home.
- Su contenido básico alimenta tanto el catálogo completo como las referencias dentro de stacks curados.

### MarketplaceAppMedia / Published storefront fallback (existing)

Representan iconos, screenshots y storefront publicado existentes que ya alimentan la capa pública actual.

**Role in this feature**:

- Permiten mostrar iconos y señales visuales seguras en el catálogo y los stacks.
- Cuando falten assets enriquecidos, la home debe degradar con fallbacks existentes sin romper el layout.

### PublishedMarketplaceAppCard (existing response DTO)

Es el shape ya devuelto por `CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS`.

**Fields reused**:

- `id`
- `slug`
- `name`
- `summary`
- `access_mode`
- `icon_url`
- `screenshot_count`

**Role in this feature**:

- Es la unidad de render principal para catálogo completo y referencias de app dentro de stacks curados.

## New Derived / Code-Configured Entities

### GoalRouteDefinition (new, code-config)

Define una ruta de descubrimiento orientada a resultado de negocio.

**Planned fields**:

- `id` (`sell_more`, `launch_faster`, `validate_products`, `order_operations`)
- `label`
- `headline`
- `supporting_copy`
- `stack_ids[]`
- `sort_order`
- `fallback_goal_ids[]` (optional)

**Validation rules**:

- Deben existir exactamente las cuatro rutas canónicas definidas por la spec para la v1.
- `id` y `sort_order` deben ser únicos.
- Toda referencia en `stack_ids[]` debe apuntar a un stack definido en la misma configuración.

### CuratedStackDefinition (new, code-config)

Define un stack editorial curado para la home pública.

**Planned fields**:

- `id`
- `title`
- `result_statement`
- `context_statement`
- `next_step_label`
- `goal_ids[]`
- `app_ids[]`
- `supporting_signals[]`
- `sort_order`

**Validation rules**:

- `id` y `sort_order` deben ser únicos.
- Cada stack debe tener al menos un `app_id`.
- Un stack puede pertenecer a más de un objetivo.
- Si alguna app configurada ya no está activa, el stack debe degradar con elegancia sin romper la home.

### MarketplaceHomeDiscoveryState (new, URL state)

Representa el contexto visible actual del usuario dentro de la misma home.

**Planned fields**:

- `goal_id` (optional)
- `search_query` (optional)
- `stack_focus_id` (optional)

**Validation rules**:

- `goal_id` solo puede tomar uno de los objetivos canónicos.
- `stack_focus_id` solo puede tomar un stack definido en configuración.
- `search_query` se normaliza y se usa como refinamiento del objetivo activo cuando ambos coexisten.
- Cero resultados no resetea el estado automáticamente; la recuperación debe ser explícita.

### MarketplaceHomeViewModel (new, derived response model)

Representa la carga final que la ruta pública entrega a la home guiada.

**Planned fields**:

- `hero`
- `goals[]` con estado activo
- `visible_stacks[]`
- `focused_stack` (optional)
- `catalog_apps[]`
- `recovery_actions[]`
- `total_visible_apps`

**Validation rules**:

- Debe poder renderizarse de forma coherente con catálogo bajo, con catálogo filtrado y con cero resultados.
- Debe preservar la jerarquía entre propuesta de valor, objetivos, stacks y catálogo completo.

## Discovery State Transitions

```text
Neutral -> Goal selected
Neutral -> Search active
Goal selected -> Goal + Search active
Goal selected -> Focused stack
Goal + Search + 0 results -> Recovery actions visible
Any guided state -> Neutral catalog (explicit reset)
```

## Validation Matrix

### Goal route is valid when

- Its id matches one of the four canonical goals.
- It references at least one defined stack.
- Its visible copy is present in code configuration.

### Curated stack is valid when

- It references one or more apps.
- Its app references can be intersected against active published apps safely.
- It exposes result, context, and next-step signals.

### Discovery state is valid when

- Search refines inside the active goal when both exist.
- Stack focus stays inside the same route/home surface.
- Zero-result states expose explicit recovery paths.

## Migration Impact

- No `prisma/schema.prisma` changes.
- No new migrations.
- No new seed data.
- No new audit enums required for v1.
