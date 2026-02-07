-- Drop the existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Re-add the constraint with all required statuses
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'));

-- Update any invalid statuses to 'pending' just in case (optional, safe to omit if data is clean)
-- UPDATE orders SET status = 'pending' WHERE status NOT IN ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled');
