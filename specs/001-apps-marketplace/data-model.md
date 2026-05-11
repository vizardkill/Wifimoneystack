# Data Model: Marketplace de aplicaciones ecommerce

## Enums

### MarketplaceAccessStatus

- `PENDING`: User requested access and awaits admin decision.
- `APPROVED`: User can access active marketplace apps.
- `REJECTED`: User request was denied.
- `REVOKED`: Previously approved user lost access.

### MarketplaceAppStatus

- `DRAFT`: Admin is preparing the listing.
- `ACTIVE`: Listing is visible to approved users.
- `INACTIVE`: Listing is hidden but history is retained.

### MarketplaceAppAccessMode

- `WEB_LINK`: Primary action opens a configured web application URL.
- `PACKAGE_DOWNLOAD`: Primary action downloads or installs an uploaded package.

### MarketplaceMediaType

- `ICON`
- `SCREENSHOT`
- `VIDEO`

### MarketplaceUsageEventType

- `DETAIL_VIEW`
- `WEB_OPEN`
- `PACKAGE_DOWNLOAD`
- `PACKAGE_INSTALL`

### MarketplaceAuditAction

- `ACCESS_REQUESTED`
- `ACCESS_APPROVED`
- `ACCESS_REJECTED`
- `ACCESS_REVOKED`
- `APP_CREATED`
- `APP_UPDATED`
- `APP_PUBLISHED`
- `APP_UNPUBLISHED`
- `APP_MEDIA_UPDATED`
- `APP_ARTIFACT_UPDATED`

## Entities

### User

Existing `User` model remains the auth identity. Marketplace data references it instead of duplicating login credentials.

**Relationships**:

- One user has zero or one `MarketplaceAccessRequest`.
- One user can generate many `MarketplaceUsageEvent` records.
- Admin users can create many `MarketplaceAuditEvent` records as actors.

### MarketplaceAccessRequest

Represents registration evaluation and current access state.

**Fields**:

- `id`: UUID primary key.
- `user_id`: Unique foreign key to `User`.
- `status`: `MarketplaceAccessStatus`, default `PENDING`.
- `company_name`: Optional business/company name.
- `business_url`: Optional ecommerce URL.
- `business_type`: Optional category or segment.
- `request_notes`: Optional applicant notes.
- `decision_reason`: Optional admin reason for rejection/revocation.
- `decided_by_user_id`: Optional admin actor.
- `decided_at`: Optional decision timestamp.
- `revoked_at`: Optional revocation timestamp.
- `created_at`, `updated_at`: Timestamps.

**Validation Rules**:

- One active access request per user.
- New requests start as `PENDING`.
- `APPROVED`, `REJECTED`, and `REVOKED` transitions require an admin actor.
- `REVOKED` is valid only after approval or when an approved account is being blocked.

### MarketplaceApp

Application/tool listing shown in the marketplace.

**Fields**:

- `id`: UUID primary key.
- `slug`: Unique URL-friendly identifier.
- `name`: Required, max 120 chars.
- `summary`: Required short listing copy.
- `description`: Required long description.
- `instructions`: Required usage instructions.
- `access_mode`: `MarketplaceAppAccessMode`.
- `status`: `MarketplaceAppStatus`, default `DRAFT`.
- `web_url`: Required when `access_mode = WEB_LINK`.
- `published_at`: Optional timestamp.
- `created_by_user_id`: Admin creator.
- `updated_by_user_id`: Last admin editor.
- `created_at`, `updated_at`: Timestamps.

**Relationships**:

- Has many `MarketplaceAppMedia`.
- Has zero or one active `MarketplaceAppArtifact` for package mode.
- Has many `MarketplaceUsageEvent`.
- Has many `MarketplaceAuditEvent`.

**Validation Rules**:

- Active apps require name, summary, description, instructions, icon, at least one screenshot, and either `web_url` or an uploaded artifact depending on access
  mode.
- `WEB_LINK` apps require a valid HTTPS URL.
- `PACKAGE_DOWNLOAD` apps require an available artifact before publication.
- Inactive apps stay queryable for history but are hidden from user marketplace lists.

### MarketplaceAppMedia

Metadata for icons, screenshots, and optional videos.

**Fields**:

- `id`: UUID primary key.
- `app_id`: Foreign key to `MarketplaceApp`.
- `type`: `MarketplaceMediaType`.
- `storage_key`: Provider object key or internal path.
- `public_url`: Optional derived URL for safe public media.
- `alt_text`: Optional accessibility text.
- `sort_order`: Integer for gallery order.
- `created_at`, `updated_at`: Timestamps.

**Validation Rules**:

- Published apps require exactly one icon and at least one screenshot.
- Videos are optional.
- Media deletion cannot remove publication requirements while app remains active.

### MarketplaceAppArtifact

Metadata for package ZIP or installable artifact.

**Fields**:

- `id`: UUID primary key.
- `app_id`: Foreign key to `MarketplaceApp`.
- `storage_key`: Provider object key.
- `file_name`: Original file name.
- `mime_type`: Uploaded MIME type.
- `size_bytes`: File size.
- `checksum`: Optional checksum.
- `version_label`: Optional app/package version.
- `is_active`: Boolean.
- `created_by_user_id`: Admin uploader.
- `created_at`, `updated_at`: Timestamps.

**Validation Rules**:

- Only one active artifact per package app.
- Artifact downloads require approved user access at request time.
- Replacing an artifact preserves previous usage history.

### MarketplaceUsageEvent

Immutable event for app detail views, web opens, downloads, and installs.

**Fields**:

- `id`: UUID primary key.
- `app_id`: Foreign key to `MarketplaceApp`.
- `user_id`: Foreign key to `User`.
- `type`: `MarketplaceUsageEventType`.
- `metadata`: Optional JSON for user agent, referrer, artifact version, etc.
- `created_at`: Event timestamp.

**Validation Rules**:

- Events can be created only for approved users.
- Deactivated apps retain historic events.
- Detail view events may be sampled later, but MVP stores them directly.

### MarketplaceAuditEvent

Immutable audit record for admin and protected marketplace decisions.

**Fields**:

- `id`: UUID primary key.
- `actor_user_id`: Admin or system actor.
- `target_user_id`: Optional user affected by access decision.
- `app_id`: Optional app affected by publication/listing decision.
- `action`: `MarketplaceAuditAction`.
- `reason`: Optional admin-visible reason.
- `metadata`: Optional JSON snapshot.
- `created_at`: Event timestamp.

**Validation Rules**:

- Admin approval, rejection, revocation, publication, unpublication, upload/link, and app edits must write audit records.
- Audit write failures are tracked but must not corrupt already-committed main data.

## State Transitions

### Access Request

```text
PENDING -> APPROVED
PENDING -> REJECTED
APPROVED -> REVOKED
REJECTED -> PENDING     # only if re-application is explicitly supported later
REVOKED -> APPROVED     # only via admin reactivation
```

### Marketplace App

```text
DRAFT -> ACTIVE         # requires publication validation
ACTIVE -> INACTIVE      # hidden from user marketplace
INACTIVE -> ACTIVE      # requires publication validation again
ACTIVE -> DRAFT         # not allowed; use INACTIVE for published history
```

## Indexes

- `MarketplaceAccessRequest.user_id` unique.
- `MarketplaceAccessRequest.status`, `created_at` for admin queues.
- `MarketplaceApp.slug` unique.
- `MarketplaceApp.status`, `access_mode`, `created_at` for marketplace/admin lists.
- `MarketplaceUsageEvent.app_id`, `type`, `created_at` for dashboards.
- `MarketplaceUsageEvent.user_id`, `created_at` for user activity.
- `MarketplaceAuditEvent.actor_user_id`, `target_user_id`, `app_id`, `created_at` for traceability.
