# Base de Datos: Marketplace de Aplicaciones Ecommerce

## Tecnología

- **Motor**: PostgreSQL 15+
- **ORM**: Prisma 7.8.x
- **Conexión**: `postgresql://marketplace:marketplace@localhost:5433/marketplace_dev`
- **Migraciones**:
  - `20260511051856_marketplace_initial` — tablas del marketplace
  - `20260511061444_add_auth_models` — modelos de autenticación

---

## Diagrama de Relaciones

```
User ──────────────────────────┐
  │                             │ (created_by / actor)
  │ 1:1                        │
  ▼                            ▼
MarketplaceAccessRequest   MarketplaceAuditEvent
                               │
                               │ (app_id opcional)
                               ▼
MarketplaceApp ────────────────┤
  │                            │
  │ 1:N                       │ 1:N
  ├──> MarketplaceAppMedia     │
  ├──> MarketplaceAppArtifact  │
  └──> MarketplaceUsageEvent ──┘
```

---

## Modelos

### `User`

Tabla de usuarios del sistema (auth + marketplace).

| Campo            | Tipo     | Descripción                |
| ---------------- | -------- | -------------------------- |
| `id`             | UUID PK  | Identificador único        |
| `email`          | String   | Email único (máx 64 chars) |
| `first_name`     | String   | Nombre (máx 40 chars)      |
| `last_name`      | String   | Apellido (máx 40 chars)    |
| `password`       | String   | Hash bcrypt (máx 64 chars) |
| `role`           | `Role`   | `USER` (default) o `ADMIN` |
| `email_verified` | Boolean  | Si el email fue verificado |
| `is_active`      | Boolean  | Si la cuenta está activa   |
| `created_at`     | DateTime | Fecha de creación          |
| `updated_at`     | DateTime | Última actualización       |

**Relaciones**: `verification_tokens`, `password_reset_tokens`, `auth_providers`

---

### `MarketplaceAccessRequest`

Solicitud de acceso al marketplace por usuario. Relación 1:1 con `User`.

| Campo                | Tipo                      | Descripción                          |
| -------------------- | ------------------------- | ------------------------------------ |
| `id`                 | UUID PK                   | Identificador único                  |
| `user_id`            | String UNIQUE FK→User     | Un usuario, una solicitud            |
| `status`             | `MarketplaceAccessStatus` | Estado actual (ver enum)             |
| `company_name`       | String?                   | Nombre de la empresa (opcional)      |
| `business_url`       | String?                   | URL del negocio (opcional)           |
| `business_type`      | String?                   | Tipo de negocio (opcional)           |
| `request_notes`      | String?                   | Notas del solicitante (opcional)     |
| `decision_reason`    | String?                   | Razón de la decisión admin           |
| `decided_by_user_id` | String?                   | Admin que tomó la decisión           |
| `decided_at`         | DateTime?                 | Momento de la decisión               |
| `revoked_at`         | DateTime?                 | Momento de la revocación (si aplica) |
| `created_at`         | DateTime                  | Fecha de la solicitud                |
| `updated_at`         | DateTime                  | Última actualización                 |

**Índices**: `(status, created_at)` para listados de admin paginados

**Enum `MarketplaceAccessStatus`**:

- `PENDING` → `APPROVED` / `REJECTED`
- `APPROVED` → `REVOKED`
- `REJECTED` → `APPROVED`
- `REVOKED` → `APPROVED`

---

### `MarketplaceApp`

Ficha de aplicación en el catálogo del marketplace.

| Campo                | Tipo                       | Descripción                             |
| -------------------- | -------------------------- | --------------------------------------- |
| `id`                 | UUID PK                    | Identificador único                     |
| `slug`               | String UNIQUE              | Identificador URL amigable              |
| `name`               | String                     | Nombre (máx 120 chars)                  |
| `summary`            | String                     | Resumen corto                           |
| `description`        | String                     | Descripción completa                    |
| `instructions`       | String                     | Instrucciones de uso                    |
| `access_mode`        | `MarketplaceAppAccessMode` | Cómo se accede (ver enum)               |
| `status`             | `MarketplaceAppStatus`     | `DRAFT` (default), `ACTIVE`, `INACTIVE` |
| `web_url`            | String?                    | URL si es `WEB_LINK`                    |
| `published_at`       | DateTime?                  | Fecha de primera publicación            |
| `created_by_user_id` | String FK→User             | Admin que creó la ficha                 |
| `updated_by_user_id` | String?                    | Admin que hizo el último update         |
| `created_at`         | DateTime                   | Fecha de creación                       |
| `updated_at`         | DateTime                   | Última actualización                    |

**Índices**: `(status, access_mode, created_at)` para la vitrina de usuarios

**Enums**:

- `MarketplaceAppStatus`: `DRAFT`, `ACTIVE`, `INACTIVE`
- `MarketplaceAppAccessMode`: `WEB_LINK`, `PACKAGE_DOWNLOAD`

---

### `MarketplaceAppMedia`

Recursos visuales (icono, screenshots, video) asociados a una app.

| Campo         | Tipo                   | Descripción                             |
| ------------- | ---------------------- | --------------------------------------- |
| `id`          | UUID PK                | Identificador único                     |
| `app_id`      | String FK→App          | App propietaria                         |
| `type`        | `MarketplaceMediaType` | `ICON`, `SCREENSHOT`, o `VIDEO`         |
| `storage_key` | String                 | Clave en el proveedor de almacenamiento |
| `public_url`  | String?                | URL pública (si está disponible)        |
| `alt_text`    | String?                | Texto alternativo para accesibilidad    |
| `sort_order`  | Int                    | Orden de presentación (default 0)       |
| `created_at`  | DateTime               | Fecha de carga                          |
| `updated_at`  | DateTime               | Última actualización                    |

**Enum `MarketplaceMediaType`**: `ICON`, `SCREENSHOT`, `VIDEO`

---

### `MarketplaceAppArtifact`

Versión descargable de una app (ZIP u otro binario).

| Campo                | Tipo          | Descripción                             |
| -------------------- | ------------- | --------------------------------------- |
| `id`                 | UUID PK       | Identificador único                     |
| `app_id`             | String FK→App | App propietaria                         |
| `storage_key`        | String        | Clave en almacenamiento                 |
| `file_name`          | String        | Nombre del archivo                      |
| `mime_type`          | String        | MIME type del archivo                   |
| `size_bytes`         | BigInt        | Tamaño en bytes                         |
| `checksum`           | String?       | Hash de integridad (SHA256, etc.)       |
| `version_label`      | String?       | Etiqueta de versión (ej: "v1.2.0")      |
| `is_active`          | Boolean       | Si es el artefacto activo para descarga |
| `created_by_user_id` | String        | Admin que subió el artefacto            |
| `created_at`         | DateTime      | Fecha de carga                          |
| `updated_at`         | DateTime      | Última actualización                    |

**Índices**: `(app_id, is_active)` para obtener el artefacto activo de una app

---

### `MarketplaceUsageEvent`

Registro inmutable de cada interacción de un usuario con una app. Tabla append-only.

| Campo        | Tipo                        | Descripción                     |
| ------------ | --------------------------- | ------------------------------- |
| `id`         | UUID PK                     | Identificador único             |
| `app_id`     | String FK→App               | App que fue usada               |
| `user_id`    | String                      | Usuario que interactuó          |
| `type`       | `MarketplaceUsageEventType` | Tipo de evento (ver enum)       |
| `metadata`   | Json?                       | Datos adicionales (ej: versión) |
| `created_at` | DateTime                    | Momento del evento              |

**Índices**:

- `(app_id, type, created_at)` — para conteo de uso por app
- `(user_id, created_at)` — para historial de usuario

**Enum `MarketplaceUsageEventType`**:

- `DETAIL_VIEW` — usuario abrió el detalle de la app
- `WEB_OPEN` — usuario hizo clic en "Abrir app"
- `PACKAGE_DOWNLOAD` — usuario descargó el artefacto
- `PACKAGE_INSTALL` — usuario confirmó instalación (opcional, futuro)

---

### `MarketplaceAuditEvent`

Log inmutable de todas las acciones administrativas relevantes. Tabla append-only.

| Campo            | Tipo                     | Descripción                  |
| ---------------- | ------------------------ | ---------------------------- |
| `id`             | UUID PK                  | Identificador único          |
| `actor_user_id`  | String                   | Quien ejecutó la acción      |
| `target_user_id` | String?                  | Usuario afectado (si aplica) |
| `app_id`         | String?                  | App afectada (si aplica)     |
| `action`         | `MarketplaceAuditAction` | Tipo de acción (ver enum)    |
| `reason`         | String?                  | Razón explícita del admin    |
| `metadata`       | Json?                    | Datos adicionales            |
| `created_at`     | DateTime                 | Momento de la acción         |

**Índices**:

- `(actor_user_id, created_at)`
- `(target_user_id, created_at)`
- `(app_id, created_at)`

**Enum `MarketplaceAuditAction`**: `ACCESS_REQUESTED`, `ACCESS_APPROVED`, `ACCESS_REJECTED`, `ACCESS_REVOKED`, `APP_CREATED`, `APP_UPDATED`, `APP_PUBLISHED`,
`APP_UNPUBLISHED`, `APP_MEDIA_UPDATED`, `APP_ARTIFACT_UPDATED`

---

## Flujos de Datos Clave

### Flujo 1: Solicitud de acceso

```
POST /auth/signup
  └─> UserDB.create()
       └─> User {role: USER}
  └─> AccessRequestDB.create()
       └─> MarketplaceAccessRequest {status: PENDING}
  └─> MarketplaceAuditEvent {action: ACCESS_REQUESTED}
```

### Flujo 2: Decisión admin

```
POST /dashboard/marketplace/users?action=decide
  └─> CLS_DecideMarketplaceAccessRequest
       └─> AccessRequestDB.updateDecision()
            └─> MarketplaceAccessRequest {status: APPROVED|REJECTED}
       └─> MarketplaceAuditEvent {action: ACCESS_APPROVED|ACCESS_REJECTED}
```

### Flujo 3: Uso de app

```
GET /marketplace/apps/:id/use
  └─> CLS_RecordMarketplaceAppUse
       └─> AccessRequestDB.findByUserId() → verificar APPROVED
       └─> MarketplaceAppDB.findByIdForUser() → verificar ACTIVE
       └─> AppUsageEventDB.create() {type: WEB_OPEN}
       └─> return {redirect_url: app.web_url}
```

### Flujo 4: Descarga de artefacto

```
GET /marketplace/apps/:id/download
  └─> CLS_RecordMarketplaceAppDownload
       └─> AccessRequestDB.findByUserId() → verificar APPROVED
       └─> MarketplaceAppDB.findByIdForUser() → verificar ACTIVE, PACKAGE_DOWNLOAD
       └─> MarketplaceAppArtifactDB.findActiveByAppId() → obtener artefacto activo
       └─> AppUsageEventDB.create() {type: PACKAGE_DOWNLOAD}
       └─> return {download_url: artifact.storage_key}
```

---

## Convenciones de Nomenclatura

| Elemento     | Convención                 | Ejemplo                         |
| ------------ | -------------------------- | ------------------------------- |
| Tablas       | `snake_case` plural        | `marketplace_access_requests`   |
| PKs          | UUID v4                    | `@id @default(uuid())`          |
| Timestamps   | `created_at`, `updated_at` | `@default(now())`, `@updatedAt` |
| FKs          | `{entity}_id`              | `user_id`, `app_id`             |
| Enums        | `PascalCase`               | `MarketplaceAccessStatus`       |
| Valores enum | `UPPER_SNAKE_CASE`         | `PENDING`, `APPROVED`           |

---

## Dataset de Pruebas

El seed `prisma/seeds/002_seed_demo_marketplace_data.sql` inserta un dataset local con:

- Usuarios demo (`ADMIN`, `USER` aprobado, pendiente y rechazado)
- Solicitudes de acceso en distintos estados
- Apps activas y en borrador
- Media, artefactos y eventos de uso/auditoría

Consulta la guía completa en [Datos de Prueba y Seed Local](datos-de-prueba.md).
