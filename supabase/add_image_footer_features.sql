-- ======================================
-- Phase 2: 圖片上傳系統 + Phase 3: 頁尾設定
-- ======================================

-- 注意：Storage buckets 需要在 Supabase Dashboard 手動建立
-- 1. 前往 Storage -> Create bucket
-- 2. 建立 'product-images' bucket (public)
-- 3. 建立 'store-logos' bucket (public)

-- 為 tenants 表新增頁尾設定欄位
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS footer_settings JSONB DEFAULT '{
  "socialLinks": {
    "line": "",
    "facebook": "",
    "threads": "",
    "instagram": "",
    "youtube": ""
  },
  "about": "",
  "contact": "",
  "email": "",
  "phone": "",
  "address": "",
  "copyright": ""
}'::jsonb;

-- 注釋說明
COMMENT ON COLUMN tenants.footer_settings IS '頁尾設定：社交媒體連結、關於我們、聯絡資訊';

-- 索引優化（如果 footer_settings 經常被查詢）
CREATE INDEX IF NOT EXISTS idx_tenants_footer_settings ON tenants USING GIN (footer_settings);
