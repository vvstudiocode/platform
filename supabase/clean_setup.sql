-- ================================================
-- OMO Select Platform - Database Setup
-- 包含：導覽項目表、SEO 欄位
-- ================================================

-- 1. 導覽項目表 (Navigation Items)
-- 用於儲存商店前台的選單連結
CREATE TABLE IF NOT EXISTS nav_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, page_id)
);

-- 索引：加速查詢
CREATE INDEX IF NOT EXISTS idx_nav_items_tenant ON nav_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nav_items_position ON nav_items(tenant_id, position);

-- RLS (Row Level Security) 政策：允許公開讀取 (前端導航需要)，但在應用層控制寫入權限
ALTER TABLE nav_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "nav_items_select" ON nav_items;
DROP POLICY IF EXISTS "nav_items_insert" ON nav_items;
DROP POLICY IF EXISTS "nav_items_update" ON nav_items;
DROP POLICY IF EXISTS "nav_items_delete" ON nav_items;

CREATE POLICY "nav_items_select" ON nav_items FOR SELECT USING (true);
CREATE POLICY "nav_items_insert" ON nav_items FOR INSERT WITH CHECK (true);
CREATE POLICY "nav_items_update" ON nav_items FOR UPDATE USING (true);
CREATE POLICY "nav_items_delete" ON nav_items FOR DELETE USING (true);

-- 2. SEO 欄位擴充 (Schema Updates)
-- 確保 tenants, pages, products 表都有標準 SEO 欄位
DO $$ 
BEGIN
    -- Pages SEO
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'seo_title') THEN
        ALTER TABLE pages ADD COLUMN seo_title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'seo_description') THEN
        ALTER TABLE pages ADD COLUMN seo_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'seo_keywords') THEN
        ALTER TABLE pages ADD COLUMN seo_keywords TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'og_image') THEN
        ALTER TABLE pages ADD COLUMN og_image TEXT;
    END IF;

    -- Footer Settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'footer_settings') THEN
        ALTER TABLE tenants ADD COLUMN footer_settings JSONB DEFAULT '{
            "socialLinks": {
                "line": "",
                "facebook": "",
                "threads": "",
                "instagram": "",
                "youtube": ""
            }
        }'::jsonb;
    END IF;

    -- Tenants SEO
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'seo_title') THEN
        ALTER TABLE tenants ADD COLUMN seo_title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'seo_description') THEN
        ALTER TABLE tenants ADD COLUMN seo_description TEXT;
    END IF;

    -- Products SEO
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_title') THEN
        ALTER TABLE products ADD COLUMN seo_title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_description') THEN
        ALTER TABLE products ADD COLUMN seo_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_keywords') THEN
        ALTER TABLE products ADD COLUMN seo_keywords TEXT;
    END IF;

    -- Orders Missing Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_line_id') THEN
        ALTER TABLE orders ADD COLUMN customer_line_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_method') THEN
        ALTER TABLE orders ADD COLUMN shipping_method TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_fee') THEN
        ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(10,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'store_name') THEN
        ALTER TABLE orders ADD COLUMN store_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'store_code') THEN
        ALTER TABLE orders ADD COLUMN store_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'store_address') THEN
        ALTER TABLE orders ADD COLUMN store_address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'notes') THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total') THEN
        ALTER TABLE orders ADD COLUMN total DECIMAL(10,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subtotal') THEN
        ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'items') THEN
        ALTER TABLE orders ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_number') THEN
        ALTER TABLE orders ADD COLUMN order_number TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
        ALTER TABLE orders ADD COLUMN customer_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
        ALTER TABLE orders ADD COLUMN customer_phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_email') THEN
        ALTER TABLE orders ADD COLUMN customer_email TEXT;
    END IF;END $$;
