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

    const { searchParams } = new URL(request.url)
    let tenantId = searchParams.get('tenantId') || cookieStore.get('tenant_id')?.value

    if (!tenantId) {
        // Fallback: get from user session
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: role } = await supabase.from('users_roles')
                .select('tenant_id')
                .eq('user_id', user.id)
                .in('role', ['store_owner', 'store_admin', 'super_admin'])
                .single()
            tenantId = role?.tenant_id
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
