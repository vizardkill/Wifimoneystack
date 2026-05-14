# Como Funciona el Sistema

## Vision general

El sistema es un monolito web (React Router + Node + Prisma + PostgreSQL) con dos superficies principales:

- **Experiencia de usuario**: registro, login, consulta de estado y vitrina de apps.
- **Experiencia administrativa**: aprobacion/rechazo/revocacion de accesos, gestion del catalogo y dashboard operativo.

## Flujo de autenticacion y acceso

1. El usuario se registra por email/password.
2. El sistema valida datos y crea el usuario.
3. Se crea una solicitud de acceso en `marketplace_access_requests` con estado `PENDING`.
4. Un admin decide `APPROVED`, `REJECTED` o `REVOKED`.
5. Solo usuarios `APPROVED` pueden consumir datos protegidos de `/marketplace`.

## Flujo de marketplace

1. Usuario aprobado entra a `/marketplace`.
2. El loader lista apps `ACTIVE`.
3. En detalle de app, el sistema registra eventos de uso (`DETAIL_VIEW`, `WEB_OPEN`, `PACKAGE_DOWNLOAD`).
4. Si la app es `WEB_LINK`, redirige a la URL configurada.
5. Si la app es `PACKAGE_DOWNLOAD`, resuelve el artefacto activo y entrega la descarga.

## Flujo administrativo

1. El admin revisa cola de solicitudes (`marketplace_access_requests`).
2. Toma decision y opcionalmente deja motivo.
3. Gestiona apps del catalogo (`marketplace_apps`) y sus recursos:
   - Media (`marketplace_app_media`)
   - Artefactos (`marketplace_app_artifacts`)
4. Revisa metricas de uso agregadas (`marketplace_usage_events`).
5. Cada accion sensible se registra en auditoria (`marketplace_audit_events`).

### Flujo de authoring y publicacion de storefront (Feature 003)

1. El admin abre `/dashboard/marketplace/apps/:appId/edit`.
2. El loader devuelve un snapshot completo de authoring: app base, borrador (`DRAFT`), version publicada (`PUBLISHED`), media, idiomas y readiness.
3. Al guardar contenido de vitrina (`save_storefront_draft`), se persisten campos editoriales, se reemplazan idiomas seleccionados y se recalcula readiness.
4. La gestion de media (`register_media`, `remove_media`, `reorder_media`) solo afecta el borrador; la vitrina publicada permanece estable.
5. Solo cuando el borrador esta `READY`, `publish_storefront` promueve el snapshot a `PUBLISHED`.
6. La ruta publica `/marketplace/apps/:appId` usa `presentation_mode`:
   - `STOREFRONT` cuando existe version publicada lista.
   - `LEGACY` cuando aun no existe una vitrina publicada.
7. Cada accion sensible deja auditoria dedicada: `APP_STOREFRONT_DRAFT_SAVED`, `APP_STOREFRONT_MEDIA_UPDATED`, `APP_STOREFRONT_PUBLISHED`.

### Roles administrativos

- `ADMIN`: puede operar modulos Dashboard, Usuarios y Apps.
- `SUPERADMIN`: hereda permisos de `ADMIN` y ademas puede operar el modulo Administradores.

### Modulo Administradores

El modulo `/dashboard/marketplace/admins` esta restringido a `SUPERADMIN` y permite:

1. Listar cuentas con rol `ADMIN` y `SUPERADMIN`.
2. Promover por email una cuenta existente de `USER` a `ADMIN`.
3. Bloquear promociones duplicadas (si ya tiene rol admin).
4. Registrar auditoria con accion `ADMIN_PROMOTED`.

Si un usuario sin rol `SUPERADMIN` intenta acceder, es redirigido al dashboard del marketplace.

## Capas tecnicas

- **Rutas**: loaders/actions de React Router (control de acceso y respuestas HTTP).
- **Core services**: logica de negocio en `app/core/marketplace/services`.
- **DB classes**: acceso a Prisma aislado en `app/core/**/db`.
- **Prisma**: esquema relacional, enums y migraciones.
- **Seeds**: datos base + datos demo en `prisma/seeds`.

## Estados clave del dominio

### Access Request

- `PENDING` -> `APPROVED` / `REJECTED`
- `APPROVED` -> `REVOKED`
- `REJECTED` -> `APPROVED` (si admin decide reactivar)
- `REVOKED` -> `APPROVED` (si admin decide reactivar)

Adicionalmente, las decisiones administrativas usan regla first-write-wins: si dos admins deciden al mismo tiempo, la primera escritura valida gana y la segunda
recibe conflicto para refrescar datos.

### Marketplace App

- `DRAFT` -> `ACTIVE`
- `ACTIVE` -> `INACTIVE`
- `INACTIVE` -> `ACTIVE`

### Storefront Version

- `DRAFT/INCOMPLETE` -> `DRAFT/READY`
- `DRAFT/READY` -> `DRAFT/INCOMPLETE` (si se elimina contenido obligatorio)
- `DRAFT/READY` --publish--> `PUBLISHED/READY`

Nota: el estado operativo de la app (`DRAFT`/`ACTIVE`/`INACTIVE`) es independiente del estado de storefront.

## Comandos operativos recomendados

```bash
# migraciones
npx prisma migrate reset --force

# seeds
npm run prisma:seed

# validaciones
npm run typecheck
npm run lint:strict
npm run format:check
```

## Relacion con los datos de prueba

Para tener un entorno funcional inmediato, usa el seed documentado en [datos-de-prueba.md](datos-de-prueba.md). Incluye:

- Usuarios demo (admin + usuarios por estado)
- Apps demo (web y package)
- Eventos iniciales para dashboard
