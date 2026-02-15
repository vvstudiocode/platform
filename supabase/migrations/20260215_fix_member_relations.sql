-- Add member_level_id to customers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'member_level_id') THEN
        ALTER TABLE public.customers ADD COLUMN member_level_id UUID REFERENCES public.member_levels(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Also check for level_id (if 20260214_member_system.sql was used) and migrate/unify if needed
-- Ideally we stick to one. user's current complete_member_system.sql didn't have either.
-- We will use member_level_id as the standard.

-- Enable RLS for customers if not already
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Grant permissions again just in case
GRANT ALL ON public.customers TO anon, authenticated, service_role;
