# Quickstart: Marketplace de aplicaciones ecommerce

## Prerequisites

- Node >=22.15.0.
- PostgreSQL available through the environment configuration pattern used by this project.
- Environment files aligned with the monolith runtime (`.env`, `.env.dev`, `.env.prod`) and object-storage credentials for package/media uploads.

## Setup

1. Install dependencies using the project package manager.
2. Configure PostgreSQL connection variables for Prisma.
3. Configure object storage for marketplace icons, screenshots, videos, and packages.
4. Generate Prisma client:

```bash
npm run prisma:generate
```

5. Apply the marketplace migration once implementation creates it.
6. Start the development runtime:

```bash
npm run dev
```

## Manual Validation Flow

1. Register a new non-admin user with marketplace request metadata.
2. Confirm the user sees `PENDING` status and cannot access `/marketplace` app data.
3. Sign in as admin and open `/dashboard/marketplace/users`.
4. Approve the pending user and confirm an audit event is created.
5. Create a draft app in `/dashboard/marketplace/apps/new` with name, summary, description, instructions, icon, and screenshot.
6. Configure one app as `WEB_LINK`, activate it, sign in as approved user, open the marketplace list, open detail, and use the app.
7. Configure one app as `PACKAGE_DOWNLOAD`, upload artifact metadata, activate it, download as approved user, and confirm a download event is recorded.
8. Revoke the approved user and confirm marketplace routes no longer expose app data.
9. Return to admin dashboard and verify counts for pending/approved/rejected/revoked users plus app usage/download aggregates.

## Validation Commands

```bash
npm run typecheck
npm run lint:strict
npm run format:check
```

## Expected Results

- Non-approved users are blocked server-side from marketplace data.
- Admin decisions update access state immediately.
- Active apps appear to approved users; inactive/draft apps do not.
- App detail, web use, and package download actions create usage events.
- Admin dashboard aggregates match persisted access requests and usage events.
