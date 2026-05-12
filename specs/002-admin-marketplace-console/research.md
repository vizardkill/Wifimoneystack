# Phase 0 Research: Panel administrativo del marketplace

## Decision: Reuse the existing admin dashboard shell and extend it with an Administradores module

**Rationale**: The codebase already has an admin dashboard entry point and a left sidebar in
[app/routes/dashboard/\_layout.tsx](app/routes/dashboard/_layout.tsx). Extending this shell with a fourth module keeps navigation consistent and avoids
duplicating layout logic.

**Alternatives considered**: Creating a second admin panel outside `/dashboard/marketplace` was rejected because it duplicates auth/role guards and fractures
the UX.

## Decision: Represent superadmin capability explicitly in the auth role model

**Rationale**: The specification requires that only superadmins can promote administrators. The current enum in [prisma/schema.prisma](prisma/schema.prisma) has
only `USER` and `ADMIN`, so implementing this rule safely requires an explicit `SUPERADMIN` role and aligned typing in auth interfaces and token flows.

**Alternatives considered**: Using a hardcoded email allowlist was rejected because it is brittle, hard to audit, and not scalable for operational management.

## Decision: Administrator onboarding in this feature is promotion by existing-account email only

**Rationale**: The clarified scope requires promoting existing accounts by email. This avoids introducing invitation flows, password bootstrapping, and email
lifecycle complexities in this iteration.

**Alternatives considered**: Creating admin accounts from scratch or invite-based flows was rejected as out of scope for this feature.

## Decision: Enforce first-write-wins for access decisions with conditional persistence

**Rationale**: The spec requires first confirmed decision to win and stale attempts to return conflict. Services currently fetch then update by id; this can
race. The update operation should require expected current status (compare-and-set) so stale updates fail deterministically.

**Alternatives considered**: Last-write-wins was rejected because it can silently override approved/rejected decisions. Pessimistic record locking was rejected
as unnecessarily complex for MVP traffic.

## Decision: Dashboard metrics include current counts plus fixed 7-day variation

**Rationale**: The clarified requirement asks for current KPIs and last-7-day variation for new users, access decisions, and app activation/deactivation.
Existing dashboard service already computes current counts; variation can be derived from created timestamps and audit actions in a bounded 7-day window.

**Alternatives considered**: Configurable date ranges were rejected to avoid adding query complexity and UI controls in this iteration.

## Decision: App management scope remains basic catalog operations in this feature

**Rationale**: The scope is list/detail/create/edit basic card fields (`name`, `summary`, `status`) plus publish/unpublish behavior. Advanced media/artifact
workflow already exists and remains outside this feature to keep delivery incremental.

**Alternatives considered**: Full app CRUD with media/video/artifact orchestration in this feature was rejected as scope expansion.

## Decision: Keep route-level orchestration and core-module boundaries aligned with constitution

**Rationale**: Route modules continue to own loader/action workflow and dynamically import server controllers from module barrels. Persistence remains in DB
classes under `app/core/*/db`.

**Alternatives considered**: Direct Prisma calls from routes were rejected because they violate the constitutional boundary rules.
