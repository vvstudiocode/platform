-- ==========================================
-- 總部管理模式 - 資料庫架構更新
-- ==========================================

-- 1. 新增 managed_by 欄位到 tenants 表
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS managed_by uuid REFERENCES auth.users;

-- 2. 刪除舊的 RLS 政策 (如果存在)
DROP POLICY IF EXISTS "Owners can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Owners can update their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Users can create tenant" ON public.tenants;

-- 3. 建立新的 RLS 政策 (總部管理模式)

-- 總部管理員可以查看自己管理的所有商店
CREATE POLICY "Admin can view managed stores"
ON public.tenants FOR SELECT
USING (managed_by = auth.uid());

-- 總部管理員可以建立新商店
CREATE POLICY "Admin can create stores"
ON public.tenants FOR INSERT
WITH CHECK (managed_by = auth.uid());

-- 總部管理員可以更新自己管理的商店
CREATE POLICY "Admin can update managed stores"
ON public.tenants FOR UPDATE
USING (managed_by = auth.uid());

-- 總部管理員可以刪除自己管理的商店
CREATE POLICY "Admin can delete managed stores"
ON public.tenants FOR DELETE
USING (managed_by = auth.uid());

-- 商家可以查看自己被指派的商店
CREATE POLICY "Merchant can view assigned store"
ON public.tenants FOR SELECT
USING (owner_id = auth.uid());

-- 4. 更新 users_roles 的 RLS 政策
DROP POLICY IF EXISTS "Users can view own roles" ON public.users_roles;

-- 使用者可以查看自己的角色
CREATE POLICY "Users can view own roles"
ON public.users_roles FOR SELECT
USING (user_id = auth.uid());

-- 總部管理員可以新增角色
CREATE POLICY "Admin can manage roles"
ON public.users_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'platform_admin'
  )
);
