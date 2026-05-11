# Route Contracts: Marketplace de aplicaciones ecommerce

All protected routes must resolve the current user from project auth/session helpers and must dynamically import server-only marketplace controllers from
`app/core/marketplace/marketplace.server.ts` inside loaders/actions.

## Public/User Routes

### `auth/signup.tsx`

**Action**: Creates the user identity through existing auth flow and submits marketplace access metadata.

**Input**:

- `first_name`, `last_name`, `email`, `password`
- `company_name`, `business_url`, `business_type`, `request_notes`

**Success**: User is created and access request is `PENDING`; response redirects to an approval-status experience.

**Blocked/Error States**:

- Duplicate email returns validation error.
- Invalid business URL returns validation error.

### `marketplace/_layout.tsx`

**Loader**: Enforces authenticated user and marketplace access status.

**Success**:

- `APPROVED`: render child marketplace routes.
- `PENDING`, `REJECTED`, `REVOKED`: render/redirect to blocked status view without app data.

### `marketplace/_index.tsx`

**Loader**: Lists active apps for approved users.

**Output**:

- Array of active app cards with `id`, `slug`, `name`, `summary`, icon URL, access mode, and primary action label.

**Rules**:

- Inactive/draft apps are excluded.
- No data is returned for non-approved users.

### `marketplace/apps/$appId.tsx`

**Loader**: Returns detail for one active app and records `DETAIL_VIEW`.

**Output**:

- App identity, description, instructions, media gallery, optional video, access mode, primary action availability, and safe action URL.

**Rules**:

- If app becomes inactive, return unavailable state and no primary action.

### `marketplace/apps/$appId.use.ts`

**Action**: Records `WEB_OPEN` and redirects approved user to the configured web URL.

**Rules**:

- Only valid for `WEB_LINK` apps.
- Authorization is checked before redirect.

### `marketplace/apps/$appId.download.ts`

**Action/Loader**: Records `PACKAGE_DOWNLOAD` and returns an authorized download response or short-lived provider URL.

**Rules**:

- Only valid for `PACKAGE_DOWNLOAD` apps with active artifact.
- Authorization is checked at request time.
- Revoked users cannot reuse stale UI actions.

## Admin Routes

### `dashboard/marketplace/_index.tsx`

**Loader**: Returns operational dashboard counts and app usage aggregates.

**Output**:

- User counts by access status.
- New requests count.
- App usage totals by event type.
- Most used apps and apps with no activity.

### `dashboard/marketplace/users.tsx`

**Loader**: Lists access requests with filters by status, search, page, and sort.

**Action**: Approves, rejects, or revokes access.

**Input**:

- `request_id` or `user_id`
- `decision`: `APPROVE`, `REJECT`, `REVOKE`
- optional `reason`

**Rules**:

- Requires admin role.
- Writes audit event with actor and timestamp.

### `dashboard/marketplace/apps.tsx`

**Loader**: Lists apps for administration with status and access mode filters.

**Action**: Activates or deactivates an app.

**Rules**:

- Activation runs publication validation.
- Deactivation hides app from users but preserves history.

### `dashboard/marketplace/apps/new.tsx`

**Action**: Creates a draft or publishable app listing.

**Input**:

- `name`, `summary`, `description`, `instructions`, `access_mode`, `web_url` when needed.

**Rules**:

- Requires admin role.
- Writes audit event.

### `dashboard/marketplace/apps/$appId.edit.tsx`

**Loader**: Returns editable app, media, artifact, and status.

**Action**: Updates listing fields, media metadata, web link, artifact metadata, or status.

**Rules**:

- Active apps cannot be saved into an invalid publication state.
- Artifact and media file handling must persist metadata only after provider upload succeeds.
