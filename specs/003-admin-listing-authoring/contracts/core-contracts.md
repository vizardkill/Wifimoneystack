# Core Contracts: Authoring avanzado de vitrinas de apps 003

Route modules must dynamically import only barrel exports from core modules.

## Module: app/core/marketplace

Public entry point: [app/core/marketplace/marketplace.server.ts](app/core/marketplace/marketplace.server.ts)

### CLS_GetMarketplaceAppAuthoring (new)

**Purpose**: Return the complete admin authoring workspace payload for one app.

**Input contract**:

- `app_id`
- `actor_user_id` (must be `ADMIN` or `SUPERADMIN`)

**Output contract**:

- app identity and operational status
- legacy fallback content currently stored on `MarketplaceApp`
- draft storefront version payload
- published storefront version payload, if present
- available raw media assets for the app
- draft storefront media selection in display order
- active language catalog plus selected draft languages
- readiness status and missing requirements list

**Dependencies**:

- `MarketplaceAppDB`
- `AppStorefrontVersionDB`
- `AppStorefrontVersionMediaDB`
- `AppStorefrontVersionLanguageDB`
- `LanguageCatalogDB`
- `AppMediaDB`

### CLS_SaveMarketplaceAppStorefrontDraft (new)

**Purpose**: Persist scalar storefront draft content and recalculate readiness.

**Input contract**:

- `app_id`
- `actor_user_id`
- `summary`
- `description`
- `instructions`
- `developer_name`
- `developer_website`
- optional `support_email`
- optional `support_url`
- selected `language_codes[]`

**Behavior contract**:

- upsert the `DRAFT` storefront version for the app
- replace draft language membership atomically
- recompute readiness and missing requirements after every save
- write `APP_STOREFRONT_DRAFT_SAVED` audit event

### CLS_PublishMarketplaceAppStorefront (new)

**Purpose**: Promote a ready draft storefront to the stable public storefront.

**Input contract**:

- `app_id`
- `actor_user_id`

**Behavior contract**:

- refuse publication when draft readiness is not `READY`
- replace the `PUBLISHED` storefront version with the current draft content, language set, and media assignment
- keep `MarketplaceApp.status` unchanged
- write `APP_STOREFRONT_PUBLISHED` audit event

### CLS_PrepareMarketplaceAppMediaUpload (new)

**Purpose**: Return signed upload metadata for icon and screenshot assets.

**Input contract**:

- `app_id`
- `actor_user_id`
- `media_type` (`ICON` | `SCREENSHOT`)
- `file_name`
- `content_type`
- `size_bytes`

**Behavior contract**:

- allow only admin-capable actors
- issue signed upload data scoped to the dedicated marketplace media folder
- reject unsupported file types or oversized payloads according to final validation rules

**Dependencies**:

- storage service in `app/lib/services/_storage.service.ts`

### CLS_RegisterMarketplaceAppMedia (new)

**Purpose**: Persist a raw media asset after upload and optionally attach it to the draft storefront.

**Input contract**:

- `app_id`
- `actor_user_id`
- `media_type` (`ICON` | `SCREENSHOT` | `VIDEO`)
- uploaded storage metadata for icon/screenshots or external video URL for `VIDEO`
- optional `alt_text`
- optional `attach_to_draft`

**Behavior contract**:

- create or update a raw `MarketplaceAppMedia` record
- attach the asset to the draft storefront when requested
- recalculate readiness if draft media selection changed
- write `APP_STOREFRONT_MEDIA_UPDATED` audit event

### CLS_RemoveMarketplaceAppMedia / CLS_ReorderMarketplaceAppStorefrontMedia (new)

**Purpose**: Manage the draft storefront media selection without mutating the published storefront.

**Behavior contract**:

- only affect the `DRAFT` storefront version
- preserve public storefront media until a new publication is confirmed
- trigger readiness recalculation when required assets are removed or order changes

### CLS_GetMarketplaceApp (updated)

**Purpose**: Return the public app detail payload for approved marketplace users.

**Updated output contract**:

- `presentation_mode`: `LEGACY` or `STOREFRONT`
- current app identity/access behavior
- if `STOREFRONT`, published storefront fields (developer profile, languages, support, ordered media)
- if `LEGACY`, existing summary/description/instructions/media fallback payload
- `has_active_artifact` remains part of the contract

**Behavior contract**:

- require approved marketplace access as today
- if app is not `ACTIVE`, return not found/unavailable
- use published storefront only when one exists; otherwise return the legacy app detail payload

### CLS_UpsertMarketplaceApp (existing, constrained)

**Purpose**: Keep basic app identity/access mode editing separate from storefront versioning.

**Feature-specific contract**:

- continues owning `name`, `slug`, `access_mode`, `web_url`, and legacy fallback fields
- must not overwrite the published storefront version while admins edit a new draft

## CONFIG Namespace Updates

Planned updates in [app/lib/types/\_marketplace.types.ts](app/lib/types/_marketplace.types.ts):

- Add `CONFIG_GET_MARKETPLACE_APP_AUTHORING`
- Add `CONFIG_SAVE_MARKETPLACE_APP_STOREFRONT_DRAFT`
- Add `CONFIG_PUBLISH_MARKETPLACE_APP_STOREFRONT`
- Add `CONFIG_PREPARE_MARKETPLACE_APP_MEDIA_UPLOAD`
- Add `CONFIG_REGISTER_MARKETPLACE_APP_MEDIA`
- Add draft-media reorder/remove response namespaces as needed
- Extend `CONFIG_GET_MARKETPLACE_APP` with `presentation_mode`, developer info, languages, support info, and ordered storefront media payload
