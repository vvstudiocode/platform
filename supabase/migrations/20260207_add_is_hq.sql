-- Add is_hq column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS is_hq BOOLEAN DEFAULT false;

-- Set OMO as HQ
UPDATE tenants 
SET is_hq = true 
WHERE slug = 'omo';

-- Ensure only one HQ exists (optional but good practice, though we just set one here)
-- We won't enforce a unique constraint strictly yet to avoid breaking existing data if multiple are accidentally set, 
-- but conceptually there should be only one.
