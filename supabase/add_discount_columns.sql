-- Add discount columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_type text CHECK (discount_type IN ('fixed', 'percent')),
ADD COLUMN IF NOT EXISTS discount_value numeric DEFAULT 0;

-- Refresh schema cache if necessary (Supabase sometimes needs this)
NOTIFY pgrst, 'reload schema';
