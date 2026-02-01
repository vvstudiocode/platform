-- 修復腳本：清除重複權限並重新設定
-- 1. 設定總部商店管理者
UPDATE tenants 
SET managed_by = (SELECT id FROM auth.users WHERE email = 'f127283741@gmail.com')
WHERE slug = 'hq';

-- 2. 重置用戶角色（避免多筆資料導致系統錯誤）
DELETE FROM users_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'f127283741@gmail.com');

-- 3. 重新插入單一角色
INSERT INTO users_roles (user_id, tenant_id, role)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'f127283741@gmail.com'),
    (SELECT id FROM tenants WHERE slug = 'hq'),
    'super_admin';
