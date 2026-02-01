-- ==========================================
-- [最終版] RLS 修復腳本 & Schema 更新
-- 用途：
-- 1. 修復 "Internal Server Error" (500) -> 透過 SECURITY DEFINER 函數解決無限遞迴
-- 2. 允許新增商店時不指定 Owner -> 將 owner_id 改為 Nullable
-- ==========================================

-- 1. 建立 Helper 函數：檢查是否為總部管理員
-- NOTE: SECURITY DEFINER 讓此函數執行時繞過 RLS，避免 policy 遞迴呼叫自己造成當機
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users_roles
    WHERE user_id = auth.uid()
    AND role = 'platform_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 重建 users_roles 的 RLS 策略
-- 先刪除舊的 recursive policy
DROP POLICY IF EXISTS "Admin can manage roles" ON public.users_roles;

-- 使用新函數重建
CREATE POLICY "Admin can manage roles"
ON public.users_roles FOR ALL
TO authenticated
USING ( public.is_platform_admin() );

-- 3. [Store Management 修正] 將 owner_id 改為可選 (Nullable)
-- 這樣在建立新商店時，可以先設定 managed_by (總部)，而暫時沒有 owner_id
ALTER TABLE public.tenants ALTER COLUMN owner_id DROP NOT NULL;

-- 4. 確認 tenants 相關 RLS
DROP POLICY IF EXISTS "Admin can create stores" ON public.tenants;

CREATE POLICY "Admin can create stores"
ON public.tenants FOR INSERT
TO authenticated
WITH CHECK (managed_by = auth.uid());
