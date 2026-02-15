-- ================================================
-- LINE Bot Integration: Database Migration
-- ================================================

-- 1. Add LINE identity fields to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS line_user_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS line_display_name TEXT;

-- Index for fast lookup by LINE user ID (used in webhook handler)
CREATE INDEX IF NOT EXISTS idx_customers_line_user_id ON public.customers(line_user_id);

-- 2. Add keyword (short code) to products table for "+1" ordering
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS keyword TEXT;

-- Composite unique index: keyword must be unique per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_tenant_keyword 
ON public.products(tenant_id, keyword) WHERE keyword IS NOT NULL;

-- 3. Add LINE settings to tenants.settings JSONB
-- No schema change needed - we use the existing `settings` JSONB column.
-- Structure will be: settings->'line'->{ welcome_message, enabled, group_ordering_enabled }
-- This is handled in application code.

COMMENT ON COLUMN public.customers.line_user_id IS 'LINE Messaging API userId (U-prefixed string)';
COMMENT ON COLUMN public.customers.line_display_name IS 'Cached LINE display name for admin reference';
COMMENT ON COLUMN public.products.keyword IS 'Short code for LINE +1 ordering (e.g. A01)';
