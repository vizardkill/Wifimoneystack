-- CreateTable
CREATE TABLE "user_meta_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_label" VARCHAR(80),
    "encrypted_access_token" TEXT NOT NULL,
    "ad_account_id" VARCHAR(64) NOT NULL,
    "business_id" VARCHAR(64),
    "status" VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    "account_name" VARCHAR(120),
    "account_currency" VARCHAR(16),
    "timezone_name" VARCHAR(80),
    "timezone_offset_hours" INTEGER,
    "last_validated_at" TIMESTAMP(3),
    "last_error" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_meta_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_meta_connections_user_id_key" ON "user_meta_connections"("user_id");

-- CreateIndex
CREATE INDEX "user_meta_connections_status_idx" ON "user_meta_connections"("status");

-- CreateIndex
CREATE INDEX "user_meta_connections_ad_account_id_idx" ON "user_meta_connections"("ad_account_id");

-- AddForeignKey
ALTER TABLE "user_meta_connections" ADD CONSTRAINT "user_meta_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
