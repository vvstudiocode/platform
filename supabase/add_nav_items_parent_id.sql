-- Add parent_id to nav_items for nested navigation
ALTER TABLE nav_items 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES nav_items(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_nav_items_parent_id ON nav_items(parent_id);
