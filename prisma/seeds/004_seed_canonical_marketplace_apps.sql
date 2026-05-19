-- Seed: canonical marketplace apps and demo cleanup
BEGIN;

-- Remove demo/mock marketplace apps and their dependent records.
DELETE FROM "marketplace_app_storefront_version_languages"
WHERE "storefront_version_id" IN (
  SELECT sv."id"
  FROM "marketplace_app_storefront_versions" sv
  JOIN "marketplace_apps" apps ON apps."id" = sv."app_id"
  WHERE apps."slug" LIKE 'demo-seed-%'
);

DELETE FROM "marketplace_app_storefront_version_media"
WHERE "storefront_version_id" IN (
  SELECT sv."id"
  FROM "marketplace_app_storefront_versions" sv
  JOIN "marketplace_apps" apps ON apps."id" = sv."app_id"
  WHERE apps."slug" LIKE 'demo-seed-%'
);

DELETE FROM "marketplace_app_storefront_versions"
WHERE "app_id" IN (
  SELECT "id"
  FROM "marketplace_apps"
  WHERE "slug" LIKE 'demo-seed-%'
);

DELETE FROM "marketplace_app_artifacts"
WHERE "app_id" IN (
  SELECT "id"
  FROM "marketplace_apps"
  WHERE "slug" LIKE 'demo-seed-%'
);

DELETE FROM "marketplace_app_media"
WHERE "app_id" IN (
  SELECT "id"
  FROM "marketplace_apps"
  WHERE "slug" LIKE 'demo-seed-%'
);

DELETE FROM "marketplace_usage_events"
WHERE "app_id" IN (
  SELECT "id"
  FROM "marketplace_apps"
  WHERE "slug" LIKE 'demo-seed-%'
);

DELETE FROM "marketplace_audit_events"
WHERE "app_id" IN (
  SELECT "id"
  FROM "marketplace_apps"
  WHERE "slug" LIKE 'demo-seed-%'
);

DELETE FROM "marketplace_apps"
WHERE "slug" LIKE 'demo-seed-%';

WITH seed_actor AS (
  SELECT COALESCE(
    (SELECT "id" FROM "users" WHERE "email" = 'admin.demo@marketplace.local' LIMIT 1),
    (SELECT "id" FROM "users" ORDER BY "created_at" ASC LIMIT 1)
  ) AS "id"
)
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
    '95490fa5-9314-470e-9a22-b79e5619c44e',
    'dashboard-logistico',
    'Dashboard Logistico',
    'Panel logistico para monitorear operacion y entregas.',
    'Centraliza indicadores logisticos y seguimiento operativo para tomar decisiones rapidas.',
    'Accede al panel, revisa los indicadores clave y ejecuta acciones segun prioridad.',
    'WEB_LINK',
    'ACTIVE',
    'https://dashboard-logistico.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    'f687c4aa-1289-4ea2-9a05-4e380427df23',
    'shopify-store-cloner',
    'Shopify Store Cloner',
    'Clona estructuras base de tiendas Shopify para acelerar despliegues.',
    'Duplica configuraciones iniciales de tienda para lanzar nuevas tiendas mas rapido.',
    'Conecta la tienda origen, define el alcance de clonacion y ejecuta el proceso guiado.',
    'WEB_LINK',
    'ACTIVE',
    'https://shopify-store-cloner.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    '371afc36-52c0-42db-baab-6c4591a4767d',
    'wifi-add-report',
    'Wifi Add Report',
    'Genera reportes operativos de campanas y resultados.',
    'Consolida datos y produce reportes accionables para seguimiento comercial.',
    'Carga o sincroniza datos, selecciona periodo y exporta el reporte.',
    'WEB_LINK',
    'ACTIVE',
    'https://wifi-add-report.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    '3620e8e9-d776-40ad-afd1-897c71ebfef6',
    'wifi-numbers',
    'Wifi Numbers',
    'Calculadora y simulador para escenarios comerciales.',
    'Permite analizar proyecciones y decisiones con simulaciones numericas rapidas.',
    'Ingresa variables del negocio y ajusta escenarios para comparar resultados.',
    'WEB_LINK',
    'ACTIVE',
    'https://wifi-numbers.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    '8c1d44a6-fce3-494c-bae4-b1ceb8a8337d',
    'wifi-tiktoker-scanner',
    'Wifi Tiktoker Scanner',
    'Explora perfiles y senales para oportunidades en TikTok.',
    'Analiza cuentas y contenido para encontrar oportunidades de colaboracion o pauta.',
    'Ingresa criterios de busqueda, ejecuta escaneo y revisa resultados filtrados.',
    'WEB_LINK',
    'ACTIVE',
    'https://wifi-tiktoker-scanner.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    '6abb618d-3f12-4765-b71a-53041239cefe',
    'winner-adds',
    'Winner Ads',
    'Herramienta para identificar y gestionar anuncios ganadores.',
    'Detecta anuncios de alto rendimiento y prioriza optimizaciones de campana.',
    'Define el rango de analisis, filtra creatividad y prioriza los anuncios top.',
    'WEB_LINK',
    'ACTIVE',
    'https://winner-adds.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    '3e8cf1e4-ebb5-41cb-8a2c-3dcd43eb740c',
    'amazon-scanner',
    'Wi-Fi Amazon Money',
    'Escanea productos de Amazon y detecta oportunidades ganadoras para ecommerce.',
    'Portal privado para descargar la extension de Chrome que analiza productos de Amazon y ayuda a encontrar ganadores para tu tienda.',
    'Abre el portal privado, descarga el ZIP firmado, descomprime el archivo e instala la extension en Chrome desde Modo Desarrollador.',
    'WEB_LINK',
    'ACTIVE',
    'https://amazon-scanner.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    'dd8a6c76-25b1-46ad-8a44-86b35a96aecf',
    'temu-scanner',
    'Temu Sales Scanner - WiFi Money',
    'Escanea productos en Temu y filtra oportunidades por volumen de ventas.',
    'Portal privado para descargar la extension de Chrome que revisa listados de Temu y prioriza productos con mejor traccion comercial.',
    'Abre el portal privado, descarga el ZIP firmado, descomprime el archivo e instala la extension en Chrome desde Modo Desarrollador.',
    'WEB_LINK',
    'ACTIVE',
    'https://temu-scanner.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    '47e46e20-86db-4b2e-9fcc-971718c4ea2b',
    'tiktok-shop-scanner',
    'TikTok Shop Scanner - WiFi Money',
    'Escanea productos de TikTok Shop y clasifica oportunidades por ventas.',
    'Portal privado para descargar la extension de Chrome que analiza catalogos de TikTok Shop y resalta productos con mejor salida comercial.',
    'Abre el portal privado, descarga el ZIP firmado, descomprime el archivo e instala la extension en Chrome desde Modo Desarrollador.',
    'WEB_LINK',
    'ACTIVE',
    'https://tiktok-shop-scanner.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    '14bffd7e-e5e6-4456-9695-75045e74dce5',
    'winner-world-app',
    'Winner World App - Ad Library Scanner',
    'Escanea Meta Ad Library y detecta anunciantes con mayor actividad por nicho.',
    'Portal privado para descargar la extension de Chrome que analiza la Biblioteca de Anuncios de Meta y destaca jugadores dominantes por categoria.',
    'Abre el portal privado, descarga el ZIP firmado, descomprime el archivo e instala la extension en Chrome desde Modo Desarrollador.',
    'WEB_LINK',
    'ACTIVE',
    'https://winner-world-app.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  )
ON CONFLICT ("slug")
DO UPDATE SET
  "name" = EXCLUDED."name",
  "summary" = EXCLUDED."summary",
  "description" = EXCLUDED."description",
  "instructions" = EXCLUDED."instructions",
  "access_mode" = EXCLUDED."access_mode",
  "status" = EXCLUDED."status",
  "web_url" = EXCLUDED."web_url",
  "published_at" = COALESCE("marketplace_apps"."published_at", EXCLUDED."published_at"),
  "created_by_user_id" = COALESCE("marketplace_apps"."created_by_user_id", EXCLUDED."created_by_user_id"),
  "updated_by_user_id" = EXCLUDED."updated_by_user_id",
  "updated_at" = NOW();

COMMIT;
