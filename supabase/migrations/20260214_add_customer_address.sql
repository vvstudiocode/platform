-- Add address column to customers
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add phone column check (already exists in previous migration but good to ensure)
-- ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone TEXT; 
