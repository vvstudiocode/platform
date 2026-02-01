-- ============================================================
-- SaaS Platform Schema - 修復版本
-- 適用於：Next.js + Supabase 電商 SaaS 平台
-- ============================================================

-- 先刪除舊的表格 (如果存在)
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users_roles CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- 刪除舊的函數
DROP FUNCTION IF EXISTS public.is_platform_admin() CASCADE;
DROP FUNCTION IF EXISTS public.can_manage_tenant(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.decrement_stock(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================
-- 1. 建立 tenants (商店) 表格
-- ============================================================
CREATE TABLE public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id),
    managed_by UUID REFERENCES auth.users(id),
    subscription_tier TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. 建立 products (商品) 表格
-- ============================================================
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    price_krw INTEGER DEFAULT 0,
    wholesale_price DECIMAL(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    sku TEXT,
    category TEXT,
    brand TEXT,
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    options JSONB DEFAULT '{}'::jsonb,
    variants JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

-- ============================================================
-- 3. 建立 orders (訂單) 表格
-- ============================================================
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_line_id TEXT,
    shipping_method TEXT DEFAULT '711',
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    store_name TEXT,
    store_code TEXT,
    store_address TEXT,
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    notes TEXT,
    admin_notes TEXT,
    tracking_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    UNIQUE(tenant_id, order_number)
);

-- ============================================================
-- 4. 建立 users_roles (使用者角色) 表格
-- ============================================================
CREATE TABLE public.users_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('platform_admin', 'store_owner', 'store_staff')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tenant_id, role)
);

-- ============================================================
-- 5. 建立 categories (分類) 表格
-- ============================================================
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. 建立 pages (頁面) 表格
-- ============================================================
CREATE TABLE public.pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content JSONB DEFAULT '[]'::jsonb,
    meta_title TEXT,
    meta_description TEXT,
    is_homepage BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

-- ============================================================
-- Index 建立
-- ============================================================
CREATE INDEX idx_products_tenant ON public.products(tenant_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_orders_tenant ON public.orders(tenant_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX idx_users_roles_user ON public.users_roles(user_id);

-- ============================================================
-- Helper Functions
-- ============================================================

-- 檢查是否為 Platform Admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users_roles
        WHERE user_id = auth.uid()
        AND role = 'platform_admin'
        AND tenant_id IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 檢查是否有權管理商店
CREATE OR REPLACE FUNCTION public.can_manage_tenant(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenants
        WHERE id = tenant_uuid
        AND (managed_by = auth.uid() OR owner_id = auth.uid())
    ) OR public.is_platform_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 庫存扣減函數
CREATE OR REPLACE FUNCTION public.decrement_stock(product_uuid UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock = GREATEST(0, stock - amount)
    WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Triggers
-- ============================================================
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Tenants
CREATE POLICY "Platform admin full access" ON public.tenants
    FOR ALL USING (public.is_platform_admin());

CREATE POLICY "Users view own tenants" ON public.tenants
    FOR SELECT USING (managed_by = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Public read tenants" ON public.tenants
    FOR SELECT USING (true);

-- Products
CREATE POLICY "Manage own products" ON public.products
    FOR ALL USING (public.can_manage_tenant(tenant_id));

CREATE POLICY "Public read active products" ON public.products
    FOR SELECT USING (status = 'active');

-- Orders
CREATE POLICY "Manage own orders" ON public.orders
    FOR ALL USING (public.can_manage_tenant(tenant_id));

CREATE POLICY "Public create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read own orders" ON public.orders
    FOR SELECT USING (true);

-- Users Roles
CREATE POLICY "Users view own roles" ON public.users_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Platform admin manage roles" ON public.users_roles
    FOR ALL USING (public.is_platform_admin());

-- Categories
CREATE POLICY "Manage own categories" ON public.categories
    FOR ALL USING (tenant_id IS NULL OR public.can_manage_tenant(tenant_id));

CREATE POLICY "Public read categories" ON public.categories
    FOR SELECT USING (true);

-- Pages
CREATE POLICY "Manage own pages" ON public.pages
    FOR ALL USING (public.can_manage_tenant(tenant_id));

CREATE POLICY "Public read published pages" ON public.pages
    FOR SELECT USING (published = true);
