-- ================================================
-- SaaS 電商平台 - 完整 Schema（安全版）
-- 執行這個檔案會 DROP 舊資料重新建立！
-- ================================================

-- 清除舊的 policies（避免 "already exists" 錯誤）
DROP POLICY IF EXISTS "tenants_select" ON tenants;
DROP POLICY IF EXISTS "tenants_insert" ON tenants;
DROP POLICY IF EXISTS "tenants_update" ON tenants;
DROP POLICY IF EXISTS "tenants_delete" ON tenants;
DROP POLICY IF EXISTS "users_roles_select" ON users_roles;
DROP POLICY IF EXISTS "users_roles_insert" ON users_roles;
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_insert" ON orders;
DROP POLICY IF EXISTS "orders_update" ON orders;
DROP POLICY IF EXISTS "pages_select" ON pages;
DROP POLICY IF EXISTS "pages_insert" ON pages;
DROP POLICY IF EXISTS "pages_update" ON pages;
DROP POLICY IF EXISTS "pages_delete" ON pages;

-- 清除舊的 tables（會刪除所有資料！）
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users_roles CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- 清除序列
DROP SEQUENCE IF EXISTS product_sku_seq;

-- ================================================
-- 建立 Tables
-- ================================================

-- 1. 商店 (Tenants)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    owner_id UUID REFERENCES auth.users(id),
    managed_by UUID REFERENCES auth.users(id),
    subscription_tier TEXT DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 用戶角色
CREATE TABLE users_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'store_owner', 'store_admin', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 商品
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    sku TEXT,
    name TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    category TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    price_krw DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 訂單
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10,2) DEFAULT 0,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 頁面
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content JSONB DEFAULT '[]',
    meta_title TEXT,
    meta_description TEXT,
    is_homepage BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

-- 商品編號序列
CREATE SEQUENCE product_sku_seq START 1;

-- ================================================
-- 索引
-- ================================================
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_pages_tenant ON pages(tenant_id);
CREATE INDEX idx_users_roles_user ON users_roles(user_id);
CREATE INDEX idx_users_roles_tenant ON users_roles(tenant_id);

-- ================================================
-- RLS 政策
-- ================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Tenants
CREATE POLICY "tenants_select" ON tenants FOR SELECT USING (true);
CREATE POLICY "tenants_insert" ON tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "tenants_update" ON tenants FOR UPDATE USING (true);
CREATE POLICY "tenants_delete" ON tenants FOR DELETE USING (true);

-- Users Roles
CREATE POLICY "users_roles_select" ON users_roles FOR SELECT USING (true);
CREATE POLICY "users_roles_insert" ON users_roles FOR INSERT WITH CHECK (true);

-- Products
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE USING (true);
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);

-- Orders
CREATE POLICY "orders_select" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (true);

-- Pages
CREATE POLICY "pages_select" ON pages FOR SELECT USING (true);
CREATE POLICY "pages_insert" ON pages FOR INSERT WITH CHECK (true);
CREATE POLICY "pages_update" ON pages FOR UPDATE USING (true);
CREATE POLICY "pages_delete" ON pages FOR DELETE USING (true);

-- ================================================
-- 完成！檢查結果
-- ================================================
SELECT 'Schema 建立完成！' AS message;
