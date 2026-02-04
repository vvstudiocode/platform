-- ================================================
-- Fix Order Placement Error
-- Add missing customer_line_id column to orders table
-- ================================================

DO $$ 
BEGIN
    -- Check if customer_line_id exists in orders table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'customer_line_id') THEN
        ALTER TABLE orders ADD COLUMN customer_line_id TEXT;
    END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'customer_line_id';
