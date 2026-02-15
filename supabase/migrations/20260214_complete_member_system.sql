-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure customers table exists and has all required columns
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    auth_user_id UUID REFERENCES auth.users(id),
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT, -- Added address column
    current_points INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if table already exists but columns are missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'phone') THEN
        ALTER TABLE public.customers ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'address') THEN
        ALTER TABLE public.customers ADD COLUMN address TEXT;
    END IF;
END $$;


-- 3. Create member_levels table
CREATE TABLE IF NOT EXISTS public.member_levels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    min_spend DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_type TEXT CHECK (discount_type IN ('none', 'percent', 'fixed')) DEFAULT 'none',
    discount_value DECIMAL(10,2) DEFAULT 0,
    point_rate DECIMAL(10,2) DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create point_transactions table
CREATE TABLE IF NOT EXISTS public.point_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT CHECK (type IN ('earn', 'redeem', 'adjust', 'expire')) NOT NULL,
    description TEXT,
    order_id TEXT, -- Optional link to order
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS (Row Level Security)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
-- Customers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own data' AND tablename = 'customers') THEN
        CREATE POLICY "Users can read own data" ON public.customers FOR SELECT USING (auth.uid() = auth_user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own data' AND tablename = 'customers') THEN
        CREATE POLICY "Users can update own data" ON public.customers FOR UPDATE USING (auth.uid() = auth_user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage store customers' AND tablename = 'customers') THEN
        CREATE POLICY "Admins can manage store customers" ON public.customers FOR ALL USING (true);
    END IF;
END $$;

-- Member Levels
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read levels' AND tablename = 'member_levels') THEN
        CREATE POLICY "Public read levels" ON public.member_levels FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage levels' AND tablename = 'member_levels') THEN
        CREATE POLICY "Admins manage levels" ON public.member_levels FOR ALL USING (true);
    END IF;
END $$;


-- 7. Grant permissions
GRANT ALL ON public.customers TO anon, authenticated, service_role;
GRANT ALL ON public.member_levels TO anon, authenticated, service_role;
GRANT ALL ON public.point_transactions TO anon, authenticated, service_role;
