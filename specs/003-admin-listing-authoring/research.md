# Phase 0 Research: Authoring avanzado de vitrinas de apps

## Decision: Model storefront content as separate draft/public versions instead of editing MarketplaceApp content directly

**Rationale**: The specification now requires a stable public storefront while admins edit a new draft. Existing `MarketplaceApp` fields (`summary`,
`description`, `instructions`) are rendered directly in the public detail flow, so mutating them in place would leak incomplete edits. A dedicated storefront
version model allows one mutable draft and one published version per app.

**Alternatives considered**: Extending `MarketplaceApp` with more storefront fields was rejected because it cannot preserve a stable public version during
edits. Storing storefront payloads in an opaque JSON blob was rejected because readiness, media ordering, and language selection need explicit persisted
structure.

## Decision: Keep app operational status separate from storefront readiness/publication

**Rationale**: The current marketplace already uses `MarketplaceApp.status` (`DRAFT`/`ACTIVE`/`INACTIVE`) to control catalog availability. The new storefront
feature adds content readiness and explicit storefront publication, but active apps without a published enriched storefront must still fall back to the current
legacy detail page. This requires two independent concepts: app operational status and storefront publication state.

**Alternatives considered**: Reusing `MarketplaceApp.status` as the only storefront readiness indicator was rejected because it would force enriched storefront
publication as a prerequisite for app activation and break the rollout requirement.

## Decision: Reuse the existing admin edit route as the authoring workspace

**Rationale**: The admin app list already links to `/dashboard/marketplace/apps/:appId/edit`, and the route pattern for admin app mutations is established
there. Expanding this route into a sectioned authoring workspace preserves navigation, role guards, and existing create -> edit redirect behavior while avoiding
a second parallel admin flow.

**Alternatives considered**: Creating a brand new admin route such as `/dashboard/marketplace/apps/:appId/storefront` was rejected because it adds navigation
overhead and splits a single authoring workflow across multiple surfaces.

## Decision: Use a controlled language catalog with persisted reference data and multi-select membership

**Rationale**: The spec clarifies that supported languages must come from a predefined catalog. A persisted catalog plus a version-language join preserves
consistency, supports deterministic preview badges, and leaves room for future language additions without redesigning storefront content.

**Alternatives considered**: Free-text or comma-separated languages were rejected because they create typos and make readiness validation unreliable. A Prisma
enum-only approach was rejected because adding languages later would require schema changes for every catalog update.

## Decision: Treat optional video as an external URL in MVP, not as a binary upload

**Rationale**: The current UI direction and public detail component already assume embeddable video URLs (for example YouTube). External URLs satisfy the
product need for promotional video without adding heavyweight video upload, transcoding, or large multipart handling.

**Alternatives considered**: Uploading video binaries into object storage was rejected as unnecessary complexity for this iteration. Omitting video entirely was
rejected because the spec explicitly includes optional video support.

## Decision: Reuse the existing storage service/media proxy, but add a dedicated marketplace media folder and explicit asset registration flow

**Rationale**: The repository already contains a GCS-backed storage facade and media proxy, but no complete admin marketplace media upload flow. The best fit is
to prepare signed upload URLs through the marketplace authoring route, upload icon/screenshots directly to object storage, and then register those assets in
`MarketplaceAppMedia` before attaching them to the draft storefront version.

**Alternatives considered**: Reusing unrelated folders such as `branding` was rejected because it mixes domains and complicates future cleanup. Handling all
uploads as server-side multipart requests was rejected because the repo already exposes signed-upload primitives and direct-to-storage uploads scale better for
media assets.

## Decision: Keep instructions as multiline authored content in MVP rather than structured step entities

**Rationale**: The existing app detail component already derives readable bullet lists from multiline `instructions`. Preserving a multiline authoring model
keeps the feature focused on storefront enrichment rather than turning it into a workflow builder.

**Alternatives considered**: Modeling installation steps as separate child records was rejected because it adds data entry overhead and a larger editor surface
without being required by the current specification.

## Decision: Extend the public detail service to resolve either a published storefront or the legacy app detail payload

**Rationale**: Users must see the enriched storefront when it has been explicitly published, but active legacy apps must remain available. Updating
`CLS_GetMarketplaceApp` to return a presentation mode and the appropriate content source keeps this decision server-side and avoids duplicating fallback logic
in routes.

**Alternatives considered**: Branching only in the React component was rejected because routes and tests need a stable contract describing whether the response
is legacy or storefront-backed.

## Decision: Add storefront-specific audit actions for draft saves, storefront publication, and storefront media updates

**Rationale**: The constitution requires protected admin changes that affect public content to be traceable. Existing audit actions cover app activation and
generic updates, but storefront drafts and storefront publication are distinct operational events.

**Alternatives considered**: Reusing only `APP_UPDATED` and `APP_PUBLISHED` was rejected because it would blur the difference between app operational status
changes and storefront content publication.
