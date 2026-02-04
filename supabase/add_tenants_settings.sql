-- Add settings column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
