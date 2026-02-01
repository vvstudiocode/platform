-- ==========================================
-- RLS 權限與資料庫修復腳本
-- 用途：修復「登入後顯示沒有權限」的問題
-- ==========================================

-- 1. 確保 users_roles 表格的 RLS (Row Level Security) 已啟用
ALTER TABLE public.users_roles ENABLE ROW LEVEL SECURITY;

-- 2. 清除舊的策略 (避免衝突)
DROP POLICY IF EXISTS "Users can view own roles" ON public.users_roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON public.users_roles;
DROP POLICY IF EXISTS "Allow read own role" ON public.users_roles;

-- 3. [關鍵修正] 建立策略：允許使用者讀取自己的角色
-- 如果這條策略不存在，前端就無法查詢到自己的角色，導致驗證失敗
CREATE POLICY "Users can view own roles"
ON public.users_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. 建立策略：允許平台管理員管理所有角色 (新增/修改)
CREATE POLICY "Admin can manage roles"
ON public.users_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'platform_admin'
  )
);

-- 5. 確保 tenants 表格也有正確的 managed_by 欄位 (Phase 1 需求)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS managed_by uuid REFERENCES auth.users;

-- 6. 確保 tenants 的 RLS 也更新
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can view managed stores" ON public.tenants;
CREATE POLICY "Admin can view managed stores"
ON public.tenants FOR SELECT
TO authenticated
USING (managed_by = auth.uid());

-- 檢測用：列出目前的 users_roles (僅供確認資料存在)
SELECT * FROM public.users_roles;
