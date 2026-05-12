-- AlterEnum
ALTER TYPE "role" ADD VALUE 'SUPERADMIN';

-- AlterEnum
ALTER TYPE "MarketplaceAuditAction" ADD VALUE 'ADMIN_PROMOTED';

-- CreateIndex
CREATE INDEX "users_role_created_at_idx" ON "users"("role", "created_at");

-- CreateIndex
CREATE INDEX "marketplace_audit_events_action_created_at_idx" ON "marketplace_audit_events"("action", "created_at");

