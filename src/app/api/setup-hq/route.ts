import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    // 1. Ensure 'hq' tenant exists
    const { data: existingHq } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'hq')
        .maybeSingle()

    let hqId = existingHq?.id

    if (!hqId) {
        const { data: newHq, error: createError } = await supabase
            .from('tenants')
            .insert({
                slug: 'hq',
                name: 'Headquarters',
                managed_by: user.id,
                settings: {}
            })
            .select()
            .single()

        if (createError) {
            return NextResponse.json({ error: 'Failed to create HQ', details: createError }, { status: 500 })
        }
        hqId = newHq.id
    } else {
        // Ensure managed_by is current user (optional, or just add role)
        // Let's just update it to be safe for this user
        /* 
        await supabase
            .from('tenants')
            .update({ managed_by: user.id })
            .eq('id', hqId)
        */
    }

    // 2. Ensure user has super_admin role
    const { error: roleError } = await supabase
        .from('users_roles')
        .upsert({
            user_id: user.id,
            tenant_id: hqId,
            role: 'super_admin'
        }, { onConflict: 'user_id, tenant_id, role' }) // composite key might differ, but usually user_id+tenant_id is unique or user_id+role

    if (roleError) {
        // Try inserting if upsert fails on constraint
        // Or purely allow it.
        return NextResponse.json({ error: 'Failed to assign role', details: roleError }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        message: 'HQ setup complete. You are now Super Admin of HQ.',
        hqId,
        user: user.email
    })
}
