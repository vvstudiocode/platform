-- ================================================
-- Fix Orders Table Schema
-- Add all missing columns required by the API
-- ================================================

DO $$ 
BEGIN
    -- customer_line_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_line_id') THEN
        ALTER TABLE orders ADD COLUMN customer_line_id TEXT;
    END IF;

    -- shipping_method
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_method') THEN
        ALTER TABLE orders ADD COLUMN shipping_method TEXT;
    END IF;

    -- shipping_fee
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_fee') THEN
        ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- store_name (for pick up / 7-11)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'store_name') THEN
        ALTER TABLE orders ADD COLUMN store_name TEXT;
    END IF;

    -- store_code (for 7-11)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'store_code') THEN
        ALTER TABLE orders ADD COLUMN store_code TEXT;
    END IF;

    -- store_address (for pick up / 7-11)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'store_address') THEN
        ALTER TABLE orders ADD COLUMN store_address TEXT;
    END IF;
    
    -- notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'notes') THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
    END IF;

    -- total
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total') THEN
        ALTER TABLE orders ADD COLUMN total DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- subtotal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subtotal') THEN
        ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'items') THEN
        ALTER TABLE orders ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- order_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_number') THEN
        ALTER TABLE orders ADD COLUMN order_number TEXT;
    END IF;

    -- customer_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
        ALTER TABLE orders ADD COLUMN customer_name TEXT;
    END IF;

    -- customer_phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
        ALTER TABLE orders ADD COLUMN customer_phone TEXT;
    END IF;

    -- customer_email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_email') THEN
        ALTER TABLE orders ADD COLUMN customer_email TEXT;
    END IF;
END $$;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
