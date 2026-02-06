-- Add images array to products (stores multiple image URLs)
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add options to products (stores variant definitions like Colors, Sizes)
-- Example: [{"id": "opt_1", "name": "Color", "values": ["Red", "Blue"]}]
ALTER TABLE products ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Red / S"
  options JSONB NOT NULL, -- e.g. {"Color": "Red", "Size": "S"}
  price DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access (for storefronts - dependent on store visibility, simplified here)
CREATE POLICY "Public read variants" ON product_variants
  FOR SELECT USING (true);

-- Policy: Store owners/admins can manage variants based on product ownership
-- Policy: Store owners/admins can manage variants based on product ownership
CREATE POLICY "Store owners manage variants" ON product_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products
      JOIN tenants ON products.tenant_id = tenants.id
      WHERE products.id = product_variants.product_id
      AND tenants.managed_by = auth.uid()
    )
  );
