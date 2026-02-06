-- Create plans table
create table if not exists public.plans (
  id text primary key, -- 'free', 'starter', 'growth', 'scale'
  name text not null,
  price_monthly integer not null, -- Price in TWD
  transaction_fee_percent numeric(5,2) not null,
  max_products integer, -- NULL means unlimited
  features jsonb default '{}'::jsonb, -- Store feature flags e.g., { "custom_domain": true }
  created_at timestamptz default now()
);

-- Enable RLS for plans (Public read-only)
alter table public.plans enable row level security;
create policy "Anyone can view plans" on public.plans for select using (true);

-- Insert Default Data
insert into public.plans (id, name, price_monthly, transaction_fee_percent, max_products, features) values
('free', '免費體驗', 0, 5.0, 10, '{"custom_domain": false, "storage_limit_mb": 50, "remove_branding": false}'),
('starter', '起步方案', 499, 2.0, 100, '{"custom_domain": false, "storage_limit_mb": 1024, "remove_branding": true}'),
('growth', '成長方案', 1299, 1.0, null, '{"custom_domain": true, "storage_limit_mb": 10240, "remove_branding": true, "line_notify": true}'),
('scale', '企業方案', 2999, 0.5, null, '{"custom_domain": true, "storage_limit_mb": 51200, "remove_branding": true, "line_notify": true, "hq_support": true}')
on conflict (id) do update set 
  price_monthly = excluded.price_monthly,
  transaction_fee_percent = excluded.transaction_fee_percent,
  max_products = excluded.max_products,
  features = excluded.features;

-- Update tenants table to track subscription status
alter table public.tenants 
add column if not exists plan_id text references public.plans(id) default 'free',
add column if not exists stripe_customer_id text,
add column if not exists subscription_status text default 'active', -- 'active', 'past_due', 'canceled', 'trialing'
add column if not exists current_period_end timestamptz;

-- Index for faster lookups
create index if not exists idx_tenants_plan_id on public.tenants(plan_id);
create index if not exists idx_tenants_subscription_status on public.tenants(subscription_status);
