# Quickstart: Home wow del marketplace (Feature 004)

## Prerequisites

- Node >= 22.15.0
- Environment files configured for the React Router app server
- Existing database populated with marketplace users and active published apps
- At least one user with marketplace access status `APPROVED`

## Setup

1. Install dependencies if needed.
2. Generate Prisma client and route types if this has not been done yet:

```bash
npm run prisma:generate
npx react-router typegen
```

1. Start the development server:

```bash
npm run dev
```

## Manual Validation Flow

1. Sign in with a user whose marketplace access is already `APPROVED`.
2. Open `/marketplace` and verify the first fold is a guided value-proposition experience instead of only title + search + raw grid.
3. Verify the four canonical goals are visible: vender más, lanzar más rápido, validar productos y ordenar operación.
4. Select each goal and confirm the home updates its highlighted discovery context without leaving `/marketplace`.
5. Open a curated stack and verify the page moves focus to a dedicated section within the same home instead of opening a new route or modal.
6. From a goal-selected state, execute a search and confirm results are the intersection of goal + search.
7. Force a zero-result case with goal + search and verify explicit recovery actions exist for limpiar búsqueda, limpiar objetivo o volver al catálogo completo.
8. Reset the context to the neutral catalog and verify the full catalog remains reachable from the same page.
9. Open an app detail from a curated stack and verify `/marketplace/apps/:appId` still renders the current detail experience.
10. Test both a `WEB_LINK` app and a `PACKAGE_DOWNLOAD` app from the redesigned home and confirm their existing use/download routes still work.
11. Verify at least one app with missing enriched storefront content still renders safely in the guided home using fallbacks instead of broken media or empty
    blocks.
12. Repeat the key discovery flow in a narrow mobile viewport and confirm hero, goals, stack focus and catalog remain understandable without hover interactions.
13. Refresh `/marketplace` with query params for `goal`, `search` and `stack_focus` and verify the discovery state restores correctly.

## Validation Commands

```bash
npm run typecheck
npm run lint:strict
npm run format:check
```

## Expected Results

- Approved users land on a marketplace home that communicates value before the catalog.
- Goal selection, search and stack focus coexist in a predictable URL-driven model.
- Curated stacks open inside the same home surface and keep the user oriented.
- The full catalog remains accessible without losing the guided narrative.
- Existing app detail, use and download flows remain intact.
- Apps with partial storefront enrichment degrade safely.
- The feature validates through the repo’s standard checks plus manual journey verification.
