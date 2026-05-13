# Quickstart: Authoring avanzado de vitrinas de apps (Feature 003)

## Prerequisites

- Node >= 22.15.0
- PostgreSQL available for Prisma runtime
- Environment files configured for app server
- Object storage environment configured for the existing storage service and media proxy

## Setup

1. Install dependencies.
2. Ensure database and storage environment variables are set.
3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Apply migrations and seed the controlled language catalog after implementation.
5. Start development server:

```bash
npm run dev
```

## Manual Validation Flow

1. Sign in as `ADMIN` or `SUPERADMIN` and open `/dashboard/marketplace/apps`.
2. Create a new app from the admin apps module or reuse an existing app, then open its edit workspace.
3. Verify the authoring workspace groups content into clear sections: basic identity, storefront content, developer, languages, media, readiness, and preview.
4. Save a partial draft with missing required content and verify the page shows the draft as incomplete plus a list of missing requirements.
5. Confirm that editing the incomplete draft does not alter the public detail page when the app already has a published storefront.
6. Select one or more languages from the controlled catalog and verify there is no free-text language entry path.
7. Upload an icon and at least one screenshot through the authoring media flow, then reorder screenshots and confirm the preview reflects the new order.
8. Add an optional video URL and verify preview renders it without requiring binary upload.
9. Attempt to publish a draft that is missing a required block and verify the action is blocked with clear validation feedback.
10. Complete the required storefront fields, publish the storefront, and verify `/marketplace/apps/:appId` now renders the enriched storefront experience.
11. Edit the draft again after publication, remove a required screenshot, save, and verify the public page continues showing the last published storefront until
    a new ready draft is confirmed.
12. Open an active app that still has no published storefront and verify the public marketplace continues to render the legacy detail view.
13. Verify audit records exist for storefront draft saves, storefront publication, and storefront media updates.

## Validation Commands

```bash
npm run typecheck
npm run lint:strict
npm run format:check
```

## Expected Results

- Admins can save partial storefront drafts without affecting the currently visible public storefront.
- Storefront readiness clearly explains which required blocks are still missing.
- Languages are selected only from the controlled catalog.
- Icon and screenshot media uploads are registered successfully and preserve display order.
- Optional videos use external URLs and do not block publication.
- Public detail pages render the enriched storefront only after explicit storefront publication.
- Active apps without a published storefront continue using the existing legacy detail page.
- Storefront-affecting admin actions remain auditable.
