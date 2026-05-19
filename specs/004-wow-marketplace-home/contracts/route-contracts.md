# Route Contracts: Home wow del marketplace 004

All protected routes must resolve the current user from project auth/session helpers and must dynamically import server-only marketplace controllers from
`app/core/marketplace/marketplace.server.ts` inside loaders/actions.

## Public/User Routes

### `marketplace/_layout.tsx`

**Loader**: Preserves the existing authentication and `APPROVED` marketplace access gate.

**Rules**:

- Unauthenticated users still redirect to `/login`.
- Non-approved users still redirect to the blocked access state flow.
- The wow home does not loosen existing approval requirements.

### `marketplace/_index.tsx`

**Loader**: Builds the guided marketplace home for approved users by combining active published apps with code-curated discovery metadata.

**Input query params**:

- optional `goal`
- optional `search`
- optional `stack_focus`

**Output**:

- current guided hero payload
- canonical goal routes with active state
- visible curated stacks for the neutral or active-goal state
- optional focused stack section inside the same home
- catalog app cards compatible with existing detail navigation
- explicit recovery actions for zero-result states

**Rules**:

- Search refines inside the active goal when both are present.
- Zero results do not trigger automatic fallback; the user gets explicit recovery actions.
- Stack focus stays in `/marketplace` and never creates a new route in v1.
- The full catalog remains reachable from the same page.
- Detail links continue targeting `/marketplace/apps/:id`.
- Visible pagination is removed from the home in v1; discovery runs on the active app surface returned for current scale.

### `marketplace/apps/$appId.tsx`

**Loader**: Preserves the existing app detail contract and remains the destination when a user drills into an app from hero, goals, stacks or the catalog.

**Rules**:

- Existing storefront fallback behavior stays intact.
- Existing redirects for unavailable or invalid apps stay intact.

### `marketplace/apps/$appId.use.ts`

**Action**: Preserved. Records `WEB_OPEN` and redirects approved users to the app web URL.

### `marketplace/apps/$appId.download.ts`

**Action/Loader**: Preserved. Records `PACKAGE_DOWNLOAD` and returns the authorized download behavior already defined by the current marketplace.
