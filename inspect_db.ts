import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  // 1. Get current user (mocking or listing all users to find the active one is hard without session)
  // Instead, let's list all tenants and their settings/managed_by
  
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('id, slug, name, managed_by, settings')
  
  if (error) {
    console.error('Error fetching tenants:', error)
    return
  }

  console.log('Tenants found:', tenants?.length)
  tenants?.forEach(t => {
     console.log('Tenant:', t.slug, '| ID:', t.id, '| ManagedBy:', t.managed_by)
     if (t.slug === 'omo' || t.slug === 'hq') {
         console.log('   Settings for', t.slug, ':', JSON.stringify(t.settings, null, 2).slice(0, 200) + '...')
     }
  })

  // List users_roles to see connections
  const { data: roles } = await supabase.from('users_roles').select('*')
  console.log('Roles:', roles)
}

main()
