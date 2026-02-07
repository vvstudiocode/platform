import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()

    try {
        const { planId, tenantId } = await req.json()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Verify Ownership
        const { data: role } = await supabase
            .from('users_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('tenant_id', tenantId)
            .in('role', ['store_owner', 'store_admin'])
            .single()

        if (!role) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
        }

        // 2. Validate Plan
        const VALID_PLANS = ['free', 'starter', 'growth', 'scale']
        if (!VALID_PLANS.includes(planId)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        // 3. Mock Payment Processing (ECPay Token)
        // In production: Call ECPay API with saved CardID to charge immediately or verify card
        // console.log(`Processing payment for ${planId} for tenant ${tenantId}`)

        // 4. Update Tenant Plan
        const LIMITS: Record<string, number> = {
            'free': 50,
            'starter': 1024,
            'growth': 10240,
            'scale': 51200
        }

        const { error: updateError } = await supabase
            .from('tenants')
            .update({
                plan_id: planId,
                // In production, we might want separate logic for storage upgrades vs plan upgrades
                // For now, updating plan resets storage limit to plan default
                // storage_limit_mb: LIMITS[planId], // Uncomment if storage_limit is column on tenants, currently it's on plans table but logic might be mixed.
                // Actually plans schema has storage_limit_mb. Tenants usually inherit from plan unless custom.
                // But schema in migration says: plans table has storage_limit_mb. 
                // Let's assume we rely on JOIN or copying it if we want custom override.
                // The migration v6 says tenants has 'storage_usage_mb'. 'storage_limit_mb' is in plans.
                // So updating plan_id is enough.
                subscription_status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('id', tenantId)

        if (updateError) {
            console.error('Update error:', updateError)
            return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
        }

        return NextResponse.json({ success: true, planId })

    } catch (e: any) {
        console.error('Billing API Error:', e)
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
    }
}
