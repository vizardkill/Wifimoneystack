-- Seed: Marketplace storefront language catalog
BEGIN;

INSERT INTO "marketplace_language_catalog" ("code", "label", "sort_order", "is_active", "created_at", "updated_at")
VALUES
  ('es', 'Español', 1, true, NOW(), NOW()),
  ('en', 'English', 2, true, NOW(), NOW()),
  ('pt-BR', 'Português (Brasil)', 3, true, NOW(), NOW()),
  ('fr', 'Français', 4, true, NOW(), NOW()),
  ('de', 'Deutsch', 5, true, NOW(), NOW())
ON CONFLICT ("code")
DO UPDATE SET
  "label" = EXCLUDED."label",
  "sort_order" = EXCLUDED."sort_order",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = NOW();

COMMIT;
