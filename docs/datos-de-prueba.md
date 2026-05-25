# Datos de Prueba y Seed Local

Esta guia documenta los datos de prueba oficiales para desarrollo local del marketplace.

## Archivo de seed

- `prisma/seeds/001_seed_countries.sql`
- `prisma/seeds/002_seed_demo_marketplace_data.sql`

El segundo archivo crea usuarios demo, estados de acceso, apps de ejemplo, media, artefactos y eventos para poblar dashboards.

## Usuarios de prueba

> Solo para entorno local. No usar estas credenciales fuera de desarrollo.

| Perfil            | Email                              | Password      | Rol     | Estado de acceso marketplace |
| ----------------- | ---------------------------------- | ------------- | ------- | ---------------------------- |
| Admin demo        | `admin.demo@marketplace.local`     | `Admin1234!`  | `ADMIN` | N/A (admin)                  |
| Usuario aprobado  | `usuario.demo@marketplace.local`   | `Tester1234!` | `USER`  | `APPROVED`                   |
| Usuario pendiente | `pendiente.demo@marketplace.local` | `Tester1234!` | `USER`  | `PENDING`                    |
| Usuario rechazado | `rechazado.demo@marketplace.local` | `Tester1234!` | `USER`  | `REJECTED`                   |

## Apps de prueba incluidas

> Dataset demo inspirado en apps populares del ecosistema Shopify.

- `demo-seed-printful-print-on-demand` (`WEB_LINK`, `ACTIVE`)
- `demo-seed-klaviyo-email-marketing` (`WEB_LINK`, `ACTIVE`)
- `demo-seed-judgeme-product-reviews` (`WEB_LINK`, `ACTIVE`)
- `demo-seed-loox-photo-reviews` (`WEB_LINK`, `ACTIVE`)
- `demo-seed-dsers-dropshipping` (`WEB_LINK`, `ACTIVE`)
- `demo-seed-matrixify-data-toolkit` (`PACKAGE_DOWNLOAD`, `ACTIVE`)
- `demo-seed-bundle-lab-ai` (`WEB_LINK`, `DRAFT`)

## Como ejecutar seeds

```bash
npm run prisma:seed
```

Para forzar re-ejecucion de todos los seeds:

```bash
PRISMA_SEED_FORCE_RERUN=true npm run prisma:seed
```

## Verificaciones rapidas

```bash
# Usuarios demo
psql "$DB_URL" -c "SELECT email, role, email_verified, is_active FROM users WHERE email LIKE '%demo@marketplace.local' ORDER BY email;"

# Estados de acceso
psql "$DB_URL" -c "SELECT u.email, r.status FROM users u JOIN marketplace_access_requests r ON r.user_id = u.id WHERE u.email LIKE '%demo@marketplace.local' ORDER BY u.email;"

# Apps demo
psql "$DB_URL" -c "SELECT slug, access_mode, status FROM marketplace_apps WHERE slug LIKE 'demo-seed-%' ORDER BY slug;"
```

## Nota de idempotencia

El proceso `prisma/seed.ts` usa la tabla `_prisma_seed_history` para ejecutar solo seeds nuevos o modificados (checksum por archivo). Por eso, normalmente no
duplica datos al correr varias veces.

## Guia rapida (modo dummies): conectar Facebook Insights

Esta mini-guia es para dejar conectada la app sin enredos.

### 1) Saca las 2 llaves que necesitas

Necesitas solo esto:

- `Access Token` de Meta
- `Ad Account ID` (ID de cuenta publicitaria)

Ruta unica para sacarlas:

1. Abre `https://developers.facebook.com/tools/explorer/` (Graph API Explorer).
2. Selecciona tu app de Meta arriba.
3. Clic en **Get Token** -> **Get User Access Token**.
4. Marca permisos: `ads_read` y `business_management`.
5. Genera el token y copialo.
6. En Ads Manager, entra a tu cuenta y copia el ID de cuenta publicitaria (ejemplo: `1166190552315146`).

> Importante: en nuestro formulario usa el numero solo, sin `act_`.

### 2) Conecta en Facebook Insights

1. Abre la subapp `facebook-insights.wifimoneystack.com`.
2. En **Token label** escribe un nombre facil (ejemplo: `biosoma`).
3. En **Ad Account ID** pega el numero de la cuenta.
4. En **Business ID** puedes dejar vacio.
5. En **Access Token** pega el token de Meta.
6. Clic en **Guardar conexion**.

Si todo va bien, debe quedar en estado `ACTIVE`.

### 3) Prueba rapida

1. Elige el preset `spend_report`.
2. Selecciona un rango de fechas con actividad real.
3. Ejecuta el preset.

Si no hubo gasto en ese rango, veras datos en cero (eso es normal).

### 4) Si algo falla

- `No autorizado`: recarga la pagina y vuelve a iniciar sesion en el marketplace.
- `Ad account invalida`: revisa que sea el ID numerico correcto y que tu usuario tenga acceso a esa cuenta.
- `Token invalido o expirado`: genera un token nuevo en Graph API Explorer.

### 5) Seguridad

No compartas tokens por chat ni en capturas. Si un token se expone, revocalo y genera otro.
