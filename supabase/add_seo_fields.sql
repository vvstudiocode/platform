-- ================================================
-- URL 與 SEO 系統 - 資料庫更新
-- 請在 Supabase SQL Editor 執行
-- ================================================

-- 1. Pages 表增加 SEO 欄位
ALTER TABLE pages ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'custom';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS og_image TEXT;

-- 2. Products 表增加 SEO 欄位
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

-- 3. Tenants 表增加 SEO 欄位（商店層級 SEO）
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS og_image TEXT;

-- 確認執行成功
SELECT 'SEO 欄位新增完成！' AS message;
