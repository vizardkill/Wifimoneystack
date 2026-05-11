-- Seed: Demo users and marketplace data
BEGIN;

-- -----------------------------------------------------------------------------
-- Users for local testing
-- Passwords (plain text) are documented in docs/datos-de-prueba.md
-- -----------------------------------------------------------------------------
INSERT INTO "users" (
  "id",
  "email",
  "first_name",
  "last_name",
  "password",
  "role",
  "email_verified",
  "is_active",
  "created_at",
  "updated_at"
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'admin.demo@marketplace.local',
    'Admin',
    'Demo',
    '$2b$10$4FjfwnRSzcEaK5/uSeuVAeTdrO13ugd5QbeRu.CUG1oly7IjK2Pga',
    'ADMIN',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'usuario.demo@marketplace.local',
    'Usuario',
    'Aprobado',
    '$2b$10$r9z0z6.TnyecC2B37rdwTOkn7WXWmf84Dj9xj19i4J34PKX3FotbS',
    'USER',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'pendiente.demo@marketplace.local',
    'Usuario',
    'Pendiente',
    '$2b$10$r9z0z6.TnyecC2B37rdwTOkn7WXWmf84Dj9xj19i4J34PKX3FotbS',
    'USER',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'rechazado.demo@marketplace.local',
    'Usuario',
    'Rechazado',
    '$2b$10$r9z0z6.TnyecC2B37rdwTOkn7WXWmf84Dj9xj19i4J34PKX3FotbS',
    'USER',
    true,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT ("email")
DO UPDATE SET
  "first_name" = EXCLUDED."first_name",
  "last_name" = EXCLUDED."last_name",
  "password" = EXCLUDED."password",
  "role" = EXCLUDED."role",
  "email_verified" = EXCLUDED."email_verified",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = NOW();

INSERT INTO "user_auth_providers" (
  "id",
  "user_id",
  "provider_type",
  "provider_id",
  "provider_data",
  "is_primary",
  "created_at",
  "updated_at"
)
VALUES
  (
    '61000000-0000-0000-0000-000000000001',
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    'jwt',
    NULL,
    '{"seed":"demo-admin"}'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  (
    '61000000-0000-0000-0000-000000000002',
    (SELECT "id" FROM "users" WHERE "email" = 'usuario.demo@marketplace.local' LIMIT 1),
    'jwt',
    NULL,
    '{"seed":"demo-user"}'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  (
    '61000000-0000-0000-0000-000000000003',
    (SELECT "id" FROM "users" WHERE "email" = 'pendiente.demo@marketplace.local' LIMIT 1),
    'jwt',
    NULL,
    '{"seed":"demo-pending"}'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  (
    '61000000-0000-0000-0000-000000000004',
    (SELECT "id" FROM "users" WHERE "email" = 'rechazado.demo@marketplace.local' LIMIT 1),
    'jwt',
    NULL,
    '{"seed":"demo-rejected"}'::jsonb,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT ("user_id", "provider_type")
DO UPDATE SET
  "provider_data" = EXCLUDED."provider_data",
  "is_primary" = EXCLUDED."is_primary",
  "updated_at" = NOW();

-- -----------------------------------------------------------------------------
-- Access requests by status for dashboard and access-flow tests
-- -----------------------------------------------------------------------------
INSERT INTO "marketplace_access_requests" (
  "id",
  "user_id",
  "status",
  "company_name",
  "business_url",
  "business_type",
  "request_notes",
  "decision_reason",
  "decided_by_user_id",
  "decided_at",
  "revoked_at",
  "created_at",
  "updated_at"
)
VALUES
  (
    '71000000-0000-0000-0000-000000000001',
    (SELECT "id" FROM "users" WHERE "email" = 'usuario.demo@marketplace.local' LIMIT 1),
    'APPROVED',
    'Demo Commerce Team',
    'https://demo-shop.example.com',
    'Retail',
    'Solicitud de acceso para pruebas locales.',
    'Aprobado para entorno de pruebas.',
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NOW(),
    NULL,
    NOW(),
    NOW()
  ),
  (
    '71000000-0000-0000-0000-000000000002',
    (SELECT "id" FROM "users" WHERE "email" = 'pendiente.demo@marketplace.local' LIMIT 1),
    'PENDING',
    'Pending Commerce Team',
    'https://pending-shop.example.com',
    'Retail',
    'Usuario pendiente para validar cola administrativa.',
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
  ),
  (
    '71000000-0000-0000-0000-000000000003',
    (SELECT "id" FROM "users" WHERE "email" = 'rechazado.demo@marketplace.local' LIMIT 1),
    'REJECTED',
    'Rejected Commerce Team',
    'https://rejected-shop.example.com',
    'Retail',
    'Usuario rechazado para validar mensajes de estado.',
    'Datos de negocio incompletos para el piloto.',
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NOW(),
    NULL,
    NOW(),
    NOW()
  )
ON CONFLICT ("user_id")
DO UPDATE SET
  "status" = EXCLUDED."status",
  "company_name" = EXCLUDED."company_name",
  "business_url" = EXCLUDED."business_url",
  "business_type" = EXCLUDED."business_type",
  "request_notes" = EXCLUDED."request_notes",
  "decision_reason" = EXCLUDED."decision_reason",
  "decided_by_user_id" = EXCLUDED."decided_by_user_id",
  "decided_at" = EXCLUDED."decided_at",
  "revoked_at" = EXCLUDED."revoked_at",
  "updated_at" = NOW();

-- -----------------------------------------------------------------------------
-- Marketplace apps and related assets
-- -----------------------------------------------------------------------------
INSERT INTO "marketplace_apps" (
  "id",
  "slug",
  "name",
  "summary",
  "description",
  "instructions",
  "access_mode",
  "status",
  "web_url",
  "published_at",
  "created_by_user_id",
  "updated_by_user_id",
  "created_at",
  "updated_at"
)
VALUES
  (
    '81000000-0000-0000-0000-000000000001',
    'demo-seed-printful-print-on-demand',
    'Printful: Print on Demand',
    'Impresion bajo demanda y fulfillment para tiendas Shopify.',
    'Demo inspirada en soluciones de print-on-demand del ecosistema Shopify para vender productos personalizados sin inventario inicial.',
    E'Escenario demo:\n- Conecta productos POD al catalogo\n- Publica mockups en segundos\n- Gestiona fulfillment y tracking en un mismo flujo',
    'WEB_LINK',
    'ACTIVE',
    'https://apps.shopify.com/printful',
    NOW(),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    '81000000-0000-0000-0000-000000000002',
    'demo-seed-klaviyo-email-marketing',
    'Klaviyo: Email Marketing & SMS',
    'Automatiza campañas de email y SMS para ecommerce.',
    'Demo inspirada en plataformas de CRM y automatizacion para activar flujos de recuperacion de carrito, winback y retencion.',
    E'Escenario demo:\n- Segmenta audiencias por eventos de compra\n- Configura automations de abandono\n- Sincroniza plantillas y cupones',
    'WEB_LINK',
    'ACTIVE',
    'https://apps.shopify.com/klaviyo-email-marketing',
    NOW(),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    '81000000-0000-0000-0000-000000000003',
    'demo-seed-judgeme-product-reviews',
    'Judge.me: Product Reviews',
    'Recolecta reseñas y prueba social para mejorar conversion.',
    'Demo inspirada en apps de reviews para capturar testimonios, rating con estrellas y contenido visual generado por clientes.',
    E'Escenario demo:\n- Solicita reseñas automaticas post-compra\n- Muestra widgets de rating en PDP\n- Destaca testimonios de mayor impacto',
    'WEB_LINK',
    'ACTIVE',
    'https://apps.shopify.com/judgeme',
    NOW(),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    '81000000-0000-0000-0000-000000000004',
    'demo-seed-loox-photo-reviews',
    'Loox: Photo & Video Reviews',
    'Reviews visuales con fotos y videos para elevar confianza.',
    'Demo inspirada en apps de social proof visual para mostrar contenido real de clientes y aumentar la tasa de compra.',
    E'Escenario demo:\n- Recopila reseñas con fotos\n- Publica galerias UGC en home y producto\n- Activa flujos de referidos',
    'WEB_LINK',
    'ACTIVE',
    'https://apps.shopify.com/loox',
    NOW(),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    '81000000-0000-0000-0000-000000000005',
    'demo-seed-dsers-dropshipping',
    'DSers: AliExpress Dropshipping',
    'Gestion de catalogo y ordenes para dropshipping.',
    'Demo inspirada en conectores de dropshipping para importar productos, enrutar pedidos y mantener sincronizacion de precios.',
    E'Escenario demo:\n- Importa productos desde proveedor\n- Mapea variantes y margenes\n- Envía ordenes en lote',
    'WEB_LINK',
    'ACTIVE',
    'https://apps.shopify.com/dsers',
    NOW(),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    '81000000-0000-0000-0000-000000000006',
    'demo-seed-matrixify-data-toolkit',
    'Matrixify Data Toolkit',
    'Kit descargable para importaciones y migraciones masivas.',
    'Demo inspirada en flujos de migracion de datos ecommerce para cargas por lotes, transformaciones y validacion previa.',
    E'Escenario demo:\n- Descarga toolkit de migracion\n- Ejecuta validacion de columnas\n- Carga productos y clientes por lotes',
    'PACKAGE_DOWNLOAD',
    'ACTIVE',
    NULL,
    NOW(),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    '81000000-0000-0000-0000-000000000007',
    'demo-seed-bundle-lab-ai',
    'Bundle Lab AI',
    'Creador de bundles y upsells inteligentes para carrito.',
    'App en borrador para validar el flujo admin de edicion y publicacion.',
    E'Escenario demo:\n- Define bundles dinamicos\n- Prueba reglas de upsell\n- Publica cuando complete QA',
    'WEB_LINK',
    'DRAFT',
    'https://apps.shopify.com/search?q=bundles',
    NULL,
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NOW(),
    NOW()
  )
ON CONFLICT ("id")
DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "name" = EXCLUDED."name",
  "summary" = EXCLUDED."summary",
  "description" = EXCLUDED."description",
  "instructions" = EXCLUDED."instructions",
  "access_mode" = EXCLUDED."access_mode",
  "status" = EXCLUDED."status",
  "web_url" = EXCLUDED."web_url",
  "published_at" = EXCLUDED."published_at",
  "created_by_user_id" = EXCLUDED."created_by_user_id",
  "updated_by_user_id" = EXCLUDED."updated_by_user_id",
  "updated_at" = NOW();

INSERT INTO "marketplace_app_media" (
  "id",
  "app_id",
  "type",
  "storage_key",
  "public_url",
  "alt_text",
  "sort_order",
  "created_at",
  "updated_at"
)
VALUES
  (
    '82000000-0000-0000-0000-000000000001',
    '81000000-0000-0000-0000-000000000001',
    'ICON',
    'seed/demo/apps/printful/icon.png',
    'https://placehold.co/128x128/0f172a/f8fafc?text=Printful',
    'Icono Printful demo',
    0,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000002',
    '81000000-0000-0000-0000-000000000001',
    'SCREENSHOT',
    'seed/demo/apps/printful/screenshot-01.png',
    'https://placehold.co/1280x720/e2e8f0/0f172a?text=Printful+Catalog+Demo',
    'Pantalla principal Printful demo',
    1,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000003',
    '81000000-0000-0000-0000-000000000001',
    'SCREENSHOT',
    'seed/demo/apps/printful/screenshot-02.png',
    'https://placehold.co/1280x720/dbeafe/0f172a?text=Printful+Order+Flow',
    'Flujo de ordenes Printful demo',
    2,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000004',
    '81000000-0000-0000-0000-000000000002',
    'ICON',
    'seed/demo/apps/klaviyo/icon.png',
    'https://placehold.co/128x128/0f172a/f8fafc?text=Klaviyo',
    'Icono Klaviyo demo',
    0,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000005',
    '81000000-0000-0000-0000-000000000002',
    'SCREENSHOT',
    'seed/demo/apps/klaviyo/screenshot-01.png',
    'https://placehold.co/1280x720/fef3c7/0f172a?text=Klaviyo+Automation+Demo',
    'Pantalla principal Klaviyo demo',
    1,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000006',
    '81000000-0000-0000-0000-000000000003',
    'ICON',
    'seed/demo/apps/judgeme/icon.png',
    'https://placehold.co/128x128/0f172a/f8fafc?text=Judge.me',
    'Icono Judge.me demo',
    0,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000007',
    '81000000-0000-0000-0000-000000000003',
    'SCREENSHOT',
    'seed/demo/apps/judgeme/screenshot-01.png',
    'https://placehold.co/1280x720/fee2e2/0f172a?text=Judge.me+Reviews+Demo',
    'Pantalla principal Judge.me demo',
    1,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000008',
    '81000000-0000-0000-0000-000000000004',
    'ICON',
    'seed/demo/apps/loox/icon.png',
    'https://placehold.co/128x128/0f172a/f8fafc?text=Loox',
    'Icono Loox demo',
    0,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000009',
    '81000000-0000-0000-0000-000000000004',
    'SCREENSHOT',
    'seed/demo/apps/loox/screenshot-01.png',
    'https://placehold.co/1280x720/f3e8ff/0f172a?text=Loox+UGC+Demo',
    'Pantalla principal Loox demo',
    1,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000010',
    '81000000-0000-0000-0000-000000000005',
    'ICON',
    'seed/demo/apps/dsers/icon.png',
    'https://placehold.co/128x128/0f172a/f8fafc?text=DSers',
    'Icono DSers demo',
    0,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000011',
    '81000000-0000-0000-0000-000000000005',
    'SCREENSHOT',
    'seed/demo/apps/dsers/screenshot-01.png',
    'https://placehold.co/1280x720/dcfce7/0f172a?text=DSers+Supplier+Demo',
    'Pantalla principal DSers demo',
    1,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000012',
    '81000000-0000-0000-0000-000000000006',
    'ICON',
    'seed/demo/apps/matrixify/icon.png',
    'https://placehold.co/128x128/0f172a/f8fafc?text=Matrixify',
    'Icono Matrixify demo',
    0,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000013',
    '81000000-0000-0000-0000-000000000006',
    'SCREENSHOT',
    'seed/demo/apps/matrixify/screenshot-01.png',
    'https://placehold.co/1280x720/e0f2fe/0f172a?text=Matrixify+Bulk+Import+Demo',
    'Pantalla principal Matrixify toolkit demo',
    1,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000014',
    '81000000-0000-0000-0000-000000000007',
    'ICON',
    'seed/demo/apps/bundle-lab/icon.png',
    'https://placehold.co/128x128/0f172a/f8fafc?text=Bundle+Lab',
    'Icono Bundle Lab AI demo',
    0,
    NOW(),
    NOW()
  ),
  (
    '82000000-0000-0000-0000-000000000015',
    '81000000-0000-0000-0000-000000000007',
    'SCREENSHOT',
    'seed/demo/apps/bundle-lab/screenshot-01.png',
    'https://placehold.co/1280x720/ede9fe/0f172a?text=Bundle+Lab+Draft+Demo',
    'Pantalla principal Bundle Lab AI draft',
    1,
    NOW(),
    NOW()
  )
ON CONFLICT ("id")
DO UPDATE SET
  "app_id" = EXCLUDED."app_id",
  "type" = EXCLUDED."type",
  "storage_key" = EXCLUDED."storage_key",
  "public_url" = EXCLUDED."public_url",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = NOW();

INSERT INTO "marketplace_app_artifacts" (
  "id",
  "app_id",
  "storage_key",
  "file_name",
  "mime_type",
  "size_bytes",
  "checksum",
  "version_label",
  "is_active",
  "created_by_user_id",
  "created_at",
  "updated_at"
)
VALUES
  (
    '83000000-0000-0000-0000-000000000001',
    '81000000-0000-0000-0000-000000000006',
    'seed/demo/apps/matrixify/toolkit-v2.3.1.zip',
    'matrixify-toolkit-v2.3.1.zip',
    'application/zip',
    2097152,
    'b2f78a4f880711dd6f43bba2344ff3f748c15995ba6d2f6f6356ac15e164f89d',
    'v2.3.1',
    true,
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    '83000000-0000-0000-0000-000000000002',
    '81000000-0000-0000-0000-000000000006',
    'seed/demo/apps/matrixify/toolkit-v2.2.0.zip',
    'matrixify-toolkit-v2.2.0.zip',
    'application/zip',
    1835008,
    'f1734b15772ec8d4d35977fe932eb7f34558d54d4b27d587f53f0b28c73a8c56',
    'v2.2.0',
    false,
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NOW(),
    NOW()
  )
ON CONFLICT ("id")
DO UPDATE SET
  "app_id" = EXCLUDED."app_id",
  "storage_key" = EXCLUDED."storage_key",
  "file_name" = EXCLUDED."file_name",
  "mime_type" = EXCLUDED."mime_type",
  "size_bytes" = EXCLUDED."size_bytes",
  "checksum" = EXCLUDED."checksum",
  "version_label" = EXCLUDED."version_label",
  "is_active" = EXCLUDED."is_active",
  "created_by_user_id" = EXCLUDED."created_by_user_id",
  "updated_at" = NOW();

-- -----------------------------------------------------------------------------
-- Usage and audit events to preload dashboard metrics
-- -----------------------------------------------------------------------------
INSERT INTO "marketplace_usage_events" (
  "id",
  "app_id",
  "user_id",
  "type",
  "metadata",
  "created_at"
)
VALUES
  (
    '84000000-0000-0000-0000-000000000001',
    '81000000-0000-0000-0000-000000000001',
    (SELECT "id" FROM "users" WHERE "email" = 'usuario.demo@marketplace.local' LIMIT 1),
    'DETAIL_VIEW',
    '{"source":"seed","route":"/marketplace/apps/demo-seed-printful-print-on-demand","app":"printful"}'::jsonb,
    NOW() - INTERVAL '6 hours'
  ),
  (
    '84000000-0000-0000-0000-000000000002',
    '81000000-0000-0000-0000-000000000001',
    (SELECT "id" FROM "users" WHERE "email" = 'usuario.demo@marketplace.local' LIMIT 1),
    'WEB_OPEN',
    '{"source":"seed","route":"/marketplace/apps/demo-seed-printful-print-on-demand/use","app":"printful"}'::jsonb,
    NOW() - INTERVAL '5 hours'
  ),
  (
    '84000000-0000-0000-0000-000000000003',
    '81000000-0000-0000-0000-000000000002',
    (SELECT "id" FROM "users" WHERE "email" = 'usuario.demo@marketplace.local' LIMIT 1),
    'DETAIL_VIEW',
    '{"source":"seed","route":"/marketplace/apps/demo-seed-klaviyo-email-marketing","app":"klaviyo"}'::jsonb,
    NOW() - INTERVAL '4 hours'
  ),
  (
    '84000000-0000-0000-0000-000000000004',
    '81000000-0000-0000-0000-000000000002',
    (SELECT "id" FROM "users" WHERE "email" = 'usuario.demo@marketplace.local' LIMIT 1),
    'WEB_OPEN',
    '{"source":"seed","route":"/marketplace/apps/demo-seed-klaviyo-email-marketing/use","app":"klaviyo"}'::jsonb,
    NOW() - INTERVAL '3 hours'
  ),
  (
    '84000000-0000-0000-0000-000000000005',
    '81000000-0000-0000-0000-000000000003',
    (SELECT "id" FROM "users" WHERE "email" = 'usuario.demo@marketplace.local' LIMIT 1),
    'DETAIL_VIEW',
    '{"source":"seed","route":"/marketplace/apps/demo-seed-judgeme-product-reviews","app":"judgeme"}'::jsonb,
    NOW() - INTERVAL '2 hours'
  ),
  (
    '84000000-0000-0000-0000-000000000006',
    '81000000-0000-0000-0000-000000000004',
    (SELECT "id" FROM "users" WHERE "email" = 'usuario.demo@marketplace.local' LIMIT 1),
    'DETAIL_VIEW',
    '{"source":"seed","route":"/marketplace/apps/demo-seed-loox-photo-reviews","app":"loox"}'::jsonb,
    NOW() - INTERVAL '90 minutes'
  ),
  (
    '84000000-0000-0000-0000-000000000007',
    '81000000-0000-0000-0000-000000000005',
    (SELECT "id" FROM "users" WHERE "email" = 'usuario.demo@marketplace.local' LIMIT 1),
    'WEB_OPEN',
    '{"source":"seed","route":"/marketplace/apps/demo-seed-dsers-dropshipping/use","app":"dsers"}'::jsonb,
    NOW() - INTERVAL '45 minutes'
  ),
  (
    '84000000-0000-0000-0000-000000000008',
    '81000000-0000-0000-0000-000000000006',
    (SELECT "id" FROM "users" WHERE "email" = 'usuario.demo@marketplace.local' LIMIT 1),
    'PACKAGE_DOWNLOAD',
    '{"source":"seed","route":"/marketplace/apps/demo-seed-matrixify-data-toolkit/download","version":"v2.3.1","app":"matrixify"}'::jsonb,
    NOW() - INTERVAL '15 minutes'
  )
ON CONFLICT ("id")
DO UPDATE SET
  "app_id" = EXCLUDED."app_id",
  "user_id" = EXCLUDED."user_id",
  "type" = EXCLUDED."type",
  "metadata" = EXCLUDED."metadata",
  "created_at" = EXCLUDED."created_at";

INSERT INTO "marketplace_audit_events" (
  "id",
  "actor_user_id",
  "target_user_id",
  "app_id",
  "action",
  "reason",
  "metadata",
  "created_at"
)
VALUES
  (
    '85000000-0000-0000-0000-000000000001',
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    (SELECT "id" FROM "users" WHERE "email" = 'usuario.demo@marketplace.local' LIMIT 1),
    NULL,
    'ACCESS_APPROVED',
    'Aprobacion inicial para pruebas locales',
    '{"source":"seed"}'::jsonb,
    NOW()
  ),
  (
    '85000000-0000-0000-0000-000000000002',
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    (SELECT "id" FROM "users" WHERE "email" = 'rechazado.demo@marketplace.local' LIMIT 1),
    NULL,
    'ACCESS_REJECTED',
    'Rechazo inicial para pruebas de estado',
    '{"source":"seed"}'::jsonb,
    NOW()
  ),
  (
    '85000000-0000-0000-0000-000000000003',
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NULL,
    '81000000-0000-0000-0000-000000000001',
    'APP_PUBLISHED',
    'Publicacion inicial del demo Printful',
    '{"source":"seed","app":"printful"}'::jsonb,
    NOW()
  ),
  (
    '85000000-0000-0000-0000-000000000004',
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NULL,
    '81000000-0000-0000-0000-000000000002',
    'APP_PUBLISHED',
    'Publicacion inicial del demo Klaviyo',
    '{"source":"seed","app":"klaviyo"}'::jsonb,
    NOW()
  ),
  (
    '85000000-0000-0000-0000-000000000005',
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NULL,
    '81000000-0000-0000-0000-000000000003',
    'APP_PUBLISHED',
    'Publicacion inicial del demo Judge.me',
    '{"source":"seed","app":"judgeme"}'::jsonb,
    NOW()
  ),
  (
    '85000000-0000-0000-0000-000000000006',
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NULL,
    '81000000-0000-0000-0000-000000000004',
    'APP_PUBLISHED',
    'Publicacion inicial del demo Loox',
    '{"source":"seed","app":"loox"}'::jsonb,
    NOW()
  ),
  (
    '85000000-0000-0000-0000-000000000007',
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NULL,
    '81000000-0000-0000-0000-000000000005',
    'APP_PUBLISHED',
    'Publicacion inicial del demo DSers',
    '{"source":"seed","app":"dsers"}'::jsonb,
    NOW()
  ),
  (
    '85000000-0000-0000-0000-000000000008',
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NULL,
    '81000000-0000-0000-0000-000000000006',
    'APP_ARTIFACT_UPDATED',
    'Carga de toolkit de migracion para demo Matrixify',
    '{"source":"seed","app":"matrixify","artifact":"v2.3.1"}'::jsonb,
    NOW()
  ),
  (
    '85000000-0000-0000-0000-000000000009',
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    NULL,
    '81000000-0000-0000-0000-000000000007',
    'APP_CREATED',
    'Creacion de app draft para flujo editorial',
    '{"source":"seed","app":"bundle-lab-ai"}'::jsonb,
    NOW()
  )
ON CONFLICT ("id")
DO UPDATE SET
  "actor_user_id" = EXCLUDED."actor_user_id",
  "target_user_id" = EXCLUDED."target_user_id",
  "app_id" = EXCLUDED."app_id",
  "action" = EXCLUDED."action",
  "reason" = EXCLUDED."reason",
  "metadata" = EXCLUDED."metadata",
  "created_at" = EXCLUDED."created_at";

COMMIT;
