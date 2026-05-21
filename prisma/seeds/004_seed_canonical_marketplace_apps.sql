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
  ),
  (
    '1b65238b-554c-4b4c-bc5f-f80f2b922119',
    'angle-finder',
    'Angle Finder',
    'Convierte productos en angulos de venta por consciencia y avatar.',
    'App de estrategia creativa que transforma la informacion de un producto en niveles de consciencia, avatares accionables y angulos listos para anuncios o guiones.',
    'Completa el brief del producto y genera un mapa de consciencia con hooks, escenas y angulos psicologicos para ejecutar creativos.',
    'WEB_LINK',
    'ACTIVE',
    'https://angle-finder.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    '2dbfa08a-6e1e-410e-bcab-5aadb5ff9b12',
    'hook-generator',
    'Hook Generator',
    'Genera bancos de hooks por angulo, avatar y enfoque creativo.',
    'App de output creativo para producir hooks de alto volumen, organizados por angulo, insight y tipo de testeo para performance marketing.',
    'Ingresa el producto, define avatar, tono y volumen esperado para obtener un banco de hooks listo para anuncios, UGC y pruebas A/B.',
    'WEB_LINK',
    'ACTIVE',
    'https://hook-generator.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    '593681ef-0481-4934-840a-95d247f2dbbb',
    'landing-booster',
    'Landing Booster',
    'Construye el blueprint completo de una landing orientada a conversion.',
    'App de arquitectura comercial que entrega hero, oferta, CTA, FAQ, comparativa, pruebas y optimizaciones para bajar a diseno o desarrollo.',
    'Carga el contexto del producto, avatar y oferta para generar una estructura completa de landing lista para conversion.',
    'WEB_LINK',
    'ACTIVE',
    'https://landing-booster.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    '0330a80d-786c-4b9f-ae5f-a9d2091a5cb4',
    'product-analytics',
    'Product Analytics',
    'Evalua potencial winner con score, margen, saturacion y estrategia.',
    'App de investigacion comercial que combina lectura de producto y senales publicas para decidir si un producto merece test, escalado o descarte.',
    'Pega la URL del producto y revisa un score estructurado con demanda, pricing, logistica, creatividades y recomendacion final.',
    'WEB_LINK',
    'ACTIVE',
    'https://product-analytics.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    '75a1c705-4f91-491a-9273-6da6845afccd',
    'winner-lab',
    'Winner Lab',
    'Explora nichos quimicos y detecta oportunidades de producto con ventaja.',
    'App de research guiado para encontrar candidatos de productos liquidos o semiliquidos con potencial de marca, maquila o ecommerce.',
    'Selecciona un nicho, el numero de oportunidades y el objetivo comercial para obtener un shortlist accionable con lectura estrategica.',
    'WEB_LINK',
    'ACTIVE',
    'https://winner-lab.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    'e3b6e66f-c156-4103-a492-06c9ded9b72d',
    'facebook-insights',
    'Facebook Insights',
    'Conecta Meta Ads y ejecuta presets operativos para optimizar campanas.',
    'Subapp standalone para conectar credenciales del usuario y ejecutar analisis accionables de performance, fuga de presupuesto y fatiga creativa.',
    'Conecta tu cuenta de Meta Ads, selecciona rango de fechas y ejecuta cualquiera de los presets para obtener recomendaciones inmediatas.',
    'WEB_LINK',
    'ACTIVE',
    'https://facebook-insights.wifimoneystack.com',
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
