-- 1. Create Plans Table
create table if not exists public.plans (
  id text primary key,
  name text not null,
  price_monthly integer not null,
  transaction_fee_percent numeric(5,2) not null,
  storage_limit_mb integer not null default 1024,
  features jsonb default '{}'::jsonb
);

-- Insert Default Plans
insert into public.plans (id, name, price_monthly, transaction_fee_percent, storage_limit_mb)
values 
  ('free', 'Free', 0, 5.00, 50),
  ('starter', 'Starter', 299, 2.00, 1024),
  ('growth', 'Growth', 599, 1.00, 10240),
  ('scale', 'Scale', 2999, 0.50, 51200)
on conflict (id) do nothing;

-- 2. Modify Tenants Table
alter table public.tenants
add column if not exists plan_id text references public.plans(id) default 'free',
add column if not exists storage_usage_mb numeric(10,2) default 0,
add column if not exists ecpay_card_id text,
add column if not exists subscription_status text default 'active',
add column if not exists next_billing_at timestamptz,
add column if not exists custom_domain text unique;

-- 3. Create Billing Transactions Table (Ledger)
create table if not exists public.billing_transactions (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id),
  amount integer not null, -- 總金額
  fee_amount numeric(10,2) not null, -- 累積的手續費 (如果適用)
  transaction_type text not null, -- 'payment', 'refund', 'fee_accumulation'
  description text,
  occurred_at timestamptz default now()
);

-- Add Index for frequent lookups
create index if not exists idx_billing_transactions_tenant_id on public.billing_transactions(tenant_id);
