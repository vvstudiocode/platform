-- 1. Identify and remove duplicates based on (tenant_id, auth_user_id)
-- Keep the most recent one (created_at DESC) or the one with most points?
-- Let's keep the one with the most points, or if equal, the most recent.

WITH duplicates AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY tenant_id, auth_user_id
            ORDER BY current_points DESC, created_at DESC
        ) as rn
    FROM customers
    WHERE auth_user_id IS NOT NULL
)
DELETE FROM customers
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- 2. Identify and remove duplicates based on (tenant_id, email) for non-auth users (if any) or just consistency
WITH duplicates_email AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY tenant_id, email
            ORDER BY current_points DESC, created_at DESC
        ) as rn
    FROM customers
    WHERE email IS NOT NULL
)
DELETE FROM customers
WHERE id IN (
    SELECT id FROM duplicates_email WHERE rn > 1
);

-- 3. Add Unique Constraints
ALTER TABLE public.customers
    ADD CONSTRAINT customers_tenant_auth_user_unique UNIQUE (tenant_id, auth_user_id);

ALTER TABLE public.customers
    ADD CONSTRAINT customers_tenant_email_unique UNIQUE (tenant_id, email);
