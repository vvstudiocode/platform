-- Migration: Secure product-images storage with folder-based RLS
-- Description: Enforce RLS on storage.objects so users can only manage files in their tenant's folder.

-- 1. Create Bucket (if not exists)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2. Enable RLS on objects
-- 2. Enable RLS on objects
-- Note: This requires owner privileges. Usually enabled by default on Supabase Storage.
-- If you get "must be owner of table objects", you can skip this line or run as postgres/superuser.
-- alter table storage.objects enable row level security;

-- 3. Policy: Public Read Access
-- Allow anyone to read files from 'product-images' bucket
create policy "Public Read Access"
on storage.objects for select
using ( bucket_id = 'product-images' );

-- 4. Policy: Tenant Insert Access
-- Allow Insert if:
-- 1. Bucket is 'product-images'
-- 2. User is authenticated
-- 3. filename starts with tenant_id/ (Folder isolation)
-- 4. User has role in that tenant OR is super_admin
create policy "Tenant Insert Access"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images' AND
  (
    -- Super Admin can do anything
    exists (
      select 1 from public.users_roles
      where user_id = auth.uid()
      and role = 'super_admin'
    )
    OR
    -- Store Owner/Admin can upload to their own folder
    exists (
      select 1 from public.users_roles
      where user_id = auth.uid()
      and tenant_id::text = (storage.foldername(name))[1]
      and role in ('store_owner', 'store_admin')
    )
  )
);

-- 5. Policy: Tenant Update Access
create policy "Tenant Update Access"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images' AND
  (
    exists (
      select 1 from public.users_roles
      where user_id = auth.uid()
      and role = 'super_admin'
    )
    OR
    exists (
      select 1 from public.users_roles
      where user_id = auth.uid()
      and tenant_id::text = (storage.foldername(name))[1]
      and role in ('store_owner', 'store_admin')
    )
  )
);

-- 6. Policy: Tenant Delete Access
create policy "Tenant Delete Access"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images' AND
  (
    exists (
      select 1 from public.users_roles
      where user_id = auth.uid()
      and role = 'super_admin'
    )
    OR
    exists (
      select 1 from public.users_roles
      where user_id = auth.uid()
      and tenant_id::text = (storage.foldername(name))[1]
      and role in ('store_owner', 'store_admin')
    )
  )
);
