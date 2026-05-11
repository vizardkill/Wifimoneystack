-- CreateEnum
CREATE TYPE "MarketplaceAccessStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "MarketplaceAppStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MarketplaceAppAccessMode" AS ENUM ('WEB_LINK', 'PACKAGE_DOWNLOAD');

-- CreateEnum
CREATE TYPE "MarketplaceMediaType" AS ENUM ('ICON', 'SCREENSHOT', 'VIDEO');

-- CreateEnum
CREATE TYPE "MarketplaceUsageEventType" AS ENUM ('DETAIL_VIEW', 'WEB_OPEN', 'PACKAGE_DOWNLOAD', 'PACKAGE_INSTALL');

-- CreateEnum
CREATE TYPE "MarketplaceAuditAction" AS ENUM ('ACCESS_REQUESTED', 'ACCESS_APPROVED', 'ACCESS_REJECTED', 'ACCESS_REVOKED', 'APP_CREATED', 'APP_UPDATED', 'APP_PUBLISHED', 'APP_UNPUBLISHED', 'APP_MEDIA_UPDATED', 'APP_ARTIFACT_UPDATED');

-- CreateTable
CREATE TABLE "marketplace_access_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "MarketplaceAccessStatus" NOT NULL DEFAULT 'PENDING',
    "company_name" TEXT,
    "business_url" TEXT,
    "business_type" TEXT,
    "request_notes" TEXT,
    "decision_reason" TEXT,
    "decided_by_user_id" TEXT,
    "decided_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_access_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_apps" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "access_mode" "MarketplaceAppAccessMode" NOT NULL,
    "status" "MarketplaceAppStatus" NOT NULL DEFAULT 'DRAFT',
    "web_url" TEXT,
    "published_at" TIMESTAMP(3),
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_app_media" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "type" "MarketplaceMediaType" NOT NULL,
    "storage_key" TEXT NOT NULL,
    "public_url" TEXT,
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_app_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_app_artifacts" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "checksum" TEXT,
    "version_label" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_app_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_usage_events" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "MarketplaceUsageEventType" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_audit_events" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "target_user_id" TEXT,
    "app_id" TEXT,
    "action" "MarketplaceAuditAction" NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_access_requests_user_id_key" ON "marketplace_access_requests"("user_id");

-- CreateIndex
CREATE INDEX "marketplace_access_requests_status_created_at_idx" ON "marketplace_access_requests"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_apps_slug_key" ON "marketplace_apps"("slug");

-- CreateIndex
CREATE INDEX "marketplace_apps_status_access_mode_created_at_idx" ON "marketplace_apps"("status", "access_mode", "created_at");

-- CreateIndex
CREATE INDEX "marketplace_app_media_app_id_type_idx" ON "marketplace_app_media"("app_id", "type");

-- CreateIndex
CREATE INDEX "marketplace_app_artifacts_app_id_is_active_idx" ON "marketplace_app_artifacts"("app_id", "is_active");

-- CreateIndex
CREATE INDEX "marketplace_usage_events_app_id_type_created_at_idx" ON "marketplace_usage_events"("app_id", "type", "created_at");

-- CreateIndex
CREATE INDEX "marketplace_usage_events_user_id_created_at_idx" ON "marketplace_usage_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "marketplace_audit_events_actor_user_id_created_at_idx" ON "marketplace_audit_events"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "marketplace_audit_events_target_user_id_created_at_idx" ON "marketplace_audit_events"("target_user_id", "created_at");

-- CreateIndex
CREATE INDEX "marketplace_audit_events_app_id_created_at_idx" ON "marketplace_audit_events"("app_id", "created_at");

-- AddForeignKey
ALTER TABLE "marketplace_app_media" ADD CONSTRAINT "marketplace_app_media_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "marketplace_apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_app_artifacts" ADD CONSTRAINT "marketplace_app_artifacts_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "marketplace_apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_usage_events" ADD CONSTRAINT "marketplace_usage_events_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "marketplace_apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_audit_events" ADD CONSTRAINT "marketplace_audit_events_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "marketplace_apps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
