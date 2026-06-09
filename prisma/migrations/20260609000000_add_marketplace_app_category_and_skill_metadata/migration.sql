-- CreateEnum
CREATE TYPE "MarketplaceAppCategory" AS ENUM ('APP', 'CLAUDE_SKILL');

-- AlterTable
ALTER TABLE "marketplace_apps" ADD COLUMN "category" "MarketplaceAppCategory" NOT NULL DEFAULT 'APP';

-- AlterTable
ALTER TABLE "marketplace_app_artifacts" ADD COLUMN "skill_metadata" JSONB;

-- CreateIndex
CREATE INDEX "marketplace_apps_status_category_created_at_idx" ON "marketplace_apps"("status", "category", "created_at");
