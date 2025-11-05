CREATE TABLE IF NOT EXISTS "Price" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "priceModel" TEXT NOT NULL,
    "pricePerHour" NUMERIC(10, 6) NOT NULL,
    "upfrontCost" NUMERIC(10, 2),
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "lastUpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "price_unique_idx" ON "Price" ("provider", "resourceType", "region", "priceModel");

CREATE TABLE IF NOT EXISTS "DataTransferPrice" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "fromRegion" TEXT NOT NULL,
    "toRegion" TEXT NOT NULL,
    "transferType" TEXT NOT NULL,
    "pricePerGb" NUMERIC(10, 6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "lastUpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "data_transfer_price_unique_idx" ON "DataTransferPrice" ("provider", "fromRegion", "toRegion", "transferType");
