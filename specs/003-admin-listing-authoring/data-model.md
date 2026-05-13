# Data Model: Authoring avanzado de vitrinas de apps

## Enum Updates

### MarketplaceStorefrontVersionKind

Planned values:

- `DRAFT`
- `PUBLISHED`

Purpose: represent the mutable authoring draft and the stable public storefront separately for each app.

### MarketplaceStorefrontReadinessStatus

Planned values:

- `INCOMPLETE`
- `READY`

Purpose: persist the current readiness result of a storefront version after each save or media/language change.

### MarketplaceAuditAction

Planned additions:

- `APP_STOREFRONT_DRAFT_SAVED`
- `APP_STOREFRONT_PUBLISHED`
- `APP_STOREFRONT_MEDIA_UPDATED`

Purpose: distinguish storefront content changes from app activation/deactivation and generic app updates.

## Entity Updates and Additions

### MarketplaceApp (existing)

Represents the operational catalog record.

**Fields kept in scope**:

- `id`
- `slug`
- `name`
- `summary`
- `description`
- `instructions`
- `access_mode`
- `status` (`DRAFT` | `ACTIVE` | `INACTIVE`)
- `web_url`
- `published_at`
- `created_by_user_id`
- `updated_by_user_id`
- `created_at`
- `updated_at`

**Role in this feature**:

- Remains the source of truth for app identity, access mode, and operational availability.
- Legacy `summary` / `description` / `instructions` remain as fallback content while an app has no published enriched storefront.
- App operational status stays independent from storefront readiness/publication.

### MarketplaceAppStorefrontVersion (new)

Represents authored storefront content for one app and one version kind.

**Planned fields**:

- `id`
- `app_id`
- `kind` (`DRAFT` | `PUBLISHED`)
- `readiness_status` (`INCOMPLETE` | `READY`)
- `summary`
- `description`
- `instructions`
- `developer_name`
- `developer_website`
- `support_email` (nullable)
- `support_url` (nullable)
- `created_by_user_id`
- `updated_by_user_id`
- `published_at` (nullable, populated for `PUBLISHED`)
- `created_at`
- `updated_at`

**Validation rules**:

- `DRAFT` versions may be partial.
- `READY` requires summary, description, instructions, developer name, developer website, at least one selected language, exactly one icon asset, and at least
  one screenshot asset.
- `developer_website` and `support_url` should be valid HTTPS URLs.
- There is at most one `DRAFT` and one `PUBLISHED` version per app (`@@unique([app_id, kind])`).

### MarketplaceLanguageCatalog (new)

Represents the controlled catalog of selectable languages.

**Planned fields**:

- `code` (stable identifier, e.g. ISO-like code)
- `label`
- `sort_order`
- `is_active`
- `created_at`
- `updated_at`

**Validation rules**:

- The catalog is seeded and only active entries can be selected in authoring.
- Removing a language from the catalog should happen by deactivation, not hard deletion, to protect historical storefront versions.

### MarketplaceAppStorefrontVersionLanguage (new)

Join entity between storefront versions and supported languages.

**Planned fields**:

- `id`
- `storefront_version_id`
- `language_code`
- `sort_order`
- `created_at`
- `updated_at`

**Validation rules**:

- `@@unique([storefront_version_id, language_code])`
- Every selected language must reference an active `MarketplaceLanguageCatalog` row.
- Readiness requires at least one language on the `DRAFT` version.

### MarketplaceAppMedia (existing, updated)

Represents raw visual assets associated with an app.

**Current fields in scope**:

- `id`
- `app_id`
- `type` (`ICON` | `SCREENSHOT` | `VIDEO`)
- `storage_key`
- `public_url`
- `alt_text`
- `sort_order`
- `created_at`
- `updated_at`

**Planned update**:

- Support icon/screenshots as storage-backed assets.
- Support video as an external URL in MVP, with schema adjustments as needed so video records do not rely on a fake object-storage path.
- Raw assets remain app-scoped and can be reused by multiple storefront versions for the same app.

### MarketplaceAppStorefrontVersionMedia (new)

Join entity between a storefront version and the raw assets chosen for that version.

**Planned fields**:

- `id`
- `storefront_version_id`
- `media_id`
- `sort_order`
- `created_at`
- `updated_at`

**Validation rules**:

- `@@unique([storefront_version_id, media_id])`
- All referenced media must belong to the same app as the storefront version.
- Each storefront version can include at most one icon.
- Screenshots are ordered and readiness requires at least one screenshot.
- Video remains optional and does not count toward the screenshot minimum.

### MarketplaceAuditEvent (existing, updated)

Immutable log of protected marketplace/admin actions.

**Feature-specific actions**:

- `APP_STOREFRONT_DRAFT_SAVED`
- `APP_STOREFRONT_PUBLISHED`
- `APP_STOREFRONT_MEDIA_UPDATED`
- Existing app publication actions remain unchanged (`APP_PUBLISHED`, `APP_UNPUBLISHED`).

### StorefrontAuthoringSnapshot (derived response model)

Non-persistent response model returned by the admin authoring loader.

**Fields required**:

- app identity and operational status
- legacy fallback fields
- draft storefront scalar fields
- published storefront scalar fields (if present)
- selected draft languages
- media asset library for the app
- media assigned to the draft storefront in display order
- readiness status and list of missing requirements

## State Transitions

### App Operational Status (unchanged)

```text
DRAFT -> ACTIVE
ACTIVE -> INACTIVE
INACTIVE -> ACTIVE
```

This state controls marketplace availability and remains independent from storefront publication.

### Storefront Readiness

```text
DRAFT/INCOMPLETE -> DRAFT/READY
DRAFT/READY -> DRAFT/INCOMPLETE   # if required content is removed later
```

### Storefront Publication

```text
No published storefront + DRAFT/INCOMPLETE -> public uses LEGACY detail
No published storefront + DRAFT/READY      -> public still uses LEGACY detail until confirm
PUBLISHED/READY + DRAFT/INCOMPLETE         -> public keeps current PUBLISHED version
PUBLISHED/READY + DRAFT/READY              -> public keeps current PUBLISHED version until confirm replaces it
```

Publication rule:

- Confirming publication copies or promotes the current ready draft into the `PUBLISHED` version without changing app operational status.

## Validation Matrix for Readiness

A storefront draft is `READY` only when all of the following are present:

- icon selected
- summary present
- description present
- instructions present
- developer name present
- developer website present
- at least one selected language from the catalog
- at least one screenshot selected

Optional but supported:

- support email
- support URL
- video asset

## Index and Migration Impact

Planned Prisma changes in `prisma/schema.prisma`:

- Add `MarketplaceStorefrontVersionKind` enum.
- Add `MarketplaceStorefrontReadinessStatus` enum.
- Extend `MarketplaceAuditAction` with storefront-specific actions.
- Add table `MarketplaceAppStorefrontVersion` with unique key on `[app_id, kind]`.
- Add table `MarketplaceLanguageCatalog` with seeded data.
- Add table `MarketplaceAppStorefrontVersionLanguage` with unique key on `[storefront_version_id, language_code]`.
- Add table `MarketplaceAppStorefrontVersionMedia` with unique key on `[storefront_version_id, media_id]` and ordering index.
- Adjust `MarketplaceAppMedia` as needed to represent external video URLs cleanly in MVP.

Suggested indexes:

- `MarketplaceAppStorefrontVersion(app_id, kind, readiness_status)`
- `MarketplaceAppStorefrontVersionMedia(storefront_version_id, sort_order)`
- `MarketplaceAppStorefrontVersionLanguage(storefront_version_id, sort_order)`
- `MarketplaceAuditEvent(action, created_at)` to support storefront audit queries

New tables are required for this feature.
