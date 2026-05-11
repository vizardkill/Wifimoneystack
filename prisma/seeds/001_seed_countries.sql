
-- Seed: Countries
BEGIN;

INSERT INTO "countries" ("id", "name", "iso_code", "is_enabled", "created_at", "updated_at")
VALUES
  ('MX','México','MX',true,NOW(),NOW()),
  ('AR','Argentina','AR',true,NOW(),NOW()),
  ('BO','Bolivia','BO',true,NOW(),NOW()),
  ('BR','Brasil','BR',true,NOW(),NOW()),
  ('CL','Chile','CL',true,NOW(),NOW()),
  ('CO','Colombia','CO',true,NOW(),NOW()),
  ('CR','Costa Rica','CR',true,NOW(),NOW()),
  ('CU','Cuba','CU',true,NOW(),NOW()),
  ('EC','Ecuador','EC',true,NOW(),NOW()),
  ('SV','El Salvador','SV',true,NOW(),NOW()),
  ('GT','Guatemala','GT',true,NOW(),NOW()),
  ('HN','Honduras','HN',true,NOW(),NOW()),
  ('NI','Nicaragua','NI',true,NOW(),NOW()),
  ('PA','Panamá','PA',true,NOW(),NOW()),
  ('PY','Paraguay','PY',true,NOW(),NOW()),
  ('PE','Perú','PE',true,NOW(),NOW()),
  ('DO','República Dominicana','DO',true,NOW(),NOW()),
  ('UY','Uruguay','UY',true,NOW(),NOW()),
  ('VE','Venezuela','VE',true,NOW(),NOW())
ON CONFLICT ("id") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "iso_code" = EXCLUDED."iso_code",
  "is_enabled" = EXCLUDED."is_enabled",
  "updated_at" = NOW();

COMMIT;
