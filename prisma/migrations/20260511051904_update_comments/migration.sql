-- Prisma Database Comments Generator v1.7.0

-- marketplace_access_requests comments
COMMENT ON TABLE "marketplace_access_requests" IS 'Solicitud de acceso de usuario al marketplace';

-- marketplace_apps comments
COMMENT ON TABLE "marketplace_apps" IS 'Aplicacion/herramienta listada en el marketplace';

-- marketplace_app_media comments
COMMENT ON TABLE "marketplace_app_media" IS 'Metadata de media (iconos, screenshots, videos) para apps del marketplace';

-- marketplace_app_artifacts comments
COMMENT ON TABLE "marketplace_app_artifacts" IS 'Artefacto (ZIP/paquete) disponible para descarga de una app';

-- marketplace_usage_events comments
COMMENT ON TABLE "marketplace_usage_events" IS 'Evento inmutable de uso de una app del marketplace';

-- marketplace_audit_events comments
COMMENT ON TABLE "marketplace_audit_events" IS 'Evento inmutable de auditoria para decisiones admin y de marketplace';
