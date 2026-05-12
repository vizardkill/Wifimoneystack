# Data Model: Panel administrativo del marketplace

## Enum Updates

### Role (auth)

Current values in [prisma/schema.prisma](prisma/schema.prisma):

- `USER`
- `ADMIN`

Planned update:

- `SUPERADMIN` (new)

Purpose: enforce that only superadmins can promote users to admin.

### MarketplaceAuditAction

Current values include access and app actions.

Planned update:

- `ADMIN_PROMOTED` (new)

Purpose: audit admin promotions performed from the new Administradores module.

## Entities

### User

Represents authenticated accounts and role-based permissions.

**Fields used in this feature**:

- `id`
- `email`
- `first_name`
- `last_name`
- `role` (`USER` | `ADMIN` | `SUPERADMIN`)
- `is_active`
- `created_at`
- `updated_at`

**Validation Rules**:

- Only `SUPERADMIN` can promote another user from `USER` to `ADMIN`.
- Promotion requires an existing account matched by email.
- Duplicate promotions are blocked when target role is already `ADMIN` or `SUPERADMIN`.

### MarketplaceAccessRequest

Represents access state and admin decisions for marketplace usage.

**Fields used in this feature**:

- `id`
- `user_id`
- `status` (`PENDING` | `APPROVED` | `REJECTED` | `REVOKED`)
- `decision_reason`
- `decided_by_user_id`
- `decided_at`
- `revoked_at`
- `updated_at`

**Concurrency Rule**:

- First-write-wins for decisions.
- Update operation must include expected current status and fail with conflict if status changed since read.

### MarketplaceApp

Represents app catalog entries managed from admin.

**Fields used in this feature**:

- `id`
- `slug`
- `name`
- `summary`
- `status` (`DRAFT` | `ACTIVE` | `INACTIVE`)
- `updated_by_user_id`
- `updated_at`

**Validation Rules**:

- Basic create/edit requires `name` and `summary`.
- Publish/unpublish keeps current publication validation rules from marketplace core.

### MarketplaceAuditEvent

Immutable event log for protected admin actions.

**Fields used in this feature**:

- `id`
- `actor_user_id`
- `target_user_id`
- `app_id`
- `action`
- `reason`
- `metadata`
- `created_at`

**Actions required in this feature**:

- `ACCESS_APPROVED`
- `ACCESS_REJECTED`
- `ACCESS_REVOKED`
- `APP_PUBLISHED`
- `APP_UNPUBLISHED`
- `ADMIN_PROMOTED` (new)

### AdminDashboardSnapshot (Derived View)

Non-persistent response model produced by dashboard service.

**Current Counters**:

- pending users
- approved users
- rejected users
- revoked users
- active apps
- draft apps
- inactive apps

**7-day Variation Counters**:

- new users in last 7 days
- access decisions in last 7 days (approved + rejected + revoked)
- apps activated in last 7 days
- apps deactivated in last 7 days

## State Transitions

### User Role Transition

```text
USER -> ADMIN         # allowed only by SUPERADMIN action
ADMIN -> SUPERADMIN   # out of scope for this feature
ADMIN -> USER         # out of scope for this feature
```

### Access Decision Transition

```text
PENDING -> APPROVED
PENDING -> REJECTED
APPROVED -> REVOKED
```

Conflict behavior:

- If two admins decide simultaneously, first successful transition is persisted.
- Later attempt on stale state returns conflict and requires refresh.

### App Publication Transition

```text
DRAFT -> ACTIVE
ACTIVE -> INACTIVE
INACTIVE -> ACTIVE
```

## Index and Migration Impact

Planned migration updates in [prisma/schema.prisma](prisma/schema.prisma):

- Extend `Role` enum with `SUPERADMIN`.
- Extend `MarketplaceAuditAction` enum with `ADMIN_PROMOTED`.
- Add/confirm index for admin lookup and dashboard windows:
  - `User(role, created_at)`
  - `MarketplaceAuditEvent(action, created_at)`

No new tables are required for this feature.
