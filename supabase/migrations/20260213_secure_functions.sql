-- Migration: Secure Database Functions
-- Description: Revoke public execution rights for tenant secret functions to prevent potential abuse.

-- 1. Revoke from PUBLIC (Everyone)
revoke execute on function public.get_tenant_secret from public;
revoke execute on function public.set_tenant_secret from public;

-- 2. Grant to Service Role (Admin/Backend)
-- This ensures that our Trusted Backend (which uses service_role key) can still call these functions.
grant execute on function public.get_tenant_secret to service_role;
grant execute on function public.set_tenant_secret to service_role;

-- 3. Grant to Postgres (Superuser/Dashboard)
grant execute on function public.get_tenant_secret to postgres;
grant execute on function public.set_tenant_secret to postgres;

-- Note: We do NOT grant to 'authenticated' or 'anon'. 
-- This enforces that ONLY the server-side code (using service_role client) can access secrets.
