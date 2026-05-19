# Core Contracts: Home wow del marketplace 004

Route modules must dynamically import only barrel exports from core modules.

## Module: app/core/marketplace

Public entry point: [app/core/marketplace/marketplace.server.ts](app/core/marketplace/marketplace.server.ts)

### CLS_ListPublishedMarketplaceApps (reused)

**Purpose**: Seguir siendo la fuente server-side de apps activas para la home guiada y el catálogo completo del marketplace.

**Input contract**:

- `user_id`
- optional `search`
- optional `access_mode`
- optional `page`
- optional `per_page`

**Feature-specific behavior contract**:

- Mantiene la verificación de acceso aprobado del usuario.
- Sigue excluyendo apps `DRAFT` e `INACTIVE`.
- Sigue resolviendo `icon_url` y `screenshot_count` para cada app publicada.
- La home wow puede reutilizarlo con un `per_page` suficiente para construir la superficie de descubrimiento sin requerir un nuevo controller en la v1.

### CLS_GetMarketplaceApp (preserved)

**Purpose**: Mantener el detalle actual de app como destino de profundización desde la home wow.

**Feature-specific behavior contract**:

- Conserva el fallback entre `LEGACY` y `STOREFRONT` ya existente.
- No cambia el contrato de detalle ni el registro de `DETAIL_VIEW`.

### CLS_RecordMarketplaceAppUse / CLS_RecordMarketplaceAppDownload (preserved)

**Purpose**: Mantener las acciones actuales de uso web y descarga como continuación natural del journey iniciado en la home rediseñada.

**Feature-specific behavior contract**:

- No cambian las validaciones de acceso aprobado.
- No cambian los redirects o respuestas de descarga existentes.

## No New Core Command Service in v1

This feature does **not** introduce a new `CLS_*` controller or new `CONFIG_*` namespace in the core marketplace module for v1.

**Reason**:

- La curaduría es fija en código.
- La feature añade composición editorial y lógica de descubrimiento, no nuevas mutaciones protegidas ni persistencia nueva.
- La ruta pública puede orquestar el servicio existente y delegar la lógica de objetivos/stacks a helpers puros del módulo público.

## UI-layer Discovery Config Contract (non-core)

Planned location: `app/modules/marketplace/public/home/lib/curated-marketplace-home.config.ts`

**Purpose**: Definir objetivos, stacks, orden y copy editorial de la home wow.

**Contract**:

- Exporta las cuatro rutas canónicas de la v1.
- Exporta stacks curados con ids estables, copy de resultado, copy de contexto, siguiente paso y referencias de apps.
- Debe ser consumible por helpers puros y por componentes del módulo `public/home`.

This config is intentionally outside `app/core/marketplace/` because it represents UI curation, not business persistence or protected server-side command logic.
