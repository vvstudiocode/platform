-- Add missing timestamp columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;

-- Comment on columns
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when the order was paid';
COMMENT ON COLUMN orders.shipped_at IS 'Timestamp when the order was shipped';
