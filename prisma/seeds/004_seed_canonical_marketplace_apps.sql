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
    'Controla entregas, incidencias y SLA en un solo panel operativo.',
    'Dashboard para equipos de fulfillment que necesitan ver atrasos, cuellos de botella y cumplimiento diario sin saltar entre hojas o chats.',
    'Conecta tus fuentes logisticas, revisa alertas priorizadas y asigna acciones para destrabar pedidos criticos en minutos.',
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
    'Replica la estructura de una tienda Shopify en minutos, no en dias.',
    'Clona colecciones, paginas, configuraciones base y arquitectura comercial para lanzar nuevas tiendas con un estandar consistente.',
    'Selecciona tienda origen y destino, define que modulos copiar y ejecuta la clonacion guiada para salir a produccion mas rapido.',
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
    'Convierte datos de campana en reportes listos para decidir.',
    'Centraliza resultados de trafico, ventas y rendimiento para detectar que escalar, que pausar y donde se esta fugando presupuesto.',
    'Sincroniza las fuentes, elige periodo y objetivo del reporte, y exporta un resumen accionable para equipo o cliente.',
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
    'Simula escenarios de negocio antes de comprometer presupuesto.',
    'Calculadora comercial para proyectar margen, CAC, punto de equilibrio y retorno esperado con distintos supuestos.',
    'Ingresa costos, precios y metas, ajusta variables clave y compara escenarios para tomar decisiones con respaldo numerico.',
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
    'Encuentra creadores con senal real para contenido y pauta.',
    'Analiza perfiles de TikTok por engagement, estilo y consistencia para detectar cuentas con potencial de colaboracion rentable.',
    'Define nicho, rango de audiencia y criterios de calidad, ejecuta el escaneo y guarda shortlist de perfiles prioritarios.',
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
    'Detecta anuncios ganadores y replica lo que ya funciona.',
    'Herramienta para filtrar creativos de alto rendimiento y entender patrones de hook, oferta y mensaje por nicho.',
    'Elige mercado y rango de fechas, aplica filtros de performance y prioriza los anuncios con mejor potencial de escalado.',
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
    'Escanea Amazon y revela productos con traccion comercial comprobada.',
    'Portal privado para instalar la extension que analiza listados, volumen de ventas y senales de demanda para encontrar oportunidades con menor riesgo.',
    'Abre el portal, descarga el ZIP firmado, instala la extension en Chrome y escanea categorias para priorizar productos con mejor salida.',
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
    'Escanea Temu y ordena productos por ventas reales.',
    'Portal privado para instalar la extension que rastrea listados de Temu, detecta volumen vendido y te ayuda a filtrar rapidamente oportunidades.',
    'Descarga el ZIP firmado, instala la extension en Chrome y ejecuta escaneos por categoria para exportar shortlist de productos ganadores.',
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
    '88aab0a2-8fcc-49d7-81e8-8998d7943782',
    'aliexpress-scanner',
    'AliExpress Sales Scanner - WiFi Money',
    'Escanea AliExpress y ordena oportunidades por ventas reales.',
    'Portal privado para instalar la extension que analiza listados de AliExpress, detecta volumen vendido y acelera tu proceso de seleccion de productos.',
    'Abre el portal privado, descarga el ZIP firmado, instala la extension en Chrome y ejecuta escaneos por categoria para exportar un shortlist accionable.',
    'WEB_LINK',
    'ACTIVE',
    'https://aliexpress-scanner.wifimoneystack.com',
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
    'Escanea TikTok Shop y prioriza productos con mayor velocidad de venta.',
    'Portal privado para instalar la extension que analiza catalogos de TikTok Shop y clasifica oportunidades segun traccion comercial.',
    'Descarga e instala la extension en Chrome, abre listados de TikTok Shop y filtra por ventas para quedarte con los candidatos mas fuertes.',
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
    'Explora Meta Ad Library y detecta anunciantes dominantes por nicho.',
    'Portal privado para instalar la extension que monitorea actividad publicitaria, frecuencia creativa y senales de escalado en Meta.',
    'Descarga el ZIP firmado, instala la extension y analiza bibliotecas por pais y categoria para mapear competidores de referencia.',
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
    'Transforma un producto en angulos de venta listos para ejecutar.',
    'App estrategica que convierte insights de producto en mensajes por nivel de consciencia, avatar y objeciones clave.',
    'Completa el brief del producto, define avatar y objetivo de campana, y genera un mapa de angulos con hooks y enfoques recomendados.',
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
    'Genera cientos de hooks con criterio comercial, no relleno.',
    'Produce bancos de hooks por avatar, dolor y mecanismo de oferta para acelerar pruebas creativas en performance.',
    'Ingresa producto, audiencia y tono, define volumen de salida y exporta hooks listos para anuncios, UGC o test A/B.',
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
    'Disena landings que convierten con una estructura probada.',
    'Construye el blueprint completo de una landing con propuesta de valor, secciones de persuasion y CTA orientadas a conversion.',
    'Carga contexto de producto, oferta y avatar, genera la arquitectura de la pagina y baja el plan para diseno o desarrollo.',
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
    'Evalua si un producto merece test, escalado o descarte.',
    'Analisis estructurado de demanda, margen, saturacion y viabilidad operativa para tomar decisiones de producto con menos intuicion y mas evidencia.',
    'Pega la URL del producto, revisa el score por dimension y aplica la recomendacion final para definir tu siguiente movimiento.',
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
    'Descubre oportunidades de producto donde otros no estan mirando.',
    'Laboratorio de research para explorar nichos y encontrar candidatos con potencial de marca, rentabilidad y diferenciacion.',
    'Selecciona nicho y objetivo comercial, genera un shortlist priorizado y usa la lectura estrategica para decidir que validar primero.',
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
    'Conecta Meta Ads y detecta mejoras accionables en minutos.',
    'Subapp de analitica operativa que identifica fugas de presupuesto, fatiga creativa y oportunidades de optimizacion por preset.',
    'Conecta tu cuenta de Meta Ads, elige rango de fechas y ejecuta presets para obtener recomendaciones claras y pasos siguientes.',
    'WEB_LINK',
    'ACTIVE',
    'https://facebook-insights.wifimoneystack.com',
    NOW(),
    (SELECT "id" FROM seed_actor),
    (SELECT "id" FROM seed_actor),
    NOW(),
    NOW()
  ),
  (
    'df3572cf-aa88-4dbe-b7ae-e88ab3872bbb',
    'dropi-ops-analyzer',
    'Dropi Ops Analyzer',
    'Analiza pedidos Dropi y detecta alertas logísticas antes de perder margen.',
    'Subapp operativa para procesar exportes de Dropi en XLSX o CSV y generar métricas de entregas, tránsito, recaudo, flete promedio y estados críticos.',
    'Carga tu reporte de Dropi, revisa el panel de indicadores y prioriza las alertas críticas para corregir operación y recaudo más rápido.',
    'WEB_LINK',
    'ACTIVE',
    'https://dropi-ops-analyzer.wifimoneystack.com',
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
