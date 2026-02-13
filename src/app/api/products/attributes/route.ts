import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const cookieStore = await cookies()

    // Determine Tenant ID
    // 1. Check URL param
    // 2. Check Cookie
    // 3. Check User Role (HQ or Store)

    // Use the robust getCurrentTenant helper
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'admin' or 'app' (optional)

    // We need to import getCurrentTenant dynamically or duplicate logic because it's in @/lib/tenant
    // But @/lib/tenant is typically for Server Actions. Let's check if it works in Route Handlers.
    // Yes, it uses cookies() and supabase.auth.getUser(), so it should work.

    // However, route handlers might need a specific client. 
    // Let's use a simplified robust logic here to avoid deep dependency issues if any.

    let tenantId = searchParams.get('tenantId')

    if (!tenantId) {
        // 1. Try to get 'admin' tenant (HQ)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            // A. Check if user manages a tenant (HQ Owner)
            const { data: managedTenant } = await supabase.from('tenants')
                .select('id')
                .eq('managed_by', user.id)
                .single()

            if (managedTenant) {
                tenantId = managedTenant.id
            } else {
                // B. Check for roles (Sub-site or Staff)
                const { data: role } = await supabase.from('users_roles')
                    .select('tenant_id')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                if (role) {
                    tenantId = role.tenant_id
                }
            }
        }
    }

    if (!tenantId) {
        return NextResponse.json({ brands: [], categories: [] })
    }

    try {
        const [brandsRes, categoriesRes] = await Promise.all([
            supabase.from('brands').select('id, name').eq('tenant_id', tenantId).order('name'),
            supabase.from('categories').select('id, name').eq('tenant_id', tenantId).order('name')
        ])

        return NextResponse.json({
            brands: brandsRes.data || [],
            categories: categoriesRes.data || []
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch attributes' }, { status: 500 })
    }
}
