CREATE TABLE IF NOT EXISTS "prices" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "price_model" TEXT NOT NULL,
    "price_per_unit" NUMERIC(14, 6) NOT NULL,
    "unit_of_measure" TEXT NOT NULL,
    "upfront_cost" NUMERIC(14, 2),
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "last_updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "price_unique_idx" ON "prices" ("provider", "resource_type", "region", "price_model", "unit_of_measure");

CREATE TABLE IF NOT EXISTS "data_transfer_prices" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "from_region" TEXT NOT NULL,
    "to_region" TEXT NOT NULL,
    "transfer_type" TEXT NOT NULL,
    "price_per_gb" NUMERIC(14, 6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "last_updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "data_transfer_price_unique_idx" ON "data_transfer_prices" ("provider", "from_region", "to_region", "transfer_type");
