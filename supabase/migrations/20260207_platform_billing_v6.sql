-- Phase 2: Platform Billing & Plans Schema (v6 Architecture)

-- 1. Create Plans Table
create table if not exists public.plans (
  id text primary key, -- 'free', 'starter', 'growth', 'scale'
  name text not null,
  price_monthly integer not null,
  transaction_fee_percent numeric(5,2) not null,
  storage_limit_mb integer not null default 1024,
  max_products integer, -- NULL = unlimited
  features jsonb default '{}'::jsonb, -- e.g. {"custom_domain": true, "line_notify": true}
  created_at timestamptz default now()
);

-- Enable RLS for plans (Public Read)
alter table public.plans enable row level security;
create policy "Anyone can view plans" on public.plans for select using (true);

-- Insert Default Plans
insert into public.plans (id, name, price_monthly, transaction_fee_percent, storage_limit_mb, features) values
('free', '免費體驗', 0, 5.0, 50, '{"custom_domain": false, "remove_branding": false}'),
('starter', '起步方案', 299, 2.0, 1024, '{"custom_domain": true, "remove_branding": true}'),
('growth', '成長方案', 599, 1.0, 10240, '{"custom_domain": true, "remove_branding": true, "line_notify": true}'),
('scale', '企業方案', 2999, 0.5, 51200, '{"custom_domain": true, "remove_branding": true, "line_notify": true, "hq_support": true, "api_access": true}')
on conflict (id) do update set
  price_monthly = excluded.price_monthly,
  transaction_fee_percent = excluded.transaction_fee_percent,
  storage_limit_mb = excluded.storage_limit_mb,
  features = excluded.features;


-- 2. Update Tenants Table
alter table public.tenants
add column if not exists plan_id text references public.plans(id) default 'free',
add column if not exists storage_usage_mb numeric(10,2) default 0,
add column if not exists ecpay_card_id text, -- Encrypted or Tokenized Card ID from ECPay
add column if not exists subscription_status text default 'active', -- 'active', 'past_due', 'canceled'
add column if not exists next_billing_at timestamptz,
add column if not exists custom_domain text unique;

-- Index for billing queries
create index if not exists idx_tenants_next_billing_at on public.tenants(next_billing_at);
create index if not exists idx_tenants_plan_id on public.tenants(plan_id);


-- 3. Tenant Secrets (Encrypted Storage)
-- Requires pgcrypto extension
create extension if not exists pgcrypto;

create table if not exists public.tenant_secrets (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  secret_type text not null, -- 'line_pay_channel_id', 'line_pay_channel_secret', 'ecpay_merchant_id', 'ecpay_hash_key', 'ecpay_hash_iv'
  encrypted_value text not null,
  updated_at timestamptz default now(),
  unique(tenant_id, secret_type)
);

-- Enable RLS
alter table public.tenant_secrets enable row level security;

-- Policy: Store Owners can manage their own secrets
create policy "Owners manage secrets" on public.tenant_secrets
  for all to authenticated
  using (
    exists (
      select 1 from public.users_roles
      where users_roles.tenant_id = tenant_secrets.tenant_id
      and users_roles.user_id = auth.uid()
      and users_roles.role in ('store_owner', 'store_admin')
    )
  );

-- Helper Function to Set Secret
create or replace function public.set_tenant_secret(
  p_tenant_id uuid,
  p_secret_type text,
  p_raw_value text,
  p_encryption_key text
) returns void as $$
begin
  insert into public.tenant_secrets (tenant_id, secret_type, encrypted_value)
  values (
    p_tenant_id,
    p_secret_type,
    encode(pgp_sym_encrypt(p_raw_value, p_encryption_key), 'base64')
  )
  on conflict (tenant_id, secret_type)
  do update set
    encrypted_value = excluded.encrypted_value,
    updated_at = now();
end;
$$ language plpgsql security definer;

-- Helper Function to Get Secret (Only callable by Server/Postgres, strictly controlled via application logic)
create or replace function public.get_tenant_secret(
  p_tenant_id uuid,
  p_secret_type text,
  p_encryption_key text
) returns text as $$
declare
  v_encrypted text;
begin
  select encrypted_value into v_encrypted
  from public.tenant_secrets
  where tenant_id = p_tenant_id and secret_type = p_secret_type;

  if v_encrypted is null then
    return null;
  end if;

  return pgp_sym_decrypt(decode(v_encrypted, 'base64'), p_encryption_key)::text;
exception when others then
  return null;
end;
$$ language plpgsql security definer;


-- 4. Billing Transactions (Immutable Ledger)
create table if not exists public.billing_transactions (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  amount integer not null, -- Transaction amount (e.g. Order Total)
  fee_amount numeric(10,2) not null, -- Calculated Platform Fee
  transaction_type text not null, -- 'payment', 'refund'
  provider text not null, -- 'line_pay', 'ecpay'
  provider_transaction_id text,
  order_id uuid, -- Optional reference, not FK to allow order deletion
  occurred_at timestamptz default now()
);

-- Enable RLS
alter table public.billing_transactions enable row level security;

-- Policy: Tenants can VIEW their own ledger, but CANNOT modify it
create policy "Tenants view ledger" on public.billing_transactions
  for select to authenticated
  using (
    exists (
      select 1 from public.users_roles
      where users_roles.tenant_id = billing_transactions.tenant_id
      and users_roles.user_id = auth.uid()
    )
  );

-- No INSERT/UPDATE/DELETE policy for authenticated users.
-- Only Service Role can write to this table (enforced by application logic).

-- Index for monthly billing calculation
create index if not exists idx_billing_ledger_tenant_date 
on public.billing_transactions(tenant_id, occurred_at);
