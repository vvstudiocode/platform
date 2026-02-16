-- ================================================
-- Create Cart Items Table
-- Missing in previous migration
-- ================================================

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_items_tenant_customer ON public.cart_items(tenant_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(product_id);

-- RLS Policies
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Service Role (Admin) Access
CREATE POLICY "Service role full access"
    ON public.cart_items
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Authenticated User Access (Owner)
CREATE POLICY "Users can manage their own cart items"
    ON public.cart_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.customers c
            WHERE c.id = cart_items.customer_id
            AND c.auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.customers c
            WHERE c.id = cart_items.customer_id
            AND c.auth_user_id = auth.uid()
        )
    );
