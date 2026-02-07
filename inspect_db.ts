import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use Service Role Key to bypass RLS and access auth.admin
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  console.log('--- Inspecting DB & Generating Login Link ---')

  // 1. Find HQ Tenant
  const { data: hq, error: hqError } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .eq('is_hq', true)
    .single()

  if (hqError) {
    console.error('Error fetching HQ tenant:', hqError)
    return
  }

  console.log('HQ Tenant:', hq.name, `(${hq.id})`)

  // 2. Find Owner of HQ
  // Strategy: 
  // a) Check managed_by field on tenant
  // b) Check users_roles table for 'store_owner' on this tenant
  // c) Check users_roles table for 'super_admin' (global)

  let userId = hq.managed_by
  let method = 'managed_by'

  if (!userId) {
    const { data: role } = await supabaseAdmin
      .from('users_roles')
      .select('user_id')
      .eq('tenant_id', hq.id)
      .eq('role', 'store_owner')
      .maybeSingle()

    if (role) {
      userId = role.user_id
      method = 'store_owner role'
    }
  }

  // Also check for super_admin if no owner found or just to list them
  const { data: superAdmins } = await supabaseAdmin
    .from('users_roles')
    .select('user_id')
    .eq('role', 'super_admin')

  if (!userId && superAdmins && superAdmins.length > 0) {
    userId = superAdmins[0].user_id
    method = 'super_admin role'
  }

  if (!userId) {
    console.log('No owner or super_admin found for HQ')
    return
  }

  console.log(`Found target User ID: ${userId} (via ${method})`)

  // 3. Get User Email
  const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

  if (userError || !user) {
    console.log('Error fetching user details:', userError)
    return
  }

  console.log('User Email:', user.email)

  // 4. Generate Link
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email!
  })

  if (linkError) {
    console.log('Error generating magic link:', linkError)
  } else {
    console.log('\nLogin Link:\n', linkData.properties?.action_link)
    console.log('\nThis link will allow you to login as the HQ admin directly.')
  }
}

main()
