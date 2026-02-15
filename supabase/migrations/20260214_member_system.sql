-- Create Member Levels Table
CREATE TABLE IF NOT EXISTS public.member_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    min_spend INTEGER NOT NULL DEFAULT 0,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    point_earn_rate NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    level_id UUID REFERENCES public.member_levels(id) ON DELETE SET NULL,
    current_points INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Point Transactions Table
CREATE TABLE IF NOT EXISTS public.point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earn_order', 'redeem', 'manual', 'expire', 'refund')),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    description TEXT,
    expiry_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_member_levels_tenant_id ON public.member_levels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_customer_id ON public.point_transactions(customer_id);

-- Enable RLS
ALTER TABLE public.member_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for Member Levels
CREATE POLICY "Public read access for member levels" ON public.member_levels
    FOR SELECT USING (true); -- Ideally restrict to tenant, but public read is safe for levels

CREATE POLICY "Admins can manage member levels" ON public.member_levels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tenants
            WHERE id = public.member_levels.tenant_id
            AND (managed_by = auth.uid() OR owner_id = auth.uid())
        )
    );

-- Policies for Customers
CREATE POLICY "Admins can manage customers" ON public.customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tenants
            WHERE id = public.customers.tenant_id
            AND (managed_by = auth.uid() OR owner_id = auth.uid())
        )
    );

CREATE POLICY "Customers can view own profile" ON public.customers
    FOR SELECT USING (
        auth.uid() = auth_user_id
    );

-- Policies for Point Transactions
CREATE POLICY "Admins can view point transactions" ON public.point_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tenants
            WHERE id = public.point_transactions.tenant_id
            AND (managed_by = auth.uid() OR owner_id = auth.uid())
        )
    );

CREATE POLICY "Customers can view own point transactions" ON public.point_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE id = public.point_transactions.customer_id
            AND auth_user_id = auth.uid()
        )
    );
