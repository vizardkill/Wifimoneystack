# Route Contracts: Authoring avanzado de vitrinas de apps 003

All affected routes must:

- resolve user from the session token
- enforce `ADMIN` / `SUPERADMIN` access for admin authoring routes
- enforce approved marketplace access for public detail routes
- dynamically import server controllers only from `app/core/marketplace/marketplace.server.ts`

## Route: /dashboard/marketplace/apps

Source: [app/routes/dashboard/marketplace/apps.tsx](app/routes/dashboard/marketplace/apps.tsx)

**Loader contract**:

- continue listing app catalog entries for admins
- may include storefront draft/public status indicators to help admins identify which apps still need enrichment

**Action contract**:

- keep current publish/unpublish behavior for app operational status
- storefront publication remains a separate workflow from app activation/inactivation

## Route: /dashboard/marketplace/apps/new

Source: [app/routes/dashboard/marketplace/apps/new.tsx](app/routes/dashboard/marketplace/apps/new.tsx)

**Action contract**:

- continue creating the base app record
- redirect newly created apps to `/dashboard/marketplace/apps/:appId/edit` so authoring starts immediately

## Route: /dashboard/marketplace/apps/:appId/edit

Source: [app/routes/dashboard/marketplace/apps/$appId.edit.tsx](app/routes/dashboard/marketplace/apps/$appId.edit.tsx)

**Loader contract**:

- return one authoring workspace payload containing:
  - app identity and operational status
  - draft storefront content
  - published storefront content, if present
  - readiness status and missing requirements
  - active language catalog plus selected draft languages
  - raw media asset library plus the draft storefront media selection

**UI contract**:

- present a sectioned workspace for basic app data, storefront content, developer profile, languages, media, readiness, and preview
- distinguish clearly between draft state and currently published storefront state
- allow previewing the draft without changing the public storefront

**Action contract**:

- `intent=save_basic`: update base app fields still owned by `MarketplaceApp`
- `intent=save_storefront_draft`: persist storefront scalar content and language selections
- `intent=prepare_media_upload`: return signed upload metadata for icon/screenshot files
- `intent=register_media`: register uploaded icon/screenshot assets or an external video URL and optionally attach to the draft storefront
- `intent=remove_media`: remove a raw asset or detach it from the draft storefront, depending on final UI behavior
- `intent=reorder_media`: persist the draft storefront media order
- `intent=publish_storefront`: replace the published storefront with the current ready draft

**Error contract**:

- incomplete draft publication attempt -> validation failure with explicit missing requirements
- invalid language code -> validation failure
- unauthorized actor -> redirect or forbidden response consistent with current admin routes
- storage preparation failure -> actionable error message without corrupting draft state

## Route: /marketplace/apps/:appId

Source: [app/routes/marketplace/apps/$appId.tsx](app/routes/marketplace/apps/$appId.tsx)

**Loader contract**:

- keep current authentication and approved-access enforcement
- return `presentation_mode` plus either a published storefront payload or the legacy fallback payload

**UI contract**:

- when `presentation_mode=STOREFRONT`, render the enriched storefront with developer info, languages, support block when present, ordered media, and optional
  video
- when `presentation_mode=LEGACY`, preserve the existing detail experience
- never expose an incomplete draft to the user-facing route

## Route: /marketplace

Source: [app/routes/marketplace/\_index.tsx](app/routes/marketplace/_index.tsx)

**Loader/UI impact**:

- no route shape change is required for this feature
- any future storefront badges or listing-card enhancements must remain backward compatible for apps still using legacy fallback
