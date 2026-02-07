-- Phase 2: Audit Logs & Tenant Analytics

-- 1. Audit Logs (Security & Accountability)
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null, -- Nullable for system actions
  action text not null, -- e.g. 'UPDATE_SETTINGS', 'create_product'
  entity_type text not null, -- e.g. 'store_settings', 'order'
  entity_id text, -- ID of the affected entity
  details jsonb default '{}'::jsonb, -- changes, metadata
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- Policy: Store Owners/Admins can VIEW their own logs
create policy "Owners view audit logs" on public.audit_logs
  for select to authenticated
  using (
    exists (
      select 1 from public.users_roles
      where users_roles.tenant_id = audit_logs.tenant_id
      and users_roles.user_id = auth.uid()
      and users_roles.role in ('store_owner', 'store_admin')
    )
  );

-- Policy: Only Service Role (Backend) can INSERT logs
-- We strictly control logging via server actions/functions.
-- No public insert policy.

-- Indexes
create index if not exists idx_audit_logs_tenant_date on public.audit_logs(tenant_id, created_at desc);
create index if not exists idx_audit_logs_action on public.audit_logs(action);


-- 2. Analytics Events (Traffic & Behavior)
create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  event_type text not null default 'page_view', -- 'page_view', 'add_to_cart', 'purchase'
  page_path text,
  visitor_id text, -- Anonymous session ID or tracking cookie
  meta jsonb default '{}'::jsonb, -- referrer, device type, etc.
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.analytics_events enable row level security;

-- Policy: Owners can VIEW analytics
create policy "Owners view analytics" on public.analytics_events
  for select to authenticated
  using (
    exists (
      select 1 from public.users_roles
      where users_roles.tenant_id = analytics_events.tenant_id
      and users_roles.user_id = auth.uid()
      and users_roles.role in ('store_owner', 'store_admin')
    )
  );

-- Policy: Anyone (Anon/Auth) can INSERT events (for tracking)
-- But we must ensure they can only insert for the valid tenant they are visiting.
-- Since this is often high-volume and public, we might use a server action (Service Role) to insert
-- to avoid exposing RLS logic to public clients directly, OR allow public insert with no read access.
-- Strategy: We will use a Server Action to insert, so no Public Insert Policy needed.
-- This prevents malicious users from spamming fake events to other tenants easily.

-- Indexes
create index if not exists idx_analytics_tenant_date on public.analytics_events(tenant_id, created_at desc);
create index if not exists idx_analytics_event_type on public.analytics_events(event_type);
