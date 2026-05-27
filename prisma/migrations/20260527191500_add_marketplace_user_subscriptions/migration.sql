-- CreateEnum
CREATE TYPE "MarketplaceSubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED');

-- CreateTable
CREATE TABLE "marketplace_user_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "MarketplaceSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "renewed_at" TIMESTAMP(3),
    "renewed_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_user_subscriptions_user_id_key" ON "marketplace_user_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "marketplace_user_subscriptions_status_expires_at_idx" ON "marketplace_user_subscriptions"("status", "expires_at");

-- CreateIndex
CREATE INDEX "marketplace_user_subscriptions_expires_at_idx" ON "marketplace_user_subscriptions"("expires_at");

-- AddForeignKey
ALTER TABLE "marketplace_user_subscriptions" ADD CONSTRAINT "marketplace_user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
