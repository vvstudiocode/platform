-- ================================================
-- SQL 整合腳本 - 確保所有所需的表和欄位存在
-- 執行此腳本以更新資料庫結構
-- ================================================

-- 1. 導覽項目表（如果不存在）
CREATE TABLE IF NOT EXISTS nav_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, page_id)
);

-- 導覽表索引
CREATE INDEX IF NOT EXISTS idx_nav_items_tenant ON nav_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nav_items_position ON nav_items(tenant_id, position);

-- 導覽表 RLS
ALTER TABLE nav_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "nav_items_select" ON nav_items;
DROP POLICY IF EXISTS "nav_items_insert" ON nav_items;
DROP POLICY IF EXISTS "nav_items_update" ON nav_items;
DROP POLICY IF EXISTS "nav_items_delete" ON nav_items;

CREATE POLICY "nav_items_select" ON nav_items FOR SELECT USING (true);
CREATE POLICY "nav_items_insert" ON nav_items FOR INSERT WITH CHECK (true);
CREATE POLICY "nav_items_update" ON nav_items FOR UPDATE USING (true);
CREATE POLICY "nav_items_delete" ON nav_items FOR DELETE USING (true);

-- 2. 頁面表 SEO 欄位（如果不存在）
DO $$ 
BEGIN
    -- seo_title
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pages' AND column_name = 'seo_title') THEN
        ALTER TABLE pages ADD COLUMN seo_title TEXT;
    END IF;
    
    -- seo_description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pages' AND column_name = 'seo_description') THEN
        ALTER TABLE pages ADD COLUMN seo_description TEXT;
    END IF;
    
    -- seo_keywords
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pages' AND column_name = 'seo_keywords') THEN
        ALTER TABLE pages ADD COLUMN seo_keywords TEXT;
    END IF;
    
    -- og_image
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pages' AND column_name = 'og_image') THEN
        ALTER TABLE pages ADD COLUMN og_image TEXT;
    END IF;
END $$;

-- 3. 商店表 SEO 欄位（如果不存在）
DO $$ 
BEGIN
    -- seo_title
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'seo_title') THEN
        ALTER TABLE tenants ADD COLUMN seo_title TEXT;
    END IF;
    
    -- seo_description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'seo_description') THEN
        ALTER TABLE tenants ADD COLUMN seo_description TEXT;
    END IF;
END $$;

-- 4. 商品表 SEO 欄位（如果不存在）
DO $$ 
BEGIN
    -- seo_title
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'seo_title') THEN
        ALTER TABLE products ADD COLUMN seo_title TEXT;
    END IF;
    
    -- seo_description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'seo_description') THEN
        ALTER TABLE products ADD COLUMN seo_description TEXT;
    END IF;
    
    -- seo_keywords
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'seo_keywords') THEN
        ALTER TABLE products ADD COLUMN seo_keywords TEXT;
    END IF;
END $$;

-- 5. 驗證結果
SELECT 'SQL 整合完成！' AS message;

-- 顯示表結構
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('tenants', 'pages', 'products', 'nav_items')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
