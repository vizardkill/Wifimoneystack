-- CreateEnum
CREATE TYPE "MarketplaceStorefrontVersionKind" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "MarketplaceStorefrontReadinessStatus" AS ENUM ('INCOMPLETE', 'READY');

-- AlterEnum
ALTER TYPE "MarketplaceAuditAction" ADD VALUE 'APP_STOREFRONT_DRAFT_SAVED';

-- AlterEnum
ALTER TYPE "MarketplaceAuditAction" ADD VALUE 'APP_STOREFRONT_PUBLISHED';

-- AlterEnum
ALTER TYPE "MarketplaceAuditAction" ADD VALUE 'APP_STOREFRONT_MEDIA_UPDATED';

-- AlterTable
ALTER TABLE "marketplace_app_media" ALTER COLUMN "storage_key" DROP NOT NULL;

-- CreateTable
CREATE TABLE "marketplace_app_storefront_versions" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "kind" "MarketplaceStorefrontVersionKind" NOT NULL,
    "readiness_status" "MarketplaceStorefrontReadinessStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "summary" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "instructions" TEXT NOT NULL DEFAULT '',
    "developer_name" TEXT NOT NULL DEFAULT '',
    "developer_website" TEXT NOT NULL DEFAULT '',
    "support_email" TEXT,
    "support_url" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_app_storefront_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_language_catalog" (
    "code" VARCHAR(12) NOT NULL,
    "label" VARCHAR(80) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_language_catalog_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "marketplace_app_storefront_version_languages" (
    "id" TEXT NOT NULL,
    "storefront_version_id" TEXT NOT NULL,
    "language_code" VARCHAR(12) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_app_storefront_version_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_app_storefront_version_media" (
    "id" TEXT NOT NULL,
    "storefront_version_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_app_storefront_version_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_app_storefront_versions_app_id_kind_key" ON "marketplace_app_storefront_versions"("app_id", "kind");

-- CreateIndex
CREATE INDEX "marketplace_app_storefront_versions_app_id_kind_readiness_status_idx" ON "marketplace_app_storefront_versions"("app_id", "kind", "readiness_status");

-- CreateIndex
CREATE INDEX "marketplace_language_catalog_is_active_sort_order_idx" ON "marketplace_language_catalog"("is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "mkt_stf_ver_lang_version_lang_key" ON "marketplace_app_storefront_version_languages"("storefront_version_id", "language_code");

-- CreateIndex
CREATE INDEX "mkt_stf_ver_lang_version_sort_idx" ON "marketplace_app_storefront_version_languages"("storefront_version_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "mkt_stf_ver_media_version_media_key" ON "marketplace_app_storefront_version_media"("storefront_version_id", "media_id");

-- CreateIndex
CREATE INDEX "mkt_stf_ver_media_version_sort_idx" ON "marketplace_app_storefront_version_media"("storefront_version_id", "sort_order");

-- CreateIndex
CREATE INDEX "marketplace_app_media_app_id_sort_order_idx" ON "marketplace_app_media"("app_id", "sort_order");

-- AddForeignKey
ALTER TABLE "marketplace_app_storefront_versions" ADD CONSTRAINT "marketplace_app_storefront_versions_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "marketplace_apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_app_storefront_version_languages" ADD CONSTRAINT "marketplace_app_storefront_version_languages_storefront_version_id_fkey" FOREIGN KEY ("storefront_version_id") REFERENCES "marketplace_app_storefront_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_app_storefront_version_languages" ADD CONSTRAINT "marketplace_app_storefront_version_languages_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "marketplace_language_catalog"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_app_storefront_version_media" ADD CONSTRAINT "marketplace_app_storefront_version_media_storefront_version_id_fkey" FOREIGN KEY ("storefront_version_id") REFERENCES "marketplace_app_storefront_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_app_storefront_version_media" ADD CONSTRAINT "marketplace_app_storefront_version_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "marketplace_app_media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
