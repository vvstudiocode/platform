-- 品牌與分類管理表
-- 執行此 SQL 以建立品牌和分類的管理功能

-- 1. 建立 brands 表
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- 2. 建立 categories 表
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- 確保欄位存在 (如果 table 已存在但缺少欄位)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'parent_id') THEN
        ALTER TABLE categories ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sort_order') THEN
        ALTER TABLE categories ADD COLUMN sort_order INT DEFAULT 0;
    END IF;
END $$;

-- 3. 啟用 RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 4. RLS 策略 - brands

-- 允許 authenticated 用戶查看其租戶的品牌
DROP POLICY IF EXISTS "Users can view brands for their tenant" ON brands;
CREATE POLICY "Users can view brands for their tenant"
    ON brands FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users_roles WHERE user_id = auth.uid()
        )
    );

-- 允許具備權限的用戶管理品牌 (新增/修改/刪除)
DROP POLICY IF EXISTS "Users can manage brands for their tenant" ON brands;
CREATE POLICY "Users can manage brands for their tenant"
    ON brands FOR ALL
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('store_owner', 'store_admin', 'super_admin')
        )
    );

-- 5. RLS 策略 - categories

-- 允許 authenticated 用戶查看其租戶的分類
DROP POLICY IF EXISTS "Users can view categories for their tenant" ON categories;
CREATE POLICY "Users can view categories for their tenant"
    ON categories FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users_roles WHERE user_id = auth.uid()
        )
    );

-- 允許具備權限的用戶管理分類 (新增/修改/刪除)
DROP POLICY IF EXISTS "Users can manage categories for their tenant" ON categories;
CREATE POLICY "Users can manage categories for their tenant"
    ON categories FOR ALL
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('store_owner', 'store_admin', 'super_admin')
        )
    );

-- 6. 建立索引提升查詢效能
CREATE INDEX IF NOT EXISTS idx_brands_tenant ON brands(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
