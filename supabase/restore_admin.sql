-- 1. 確保您的帳號存在（請將 admin@example.com 換成您的 Email）
-- 假設您的 User ID 已經在 auth.users 中
-- 我們先建立總部商店
INSERT INTO tenants (name, slug, subscription_tier)
VALUES ('總部商店', 'hq', 'enterprise')
ON CONFLICT (slug) DO NOTHING;

-- 2. 賦予自己 platform_admin 權限
-- 請將下面的 email 換成您登入用的 email
DO $$
DECLARE
    target_user_id UUID;
    hq_tenant_id UUID;
BEGIN
    -- 取得您的 User ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'admin@example.com'; -- ⚠️ 請確認這裡是用戶的 Email

    -- 取得總部 Tenant ID
    SELECT id INTO hq_tenant_id FROM tenants WHERE slug = 'hq';

    -- 如果找不到用戶，拋出錯誤
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION '找不到用戶，請確認 Email 是否正確';
    END IF;

    -- 插入角色
    INSERT INTO users_roles (user_id, tenant_id, role)
    VALUES (target_user_id, hq_tenant_id, 'super_admin'); -- 這裡對應 schema 的 check constraint
    
    -- 注意：原本 schema check 是 (super_admin, store_owner, store_admin, staff)
    -- 但是 layout.tsx 檢查的是 'platform_admin'
    -- 我們需要修正 schema 或 layout。
    -- 根據最新的 schema.sql，role check 是 ('super_admin', 'store_owner', 'store_admin', 'staff')
    -- 但是 layout.tsx 第 35 行檢查的是 .eq('role', 'platform_admin')
    
    -- 修正方案：我們先插入 'super_admin'，然後我會去修正 layout.tsx 讓它檢查 'super_admin'
END $$;
