-- Enable pgcrypto extension for encryption
create extension if not exists pgcrypto;

-- Create table for storing encrypted tenant secrets
create table if not exists public.tenant_secrets (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  secret_type text not null, -- e.g. 'line_pay_channel_id', 'line_pay_channel_secret', 'ecpay_merchant_id'
  encrypted_value text not null, -- Stores the base64 encoded encrypted data
  key_id text, -- Optional: to version keys if needed
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(tenant_id, secret_type)
);

-- Enable RLS
alter table public.tenant_secrets enable row level security;

-- Policy: Store owners can manage their secrets
create policy "Store owners can manage their secrets"
  on public.tenant_secrets
  for all
  to authenticated
  using (
    exists (
      select 1 from public.users_roles
      where users_roles.tenant_id = tenant_secrets.tenant_id
      and users_roles.user_id = auth.uid()
      and users_roles.role in ('store_owner', 'store_admin')
    )
  );

-- Function: Set Secret (Encrypts data before inserting)
-- Usage: select set_tenant_secret('tenant-uuid', 'line_pay_secret', 'raw-secret-string', 'master-encryption-key');
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
    encode(pgp_sym_encrypt(p_raw_value, p_encryption_key), 'base64') -- key must be provided from Env Var in app
  )
  on conflict (tenant_id, secret_type)
  do update set 
    encrypted_value = excluded.encrypted_value,
    updated_at = now();
end;
$$ language plpgsql security definer;

-- Function: Get Secret (Decrypts data)
-- Usage: select get_tenant_secret('tenant-uuid', 'line_pay_secret', 'master-encryption-key');
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

  -- Decrypt and return
  return pgp_sym_decrypt(decode(v_encrypted, 'base64'), p_encryption_key)::text;
exception when others then
  return null; -- Handle decryption failure gracefully
end;
$$ language plpgsql security definer;
