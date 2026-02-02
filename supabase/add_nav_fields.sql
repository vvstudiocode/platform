-- ================================================
-- 導覽目錄管理表
-- 執行後可刪除此檔案
-- ================================================

-- 建立導覽項目表
CREATE TABLE IF NOT EXISTS nav_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,  -- 可自訂標題，預設使用頁面標題
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, page_id)  -- 同一頁面只能加入一次
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_nav_items_tenant ON nav_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nav_items_position ON nav_items(tenant_id, position);

-- RLS 政策
ALTER TABLE nav_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nav_items_select" ON nav_items FOR SELECT USING (true);
CREATE POLICY "nav_items_insert" ON nav_items FOR INSERT WITH CHECK (true);
CREATE POLICY "nav_items_update" ON nav_items FOR UPDATE USING (true);
CREATE POLICY "nav_items_delete" ON nav_items FOR DELETE USING (true);

-- 驗證
SELECT 'nav_items 表建立完成！' AS message;
