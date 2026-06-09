-- Seed: skills de Claude (dropshipping, ecommerce, Meta Ads)
-- Generado desde la DB local. Idempotente. Assets en bucket compartido.
BEGIN;

-- Auditoría de Tienda Shopify
INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")
VALUES ('7e8bb375-9042-4c1f-927e-cd9711c139f2', 'dropshipping-auditoria-tienda-shopify', 'Auditoría de Tienda Shopify', 'Audita tu tienda Shopify para subir conversión: página de producto, confianza, móvil y checkout.', 'Audita una tienda Shopify (o landing de dropshipping) para maximizar conversión y confianza. Úsalo cuando el usuario comparta el enlace o describa su tienda y quiera saber qué arreglar, por qué no convierte, cómo subir la tasa de conversión o cómo verse más confiable. Cubre página de producto, checkout, velocidad, prueba social y señales de confianza.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('e6007ce6-5a76-4735-8135-a45f64a273fb', '7e8bb375-9042-4c1f-927e-cd9711c139f2', 'ICON', 'marketplace/storefronts/dropshipping-auditoria-tienda-shopify/icon.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/dropshipping-auditoria-tienda-shopify/icon.svg', 'Ícono de Auditoría de Tienda Shopify', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('3c2d2293-40b8-4e8d-9479-c9bba5411561', '7e8bb375-9042-4c1f-927e-cd9711c139f2', 'SCREENSHOT', 'marketplace/storefronts/dropshipping-auditoria-tienda-shopify/hero.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/dropshipping-auditoria-tienda-shopify/hero.svg', 'Vista de Auditoría de Tienda Shopify', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")
VALUES ('2b0089ac-9175-43db-b134-a3d1d8b17060', '7e8bb375-9042-4c1f-927e-cd9711c139f2', 'marketplace/artifacts/dropshipping-auditoria-tienda-shopify/skill.zip', 'dropshipping-auditoria-tienda-shopify.zip', 'application/zip', 2044, '1.0.0', '{"raw":{"name":"dropshipping-auditoria-tienda-shopify","license":"MIT","version":"1.0.0","metadata":{"category":"dropshipping","language":"es"},"description":"Audita una tienda Shopify (o landing de dropshipping) para maximizar conversión y confianza. Úsalo cuando el usuario comparta el enlace o describa su tienda y quiera saber qué arreglar, por qué no convierte, cómo subir la tasa de conversión o cómo verse más confiable. Cubre página de producto, checkout, velocidad, prueba social y señales de confianza."},"name":"dropshipping-auditoria-tienda-shopify","license":"MIT","version":"1.0.0","description":"Audita una tienda Shopify (o landing de dropshipping) para maximizar conversión y confianza. Úsalo cuando el usuario comparta el enlace o describa su tienda y quiera saber qué arreglar, por qué no convierte, cómo subir la tasa de conversión o cómo verse más confiable. Cubre página de producto, checkout, velocidad, prueba social y señales de confianza.","source_path":"dropshipping-auditoria-tienda-shopify/SKILL.md","allowed_tools":[]}'::jsonb, TRUE, '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")
VALUES ('a844c085-c2fa-4738-8367-356abcce7d21', '7e8bb375-9042-4c1f-927e-cd9711c139f2', 'PUBLISHED', 'READY', 'Audita tu tienda Shopify para subir conversión: página de producto, confianza, móvil y checkout.', 'Audita una tienda Shopify (o landing de dropshipping) para maximizar conversión y confianza. Úsalo cuando el usuario comparta el enlace o describa su tienda y quiera saber qué arreglar, por qué no convierte, cómo subir la tasa de conversión o cómo verse más confiable. Cubre página de producto, checkout, velocidad, prueba social y señales de confianza.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'WiFiMoneyStack', 'https://wifimoneystack.com', NULL, NULL, NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("app_id","kind") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")
VALUES ('401cc177-3365-4e13-b4b0-16f7ee29acd4', 'a844c085-c2fa-4738-8367-356abcce7d21', 'es', 0, NOW())
ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('247f0f3a-206a-4303-9818-ba260d92aaa9', 'a844c085-c2fa-4738-8367-356abcce7d21', 'e6007ce6-5a76-4735-8135-a45f64a273fb', 0, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('3c72268b-7299-44d3-9e38-d02d767e0417', 'a844c085-c2fa-4738-8367-356abcce7d21', '3c2d2293-40b8-4e8d-9479-c9bba5411561', 1, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;

-- Fulfillment y Postventa
INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")
VALUES ('f8143b3a-50e2-46a5-9429-fe732078d661', 'dropshipping-fulfillment-postventa', 'Fulfillment y Postventa', 'Gestiona envíos, tracking, devoluciones, disputas y soporte para reducir chargebacks.', 'Gestiona fulfillment, seguimiento de envíos, devoluciones, disputas y soporte postventa en dropshipping. Úsalo cuando el usuario tenga problemas de envíos retrasados, clientes molestos, chargebacks/disputas de PayPal o Stripe, alta tasa de devoluciones, o quiera plantillas de atención al cliente y SOPs de operación.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('a90c2e1e-e92d-4272-b629-86aaa7896099', 'f8143b3a-50e2-46a5-9429-fe732078d661', 'ICON', 'marketplace/storefronts/dropshipping-fulfillment-postventa/icon.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/dropshipping-fulfillment-postventa/icon.svg', 'Ícono de Fulfillment y Postventa', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('7fd88b56-fad2-4640-835d-e43a08406da8', 'f8143b3a-50e2-46a5-9429-fe732078d661', 'SCREENSHOT', 'marketplace/storefronts/dropshipping-fulfillment-postventa/hero.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/dropshipping-fulfillment-postventa/hero.svg', 'Vista de Fulfillment y Postventa', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")
VALUES ('e4620ddb-0d4b-43a5-a432-9d45d6d4608a', 'f8143b3a-50e2-46a5-9429-fe732078d661', 'marketplace/artifacts/dropshipping-fulfillment-postventa/skill.zip', 'dropshipping-fulfillment-postventa.zip', 'application/zip', 2064, '1.0.0', '{"raw":{"name":"dropshipping-fulfillment-postventa","license":"MIT","version":"1.0.0","metadata":{"category":"dropshipping","language":"es"},"description":"Gestiona fulfillment, seguimiento de envíos, devoluciones, disputas y soporte postventa en dropshipping. Úsalo cuando el usuario tenga problemas de envíos retrasados, clientes molestos, chargebacks/disputas de PayPal o Stripe, alta tasa de devoluciones, o quiera plantillas de atención al cliente y SOPs de operación."},"name":"dropshipping-fulfillment-postventa","license":"MIT","version":"1.0.0","description":"Gestiona fulfillment, seguimiento de envíos, devoluciones, disputas y soporte postventa en dropshipping. Úsalo cuando el usuario tenga problemas de envíos retrasados, clientes molestos, chargebacks/disputas de PayPal o Stripe, alta tasa de devoluciones, o quiera plantillas de atención al cliente y SOPs de operación.","source_path":"dropshipping-fulfillment-postventa/SKILL.md","allowed_tools":[]}'::jsonb, TRUE, '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")
VALUES ('f5b64625-467f-4d19-88bb-abc67f136a93', 'f8143b3a-50e2-46a5-9429-fe732078d661', 'PUBLISHED', 'READY', 'Gestiona envíos, tracking, devoluciones, disputas y soporte para reducir chargebacks.', 'Gestiona fulfillment, seguimiento de envíos, devoluciones, disputas y soporte postventa en dropshipping. Úsalo cuando el usuario tenga problemas de envíos retrasados, clientes molestos, chargebacks/disputas de PayPal o Stripe, alta tasa de devoluciones, o quiera plantillas de atención al cliente y SOPs de operación.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'WiFiMoneyStack', 'https://wifimoneystack.com', NULL, NULL, NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("app_id","kind") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")
VALUES ('5affe007-e64b-4f58-b31b-d5be7a7f45f1', 'f5b64625-467f-4d19-88bb-abc67f136a93', 'es', 0, NOW())
ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('d9b38ca2-f56b-4bb1-8dcd-f3e574f430d5', 'f5b64625-467f-4d19-88bb-abc67f136a93', 'a90c2e1e-e92d-4272-b629-86aaa7896099', 0, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('f8c6576b-1c3f-4dc3-9764-00ad4dc5b41e', 'f5b64625-467f-4d19-88bb-abc67f136a93', '7fd88b56-fad2-4640-835d-e43a08406da8', 1, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;

-- Investigación de Productos Ganadores
INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")
VALUES ('3ed6fa69-6f5a-48ec-b01c-9d0fbf1c0c30', 'dropshipping-investigacion-productos', 'Investigación de Productos Ganadores', 'Encuentra y puntúa productos ganadores para dropshipping con criterios de validación y unit economics.', 'Investiga, valida y puntúa productos ganadores para dropshipping. Úsalo cuando necesites encontrar productos con demanda, evaluar si un producto vale la pena, analizar competencia, estimar márgenes o decidir qué vender. Cubre criterios de validación, scoring y señales de tendencia para ecommerce y dropshipping en LATAM.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('22ac6f82-233d-41c9-871b-1d91d362295e', '3ed6fa69-6f5a-48ec-b01c-9d0fbf1c0c30', 'ICON', 'marketplace/storefronts/dropshipping-investigacion-productos/icon.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/dropshipping-investigacion-productos/icon.svg', 'Ícono de Investigación de Productos Ganadores', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('833a4374-e8e0-4d4e-8a67-80b0e1d5ad89', '3ed6fa69-6f5a-48ec-b01c-9d0fbf1c0c30', 'SCREENSHOT', 'marketplace/storefronts/dropshipping-investigacion-productos/hero.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/dropshipping-investigacion-productos/hero.svg', 'Vista de Investigación de Productos Ganadores', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")
VALUES ('52dab964-82fb-487a-8fd1-b69945aa395a', '3ed6fa69-6f5a-48ec-b01c-9d0fbf1c0c30', 'marketplace/artifacts/dropshipping-investigacion-productos/skill.zip', 'dropshipping-investigacion-productos.zip', 'application/zip', 2167, '1.0.0', '{"raw":{"name":"dropshipping-investigacion-productos","license":"MIT","version":"1.0.0","metadata":{"category":"dropshipping","language":"es"},"description":"Investiga, valida y puntúa productos ganadores para dropshipping. Úsalo cuando necesites encontrar productos con demanda, evaluar si un producto vale la pena, analizar competencia, estimar márgenes o decidir qué vender. Cubre criterios de validación, scoring y señales de tendencia para ecommerce y dropshipping en LATAM."},"name":"dropshipping-investigacion-productos","license":"MIT","version":"1.0.0","description":"Investiga, valida y puntúa productos ganadores para dropshipping. Úsalo cuando necesites encontrar productos con demanda, evaluar si un producto vale la pena, analizar competencia, estimar márgenes o decidir qué vender. Cubre criterios de validación, scoring y señales de tendencia para ecommerce y dropshipping en LATAM.","source_path":"dropshipping-investigacion-productos/SKILL.md","allowed_tools":[]}'::jsonb, TRUE, '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")
VALUES ('962a95fa-c6c8-4dbb-8318-3234d4598df8', '3ed6fa69-6f5a-48ec-b01c-9d0fbf1c0c30', 'PUBLISHED', 'READY', 'Encuentra y puntúa productos ganadores para dropshipping con criterios de validación y unit economics.', 'Investiga, valida y puntúa productos ganadores para dropshipping. Úsalo cuando necesites encontrar productos con demanda, evaluar si un producto vale la pena, analizar competencia, estimar márgenes o decidir qué vender. Cubre criterios de validación, scoring y señales de tendencia para ecommerce y dropshipping en LATAM.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'WiFiMoneyStack', 'https://wifimoneystack.com', NULL, NULL, NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("app_id","kind") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")
VALUES ('d7e96a24-4753-4c05-9183-66281f62f631', '962a95fa-c6c8-4dbb-8318-3234d4598df8', 'es', 0, NOW())
ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('a2473fe2-41de-4fe5-8f77-3fcc757cea35', '962a95fa-c6c8-4dbb-8318-3234d4598df8', '22ac6f82-233d-41c9-871b-1d91d362295e', 0, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('6ff489dc-eb2d-4093-90db-456d9772a113', '962a95fa-c6c8-4dbb-8318-3234d4598df8', '833a4374-e8e0-4d4e-8a67-80b0e1d5ad89', 1, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;

-- Sourcing y Proveedores
INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")
VALUES ('132c6add-88f8-4ef1-a9d3-4e7f7dbca476', 'dropshipping-sourcing-proveedores', 'Sourcing y Proveedores', 'Elige, vetea y negocia con proveedores confiables (AliExpress, CJ, agentes) por costo y tiempos.', 'Encuentra, evalúa y negocia con proveedores para dropshipping (AliExpress, CJdropshipping, agentes, proveedores locales). Úsalo cuando necesites elegir un proveedor confiable, comparar costos y tiempos de envío, vetar a un supplier, negociar precios/MOQ o pasar de AliExpress a un agente para escalar.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('c72d7236-56ed-4a1d-97a0-6d319675e831', '132c6add-88f8-4ef1-a9d3-4e7f7dbca476', 'ICON', 'marketplace/storefronts/dropshipping-sourcing-proveedores/icon.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/dropshipping-sourcing-proveedores/icon.svg', 'Ícono de Sourcing y Proveedores', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('807412ee-5ae6-4e8b-862d-02eb883be839', '132c6add-88f8-4ef1-a9d3-4e7f7dbca476', 'SCREENSHOT', 'marketplace/storefronts/dropshipping-sourcing-proveedores/hero.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/dropshipping-sourcing-proveedores/hero.svg', 'Vista de Sourcing y Proveedores', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")
VALUES ('a09a672d-3ebe-4c04-9cd3-9183dc6743ed', '132c6add-88f8-4ef1-a9d3-4e7f7dbca476', 'marketplace/artifacts/dropshipping-sourcing-proveedores/skill.zip', 'dropshipping-sourcing-proveedores.zip', 'application/zip', 1855, '1.0.0', '{"raw":{"name":"dropshipping-sourcing-proveedores","license":"MIT","version":"1.0.0","metadata":{"category":"dropshipping","language":"es"},"description":"Encuentra, evalúa y negocia con proveedores para dropshipping (AliExpress, CJdropshipping, agentes, proveedores locales). Úsalo cuando necesites elegir un proveedor confiable, comparar costos y tiempos de envío, vetar a un supplier, negociar precios/MOQ o pasar de AliExpress a un agente para escalar."},"name":"dropshipping-sourcing-proveedores","license":"MIT","version":"1.0.0","description":"Encuentra, evalúa y negocia con proveedores para dropshipping (AliExpress, CJdropshipping, agentes, proveedores locales). Úsalo cuando necesites elegir un proveedor confiable, comparar costos y tiempos de envío, vetar a un supplier, negociar precios/MOQ o pasar de AliExpress a un agente para escalar.","source_path":"dropshipping-sourcing-proveedores/SKILL.md","allowed_tools":[]}'::jsonb, TRUE, '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")
VALUES ('92e3add8-c743-432b-9097-c39caeb53e15', '132c6add-88f8-4ef1-a9d3-4e7f7dbca476', 'PUBLISHED', 'READY', 'Elige, vetea y negocia con proveedores confiables (AliExpress, CJ, agentes) por costo y tiempos.', 'Encuentra, evalúa y negocia con proveedores para dropshipping (AliExpress, CJdropshipping, agentes, proveedores locales). Úsalo cuando necesites elegir un proveedor confiable, comparar costos y tiempos de envío, vetar a un supplier, negociar precios/MOQ o pasar de AliExpress a un agente para escalar.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'WiFiMoneyStack', 'https://wifimoneystack.com', NULL, NULL, NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("app_id","kind") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")
VALUES ('18437492-0c87-4699-a3ef-785283dd5e2c', '92e3add8-c743-432b-9097-c39caeb53e15', 'es', 0, NOW())
ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('b861d48b-ca71-4abf-ba7c-b1d4e58a000b', '92e3add8-c743-432b-9097-c39caeb53e15', 'c72d7236-56ed-4a1d-97a0-6d319675e831', 0, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('39915c93-1b65-4fac-828e-2a1264c8d19e', '92e3add8-c743-432b-9097-c39caeb53e15', '807412ee-5ae6-4e8b-862d-02eb883be839', 1, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;

-- Copy de Producto que Vende
INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")
VALUES ('d38543a5-90a4-4d37-a580-560f3f5b4719', 'ecommerce-copy-producto', 'Copy de Producto que Vende', 'Redacta fichas de producto persuasivas y con SEO: títulos, beneficios y manejo de objeciones.', 'Escribe descripciones de producto que venden y posicionan en buscadores para ecommerce y dropshipping. Úsalo cuando el usuario necesite redactar o mejorar fichas de producto, títulos, bullets de beneficios, descripciones largas, o copy persuasivo orientado a conversión y SEO. Convierte características en beneficios y mata objeciones.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('a2a2b38c-c677-483e-8cf2-434948f09346', 'd38543a5-90a4-4d37-a580-560f3f5b4719', 'ICON', 'marketplace/storefronts/ecommerce-copy-producto/icon.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/ecommerce-copy-producto/icon.svg', 'Ícono de Copy de Producto que Vende', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('1417f951-1324-456c-8beb-c26d66d5fa90', 'd38543a5-90a4-4d37-a580-560f3f5b4719', 'SCREENSHOT', 'marketplace/storefronts/ecommerce-copy-producto/hero.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/ecommerce-copy-producto/hero.svg', 'Vista de Copy de Producto que Vende', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")
VALUES ('9472a697-259c-4303-a360-007b7fa67aa9', 'd38543a5-90a4-4d37-a580-560f3f5b4719', 'marketplace/artifacts/ecommerce-copy-producto/skill.zip', 'ecommerce-copy-producto.zip', 'application/zip', 1809, '1.0.0', '{"raw":{"name":"ecommerce-copy-producto","license":"MIT","version":"1.0.0","metadata":{"category":"ecommerce","language":"es"},"description":"Escribe descripciones de producto que venden y posicionan en buscadores para ecommerce y dropshipping. Úsalo cuando el usuario necesite redactar o mejorar fichas de producto, títulos, bullets de beneficios, descripciones largas, o copy persuasivo orientado a conversión y SEO. Convierte características en beneficios y mata objeciones."},"name":"ecommerce-copy-producto","license":"MIT","version":"1.0.0","description":"Escribe descripciones de producto que venden y posicionan en buscadores para ecommerce y dropshipping. Úsalo cuando el usuario necesite redactar o mejorar fichas de producto, títulos, bullets de beneficios, descripciones largas, o copy persuasivo orientado a conversión y SEO. Convierte características en beneficios y mata objeciones.","source_path":"ecommerce-copy-producto/SKILL.md","allowed_tools":[]}'::jsonb, TRUE, '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")
VALUES ('adc305d2-ad75-4e00-831d-f3e772b5ca30', 'd38543a5-90a4-4d37-a580-560f3f5b4719', 'PUBLISHED', 'READY', 'Redacta fichas de producto persuasivas y con SEO: títulos, beneficios y manejo de objeciones.', 'Escribe descripciones de producto que venden y posicionan en buscadores para ecommerce y dropshipping. Úsalo cuando el usuario necesite redactar o mejorar fichas de producto, títulos, bullets de beneficios, descripciones largas, o copy persuasivo orientado a conversión y SEO. Convierte características en beneficios y mata objeciones.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'WiFiMoneyStack', 'https://wifimoneystack.com', NULL, NULL, NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("app_id","kind") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")
VALUES ('3c65509e-8d82-467f-b76b-edfba76c0fe4', 'adc305d2-ad75-4e00-831d-f3e772b5ca30', 'es', 0, NOW())
ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('fb86162a-ce46-46c5-9b59-7b02acfeb511', 'adc305d2-ad75-4e00-831d-f3e772b5ca30', 'a2a2b38c-c677-483e-8cf2-434948f09346', 0, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('44a424d1-27e1-4f98-be79-204b274c4e2e', 'adc305d2-ad75-4e00-831d-f3e772b5ca30', '1417f951-1324-456c-8beb-c26d66d5fa90', 1, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;

-- CRO de Landing Pages
INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")
VALUES ('9649902e-ad64-4653-9a1d-4275e328308b', 'ecommerce-cro-landing', 'CRO de Landing Pages', 'Sube la conversión de landings y PDP: estructura, copy, prueba social y pruebas A/B priorizadas.', 'Optimiza la tasa de conversión (CRO) de landing pages y páginas de producto para ecommerce y dropshipping. Úsalo cuando el usuario quiera subir la conversión de una landing/PDP, diseñar una página de venta de un solo producto (advertorial o landing directa), priorizar pruebas A/B, o estructurar el copy y los elementos de la página para convertir tráfico pago.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('a6042b73-4bd6-486d-a09c-7bc743e608cd', '9649902e-ad64-4653-9a1d-4275e328308b', 'ICON', 'marketplace/storefronts/ecommerce-cro-landing/icon.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/ecommerce-cro-landing/icon.svg', 'Ícono de CRO de Landing Pages', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('a33cb82c-c681-4759-987f-b75e22f2952c', '9649902e-ad64-4653-9a1d-4275e328308b', 'SCREENSHOT', 'marketplace/storefronts/ecommerce-cro-landing/hero.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/ecommerce-cro-landing/hero.svg', 'Vista de CRO de Landing Pages', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")
VALUES ('b4030c2c-8764-4db5-b3db-4e6e8f1b9fb4', '9649902e-ad64-4653-9a1d-4275e328308b', 'marketplace/artifacts/ecommerce-cro-landing/skill.zip', 'ecommerce-cro-landing.zip', 'application/zip', 1922, '1.0.0', '{"raw":{"name":"ecommerce-cro-landing","license":"MIT","version":"1.0.0","metadata":{"category":"ecommerce","language":"es"},"description":"Optimiza la tasa de conversión (CRO) de landing pages y páginas de producto para ecommerce y dropshipping. Úsalo cuando el usuario quiera subir la conversión de una landing/PDP, diseñar una página de venta de un solo producto (advertorial o landing directa), priorizar pruebas A/B, o estructurar el copy y los elementos de la página para convertir tráfico pago."},"name":"ecommerce-cro-landing","license":"MIT","version":"1.0.0","description":"Optimiza la tasa de conversión (CRO) de landing pages y páginas de producto para ecommerce y dropshipping. Úsalo cuando el usuario quiera subir la conversión de una landing/PDP, diseñar una página de venta de un solo producto (advertorial o landing directa), priorizar pruebas A/B, o estructurar el copy y los elementos de la página para convertir tráfico pago.","source_path":"ecommerce-cro-landing/SKILL.md","allowed_tools":[]}'::jsonb, TRUE, '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")
VALUES ('28801071-0722-43eb-9bd3-5d57fe0ece99', '9649902e-ad64-4653-9a1d-4275e328308b', 'PUBLISHED', 'READY', 'Sube la conversión de landings y PDP: estructura, copy, prueba social y pruebas A/B priorizadas.', 'Optimiza la tasa de conversión (CRO) de landing pages y páginas de producto para ecommerce y dropshipping. Úsalo cuando el usuario quiera subir la conversión de una landing/PDP, diseñar una página de venta de un solo producto (advertorial o landing directa), priorizar pruebas A/B, o estructurar el copy y los elementos de la página para convertir tráfico pago.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'WiFiMoneyStack', 'https://wifimoneystack.com', NULL, NULL, NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("app_id","kind") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")
VALUES ('eb5adbdf-e347-4605-8221-92d92c1f0591', '28801071-0722-43eb-9bd3-5d57fe0ece99', 'es', 0, NOW())
ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('68231bca-8295-4f0a-8e1f-911aef82409f', '28801071-0722-43eb-9bd3-5d57fe0ece99', 'a6042b73-4bd6-486d-a09c-7bc743e608cd', 0, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('4ec1b52c-592d-48b8-9c50-bd3eb98fc67a', '28801071-0722-43eb-9bd3-5d57fe0ece99', 'a33cb82c-c681-4759-987f-b75e22f2952c', 1, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;

-- Flujos de Email & SMS
INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")
VALUES ('7eaaa6b3-e448-4980-ab96-c6de251dcc52', 'ecommerce-email-flows-klaviyo', 'Flujos de Email & SMS', 'Diseña automatizaciones (carrito, bienvenida, postventa, winback) para recuperar ventas y recompra.', 'Diseña y redacta flujos de email y SMS para ecommerce (Klaviyo, Shopify Email, Mailchimp). Úsalo cuando el usuario quiera crear o mejorar automatizaciones de bienvenida, carrito abandonado, checkout abandonado, post-compra, winback, o campañas de email marketing para recuperar ventas y subir la recompra.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('1b323587-f025-41df-9f91-5665b1d27bec', '7eaaa6b3-e448-4980-ab96-c6de251dcc52', 'ICON', 'marketplace/storefronts/ecommerce-email-flows-klaviyo/icon.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/ecommerce-email-flows-klaviyo/icon.svg', 'Ícono de Flujos de Email & SMS', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('e42d3a7a-6e2a-41ed-8174-f3de09cf3a46', '7eaaa6b3-e448-4980-ab96-c6de251dcc52', 'SCREENSHOT', 'marketplace/storefronts/ecommerce-email-flows-klaviyo/hero.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/ecommerce-email-flows-klaviyo/hero.svg', 'Vista de Flujos de Email & SMS', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")
VALUES ('bb558ed0-cc7d-4026-9f48-b9a4e6a94393', '7eaaa6b3-e448-4980-ab96-c6de251dcc52', 'marketplace/artifacts/ecommerce-email-flows-klaviyo/skill.zip', 'ecommerce-email-flows-klaviyo.zip', 'application/zip', 1811, '1.0.0', '{"raw":{"name":"ecommerce-email-flows-klaviyo","license":"MIT","version":"1.0.0","metadata":{"category":"ecommerce","language":"es"},"description":"Diseña y redacta flujos de email y SMS para ecommerce (Klaviyo, Shopify Email, Mailchimp). Úsalo cuando el usuario quiera crear o mejorar automatizaciones de bienvenida, carrito abandonado, checkout abandonado, post-compra, winback, o campañas de email marketing para recuperar ventas y subir la recompra."},"name":"ecommerce-email-flows-klaviyo","license":"MIT","version":"1.0.0","description":"Diseña y redacta flujos de email y SMS para ecommerce (Klaviyo, Shopify Email, Mailchimp). Úsalo cuando el usuario quiera crear o mejorar automatizaciones de bienvenida, carrito abandonado, checkout abandonado, post-compra, winback, o campañas de email marketing para recuperar ventas y subir la recompra.","source_path":"ecommerce-email-flows-klaviyo/SKILL.md","allowed_tools":[]}'::jsonb, TRUE, '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")
VALUES ('786a5f23-bb76-4b4f-9bc4-7d42f5891688', '7eaaa6b3-e448-4980-ab96-c6de251dcc52', 'PUBLISHED', 'READY', 'Diseña automatizaciones (carrito, bienvenida, postventa, winback) para recuperar ventas y recompra.', 'Diseña y redacta flujos de email y SMS para ecommerce (Klaviyo, Shopify Email, Mailchimp). Úsalo cuando el usuario quiera crear o mejorar automatizaciones de bienvenida, carrito abandonado, checkout abandonado, post-compra, winback, o campañas de email marketing para recuperar ventas y subir la recompra.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'WiFiMoneyStack', 'https://wifimoneystack.com', NULL, NULL, NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("app_id","kind") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")
VALUES ('21baff05-61b1-4ad1-93aa-515aa0a354ba', '786a5f23-bb76-4b4f-9bc4-7d42f5891688', 'es', 0, NOW())
ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('012a082d-815e-41a9-9d47-4188f02bea73', '786a5f23-bb76-4b4f-9bc4-7d42f5891688', '1b323587-f025-41df-9f91-5665b1d27bec', 0, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('d1ed11f1-5232-420e-b376-40a48e0be156', '786a5f23-bb76-4b4f-9bc4-7d42f5891688', 'e42d3a7a-6e2a-41ed-8174-f3de09cf3a46', 1, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;

-- SEO para Shopify
INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")
VALUES ('de152d33-ba01-44b3-9f17-954ab86f0e7b', 'ecommerce-seo-shopify', 'SEO para Shopify', 'Optimiza SEO on-page para traer tráfico orgánico: títulos, meta, colecciones y datos estructurados.', 'Optimiza el SEO on-page de una tienda Shopify o ecommerce para traer tráfico orgánico gratis. Úsalo cuando el usuario quiera posicionar productos y colecciones en Google, mejorar títulos y meta descripciones, estructurar colecciones, agregar datos estructurados (schema), o hacer keyword research para ecommerce.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('468f4b16-3e9e-495b-b892-3404e681358f', 'de152d33-ba01-44b3-9f17-954ab86f0e7b', 'ICON', 'marketplace/storefronts/ecommerce-seo-shopify/icon.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/ecommerce-seo-shopify/icon.svg', 'Ícono de SEO para Shopify', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('7c988b02-8c6d-45ec-a50c-a7db5e69e5ab', 'de152d33-ba01-44b3-9f17-954ab86f0e7b', 'SCREENSHOT', 'marketplace/storefronts/ecommerce-seo-shopify/hero.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/ecommerce-seo-shopify/hero.svg', 'Vista de SEO para Shopify', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")
VALUES ('05681efc-0f69-4658-9873-29d4a955bbb4', 'de152d33-ba01-44b3-9f17-954ab86f0e7b', 'marketplace/artifacts/ecommerce-seo-shopify/skill.zip', 'ecommerce-seo-shopify.zip', 'application/zip', 1859, '1.0.0', '{"raw":{"name":"ecommerce-seo-shopify","license":"MIT","version":"1.0.0","metadata":{"category":"ecommerce","language":"es"},"description":"Optimiza el SEO on-page de una tienda Shopify o ecommerce para traer tráfico orgánico gratis. Úsalo cuando el usuario quiera posicionar productos y colecciones en Google, mejorar títulos y meta descripciones, estructurar colecciones, agregar datos estructurados (schema), o hacer keyword research para ecommerce."},"name":"ecommerce-seo-shopify","license":"MIT","version":"1.0.0","description":"Optimiza el SEO on-page de una tienda Shopify o ecommerce para traer tráfico orgánico gratis. Úsalo cuando el usuario quiera posicionar productos y colecciones en Google, mejorar títulos y meta descripciones, estructurar colecciones, agregar datos estructurados (schema), o hacer keyword research para ecommerce.","source_path":"ecommerce-seo-shopify/SKILL.md","allowed_tools":[]}'::jsonb, TRUE, '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")
VALUES ('d35c0b6a-408e-4813-92ae-d94616871bdc', 'de152d33-ba01-44b3-9f17-954ab86f0e7b', 'PUBLISHED', 'READY', 'Optimiza SEO on-page para traer tráfico orgánico: títulos, meta, colecciones y datos estructurados.', 'Optimiza el SEO on-page de una tienda Shopify o ecommerce para traer tráfico orgánico gratis. Úsalo cuando el usuario quiera posicionar productos y colecciones en Google, mejorar títulos y meta descripciones, estructurar colecciones, agregar datos estructurados (schema), o hacer keyword research para ecommerce.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'WiFiMoneyStack', 'https://wifimoneystack.com', NULL, NULL, NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("app_id","kind") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")
VALUES ('0f5ebfbd-1ed7-49ca-b9b7-d9b8b9331fca', 'd35c0b6a-408e-4813-92ae-d94616871bdc', 'es', 0, NOW())
ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('8a52437f-30c0-4a5b-ac3c-67c00d6555a4', 'd35c0b6a-408e-4813-92ae-d94616871bdc', '468f4b16-3e9e-495b-b892-3404e681358f', 0, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('0d12b0dc-947a-49e1-9c49-ecfdce34fa8d', 'd35c0b6a-408e-4813-92ae-d94616871bdc', '7c988b02-8c6d-45ec-a50c-a7db5e69e5ab', 1, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;

-- Auditoría y Escalado Meta Ads
INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")
VALUES ('bf089741-ca07-4d78-9288-176d06d3a8f2', 'meta-ads-auditoria-escalado', 'Auditoría y Escalado Meta Ads', 'Lee métricas (ROAS, CPA, CTR) y decide escalar, iterar o apagar. Diagnostica el embudo.', 'Audita el rendimiento de campañas de Meta Ads y decide cuándo escalar, iterar o apagar anuncios. Úsalo cuando el usuario comparta métricas (ROAS, CPA, CPM, CTR, frecuencia) y quiera saber qué está fallando, qué ad set escalar, cuándo matar un anuncio, cómo bajar el costo por compra o cómo escalar sin romper el rendimiento.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('d0123212-764a-4be0-94b6-d9c1b4bb38b2', 'bf089741-ca07-4d78-9288-176d06d3a8f2', 'ICON', 'marketplace/storefronts/meta-ads-auditoria-escalado/icon.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/meta-ads-auditoria-escalado/icon.svg', 'Ícono de Auditoría y Escalado Meta Ads', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('ecb90de7-c0a0-461e-9d99-6feef3bf60dc', 'bf089741-ca07-4d78-9288-176d06d3a8f2', 'SCREENSHOT', 'marketplace/storefronts/meta-ads-auditoria-escalado/hero.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/meta-ads-auditoria-escalado/hero.svg', 'Vista de Auditoría y Escalado Meta Ads', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")
VALUES ('5f2975a0-c49d-4420-b9ae-775009f8d33b', 'bf089741-ca07-4d78-9288-176d06d3a8f2', 'marketplace/artifacts/meta-ads-auditoria-escalado/skill.zip', 'meta-ads-auditoria-escalado.zip', 'application/zip', 2008, '1.0.0', '{"raw":{"name":"meta-ads-auditoria-escalado","license":"MIT","version":"1.0.0","metadata":{"category":"meta-ads","language":"es"},"description":"Audita el rendimiento de campañas de Meta Ads y decide cuándo escalar, iterar o apagar anuncios. Úsalo cuando el usuario comparta métricas (ROAS, CPA, CPM, CTR, frecuencia) y quiera saber qué está fallando, qué ad set escalar, cuándo matar un anuncio, cómo bajar el costo por compra o cómo escalar sin romper el rendimiento."},"name":"meta-ads-auditoria-escalado","license":"MIT","version":"1.0.0","description":"Audita el rendimiento de campañas de Meta Ads y decide cuándo escalar, iterar o apagar anuncios. Úsalo cuando el usuario comparta métricas (ROAS, CPA, CPM, CTR, frecuencia) y quiera saber qué está fallando, qué ad set escalar, cuándo matar un anuncio, cómo bajar el costo por compra o cómo escalar sin romper el rendimiento.","source_path":"meta-ads-auditoria-escalado/SKILL.md","allowed_tools":[]}'::jsonb, TRUE, '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")
VALUES ('8ee82e09-c334-4fc3-b7ec-409307bbb927', 'bf089741-ca07-4d78-9288-176d06d3a8f2', 'PUBLISHED', 'READY', 'Lee métricas (ROAS, CPA, CTR) y decide escalar, iterar o apagar. Diagnostica el embudo.', 'Audita el rendimiento de campañas de Meta Ads y decide cuándo escalar, iterar o apagar anuncios. Úsalo cuando el usuario comparta métricas (ROAS, CPA, CPM, CTR, frecuencia) y quiera saber qué está fallando, qué ad set escalar, cuándo matar un anuncio, cómo bajar el costo por compra o cómo escalar sin romper el rendimiento.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'WiFiMoneyStack', 'https://wifimoneystack.com', NULL, NULL, NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("app_id","kind") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")
VALUES ('a317ca53-6b2a-400a-9eb3-013cba654c81', '8ee82e09-c334-4fc3-b7ec-409307bbb927', 'es', 0, NOW())
ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('54038f2d-f632-49e0-a67a-8ca6cba6ca9e', '8ee82e09-c334-4fc3-b7ec-409307bbb927', 'd0123212-764a-4be0-94b6-d9c1b4bb38b2', 0, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('b8f23283-0e1e-4a07-9f6c-08407e4abfc7', '8ee82e09-c334-4fc3-b7ec-409307bbb927', 'ecb90de7-c0a0-461e-9d99-6feef3bf60dc', 1, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;

-- Copy y Creativos Meta Ads
INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")
VALUES ('be599a3e-caed-4d0f-aaab-668891ded851', 'meta-ads-copy-creativos', 'Copy y Creativos Meta Ads', 'Genera ganchos, ángulos, copy de anuncios y guiones UGC que detienen el scroll y venden.', 'Crea copy de anuncios, ganchos (hooks), ángulos de venta y guiones de creativos para Meta Ads (Facebook e Instagram) y video UGC. Úsalo cuando el usuario necesite redactar texto principal de anuncios, titulares, ganchos para los primeros 3 segundos de video, ángulos de venta, briefs de creativo o guiones para UGC/TikTok orientados a vender productos.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('f1e8cf10-d218-40aa-b260-3dfee3186b1e', 'be599a3e-caed-4d0f-aaab-668891ded851', 'ICON', 'marketplace/storefronts/meta-ads-copy-creativos/icon.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/meta-ads-copy-creativos/icon.svg', 'Ícono de Copy y Creativos Meta Ads', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('0c1d7622-1cda-4268-b1b2-29c74ef59980', 'be599a3e-caed-4d0f-aaab-668891ded851', 'SCREENSHOT', 'marketplace/storefronts/meta-ads-copy-creativos/hero.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/meta-ads-copy-creativos/hero.svg', 'Vista de Copy y Creativos Meta Ads', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")
VALUES ('6cd41e3b-a549-4372-a4a8-70323b7324c3', 'be599a3e-caed-4d0f-aaab-668891ded851', 'marketplace/artifacts/meta-ads-copy-creativos/skill.zip', 'meta-ads-copy-creativos.zip', 'application/zip', 1911, '1.0.0', '{"raw":{"name":"meta-ads-copy-creativos","license":"MIT","version":"1.0.0","metadata":{"category":"meta-ads","language":"es"},"description":"Crea copy de anuncios, ganchos (hooks), ángulos de venta y guiones de creativos para Meta Ads (Facebook e Instagram) y video UGC. Úsalo cuando el usuario necesite redactar texto principal de anuncios, titulares, ganchos para los primeros 3 segundos de video, ángulos de venta, briefs de creativo o guiones para UGC/TikTok orientados a vender productos."},"name":"meta-ads-copy-creativos","license":"MIT","version":"1.0.0","description":"Crea copy de anuncios, ganchos (hooks), ángulos de venta y guiones de creativos para Meta Ads (Facebook e Instagram) y video UGC. Úsalo cuando el usuario necesite redactar texto principal de anuncios, titulares, ganchos para los primeros 3 segundos de video, ángulos de venta, briefs de creativo o guiones para UGC/TikTok orientados a vender productos.","source_path":"meta-ads-copy-creativos/SKILL.md","allowed_tools":[]}'::jsonb, TRUE, '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")
VALUES ('a3dfd234-95cb-4080-9db9-03c4acb17c60', 'be599a3e-caed-4d0f-aaab-668891ded851', 'PUBLISHED', 'READY', 'Genera ganchos, ángulos, copy de anuncios y guiones UGC que detienen el scroll y venden.', 'Crea copy de anuncios, ganchos (hooks), ángulos de venta y guiones de creativos para Meta Ads (Facebook e Instagram) y video UGC. Úsalo cuando el usuario necesite redactar texto principal de anuncios, titulares, ganchos para los primeros 3 segundos de video, ángulos de venta, briefs de creativo o guiones para UGC/TikTok orientados a vender productos.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'WiFiMoneyStack', 'https://wifimoneystack.com', NULL, NULL, NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("app_id","kind") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")
VALUES ('a2242a53-c2c1-4480-bcd6-9829427d1251', 'a3dfd234-95cb-4080-9db9-03c4acb17c60', 'es', 0, NOW())
ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('1f3bc7ee-a295-484e-8b27-6371865adff2', 'a3dfd234-95cb-4080-9db9-03c4acb17c60', 'f1e8cf10-d218-40aa-b260-3dfee3186b1e', 0, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('aad8f0fb-0e2a-445a-81f2-5d49834d523a', 'a3dfd234-95cb-4080-9db9-03c4acb17c60', '0c1d7622-1cda-4268-b1b2-29c74ef59980', 1, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;

-- Estructura de Campañas Meta Ads
INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")
VALUES ('0982c494-08c5-4407-9eff-200075449ad5', 'meta-ads-estructura-campanas', 'Estructura de Campañas Meta Ads', 'Arma campañas en Meta Ads: CBO/ABO/Advantage+, presupuestos, públicos y fase testeo vs escalado.', 'Diseña la estructura de campañas de Meta Ads (Facebook e Instagram) para ecommerce y dropshipping. Úsalo cuando el usuario quiera armar campañas desde cero, decidir entre CBO/ABO (Advantage+), definir presupuestos, número de conjuntos y anuncios, públicos, fase de testeo vs escalado, o estructurar una cuenta publicitaria nueva.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('86340684-baa4-4846-b6d6-55de4f8ed96b', '0982c494-08c5-4407-9eff-200075449ad5', 'ICON', 'marketplace/storefronts/meta-ads-estructura-campanas/icon.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/meta-ads-estructura-campanas/icon.svg', 'Ícono de Estructura de Campañas Meta Ads', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('697aa2f0-4aeb-4e80-b4e5-b97bc886f07d', '0982c494-08c5-4407-9eff-200075449ad5', 'SCREENSHOT', 'marketplace/storefronts/meta-ads-estructura-campanas/hero.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/meta-ads-estructura-campanas/hero.svg', 'Vista de Estructura de Campañas Meta Ads', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")
VALUES ('21f709b3-5155-4a24-b22a-bc488ed1491f', '0982c494-08c5-4407-9eff-200075449ad5', 'marketplace/artifacts/meta-ads-estructura-campanas/skill.zip', 'meta-ads-estructura-campanas.zip', 'application/zip', 1912, '1.0.0', '{"raw":{"name":"meta-ads-estructura-campanas","license":"MIT","version":"1.0.0","metadata":{"category":"meta-ads","language":"es"},"description":"Diseña la estructura de campañas de Meta Ads (Facebook e Instagram) para ecommerce y dropshipping. Úsalo cuando el usuario quiera armar campañas desde cero, decidir entre CBO/ABO (Advantage+), definir presupuestos, número de conjuntos y anuncios, públicos, fase de testeo vs escalado, o estructurar una cuenta publicitaria nueva."},"name":"meta-ads-estructura-campanas","license":"MIT","version":"1.0.0","description":"Diseña la estructura de campañas de Meta Ads (Facebook e Instagram) para ecommerce y dropshipping. Úsalo cuando el usuario quiera armar campañas desde cero, decidir entre CBO/ABO (Advantage+), definir presupuestos, número de conjuntos y anuncios, públicos, fase de testeo vs escalado, o estructurar una cuenta publicitaria nueva.","source_path":"meta-ads-estructura-campanas/SKILL.md","allowed_tools":[]}'::jsonb, TRUE, '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")
VALUES ('10adb2cc-036b-4e79-9315-d99d0d6d24c9', '0982c494-08c5-4407-9eff-200075449ad5', 'PUBLISHED', 'READY', 'Arma campañas en Meta Ads: CBO/ABO/Advantage+, presupuestos, públicos y fase testeo vs escalado.', 'Diseña la estructura de campañas de Meta Ads (Facebook e Instagram) para ecommerce y dropshipping. Úsalo cuando el usuario quiera armar campañas desde cero, decidir entre CBO/ABO (Advantage+), definir presupuestos, número de conjuntos y anuncios, públicos, fase de testeo vs escalado, o estructurar una cuenta publicitaria nueva.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'WiFiMoneyStack', 'https://wifimoneystack.com', NULL, NULL, NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("app_id","kind") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")
VALUES ('31da1631-ba4d-431b-b99b-8b1993353907', '10adb2cc-036b-4e79-9315-d99d0d6d24c9', 'es', 0, NOW())
ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('3b823754-b1c5-4fbb-9688-3db811700add', '10adb2cc-036b-4e79-9315-d99d0d6d24c9', '86340684-baa4-4846-b6d6-55de4f8ed96b', 0, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('7fcb0ec9-ec7f-41ef-bd5e-a20d1c957ca6', '10adb2cc-036b-4e79-9315-d99d0d6d24c9', '697aa2f0-4aeb-4e80-b4e5-b97bc886f07d', 1, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;

-- Pixel + Conversions API
INSERT INTO "marketplace_apps" ("id","slug","name","summary","description","instructions","access_mode","category","status","published_at","created_by_user_id","updated_at")
VALUES ('5d9c1f95-3ccf-4a86-b432-7ca0d602c961', 'meta-ads-pixel-capi', 'Pixel + Conversions API', 'Configura y diagnostica el Meta Pixel y la API de Conversiones para un tracking limpio.', 'Configura y diagnostica el Meta Pixel y la API de Conversiones (CAPI) para ecommerce y dropshipping. Úsalo cuando el usuario necesite instalar el pixel, configurar eventos (ViewContent, AddToCart, Purchase), montar la Conversions API, mejorar la calidad de coincidencia de eventos, arreglar eventos duplicados o solucionar por qué Meta no registra las compras correctamente.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'PACKAGE_DOWNLOAD', 'CLAUDE_SKILL', 'ACTIVE', NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('27b49ac6-804d-4ebe-a0fe-fbecc152c74d', '5d9c1f95-3ccf-4a86-b432-7ca0d602c961', 'ICON', 'marketplace/storefronts/meta-ads-pixel-capi/icon.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/meta-ads-pixel-capi/icon.svg', 'Ícono de Pixel + Conversions API', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_media" ("id","app_id","type","storage_key","public_url","alt_text","sort_order","updated_at")
VALUES ('14698da3-4fae-44a5-b6eb-b291e251d37a', '5d9c1f95-3ccf-4a86-b432-7ca0d602c961', 'SCREENSHOT', 'marketplace/storefronts/meta-ads-pixel-capi/hero.svg', 'https://storage.googleapis.com/wifimoneystack-marketplace-assets-172797712331/marketplace/storefronts/meta-ads-pixel-capi/hero.svg', 'Vista de Pixel + Conversions API', 0, NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_artifacts" ("id","app_id","storage_key","file_name","mime_type","size_bytes","version_label","skill_metadata","is_active","created_by_user_id","updated_at")
VALUES ('eef071e0-faeb-40c5-a083-988d129aa2f1', '5d9c1f95-3ccf-4a86-b432-7ca0d602c961', 'marketplace/artifacts/meta-ads-pixel-capi/skill.zip', 'meta-ads-pixel-capi.zip', 'application/zip', 1965, '1.0.0', '{"raw":{"name":"meta-ads-pixel-capi","license":"MIT","version":"1.0.0","metadata":{"category":"meta-ads","language":"es"},"description":"Configura y diagnostica el Meta Pixel y la API de Conversiones (CAPI) para ecommerce y dropshipping. Úsalo cuando el usuario necesite instalar el pixel, configurar eventos (ViewContent, AddToCart, Purchase), montar la Conversions API, mejorar la calidad de coincidencia de eventos, arreglar eventos duplicados o solucionar por qué Meta no registra las compras correctamente."},"name":"meta-ads-pixel-capi","license":"MIT","version":"1.0.0","description":"Configura y diagnostica el Meta Pixel y la API de Conversiones (CAPI) para ecommerce y dropshipping. Úsalo cuando el usuario necesite instalar el pixel, configurar eventos (ViewContent, AddToCart, Purchase), montar la Conversions API, mejorar la calidad de coincidencia de eventos, arreglar eventos duplicados o solucionar por qué Meta no registra las compras correctamente.","source_path":"meta-ads-pixel-capi/SKILL.md","allowed_tools":[]}'::jsonb, TRUE, '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_versions" ("id","app_id","kind","readiness_status","summary","description","instructions","developer_name","developer_website","support_email","support_url","published_at","created_by_user_id","updated_at")
VALUES ('d4406b29-d975-4822-acb0-40d7b5eb2e8d', '5d9c1f95-3ccf-4a86-b432-7ca0d602c961', 'PUBLISHED', 'READY', 'Configura y diagnostica el Meta Pixel y la API de Conversiones para un tracking limpio.', 'Configura y diagnostica el Meta Pixel y la API de Conversiones (CAPI) para ecommerce y dropshipping. Úsalo cuando el usuario necesite instalar el pixel, configurar eventos (ViewContent, AddToCart, Purchase), montar la Conversions API, mejorar la calidad de coincidencia de eventos, arreglar eventos duplicados o solucionar por qué Meta no registra las compras correctamente.', 'Cómo instalar este skill en Claude:

1. Descarga el archivo .zip.
2. Descomprímelo dentro de la carpeta de skills de Claude:
   ~/.claude/skills/   (crea la carpeta si no existe)
3. Debe quedar como ~/.claude/skills/<nombre-del-skill>/SKILL.md
4. Reinicia Claude Code.

Claude activará el skill automáticamente cuando tu pregunta sea relevante.', 'WiFiMoneyStack', 'https://wifimoneystack.com', NULL, NULL, NOW(), '11111111-1111-1111-1111-111111111111', NOW())
ON CONFLICT ("app_id","kind") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_languages" ("id","storefront_version_id","language_code","sort_order","updated_at")
VALUES ('5a0cd94e-1d1b-4a97-9f42-22b1a492297b', 'd4406b29-d975-4822-acb0-40d7b5eb2e8d', 'es', 0, NOW())
ON CONFLICT ("storefront_version_id","language_code") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('ebaac005-f4d2-4d95-afcf-4b03a2db7c94', 'd4406b29-d975-4822-acb0-40d7b5eb2e8d', '27b49ac6-804d-4ebe-a0fe-fbecc152c74d', 0, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;
INSERT INTO "marketplace_app_storefront_version_media" ("id","storefront_version_id","media_id","sort_order","updated_at")
VALUES ('c3cf8bef-cd73-4a03-bc10-057e936cc141', 'd4406b29-d975-4822-acb0-40d7b5eb2e8d', '14698da3-4fae-44a5-b6eb-b291e251d37a', 1, NOW())
ON CONFLICT ("storefront_version_id","media_id") DO NOTHING;

COMMIT;
