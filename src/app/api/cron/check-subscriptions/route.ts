import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// CRON Endpoint: Check for expired subscriptions and downgrade them
// Triggered by Zeabur Cron or external scheduler
// GET /api/cron/check-subscriptions?secret=YOUR_CRON_SECRET

export async function GET(request: NextRequest) {
    // 1. Security Check
    const authHeader = request.headers.get('authorization')
    const secret = request.nextUrl.searchParams.get('secret')

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && secret !== process.env.CRON_SECRET) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const supabase = await createClient()

    // 2. Find Expired Subscriptions
    // Condition: next_billing_at < NOW AND plan_id != 'free' AND subscription_status = 'active'
    const now = new Date().toISOString()

    const { data: expiredTenants, error: fetchError } = await supabase
        .from('tenants')
        .select('id, name, plan_id, next_billing_at')
        .lt('next_billing_at', now)
        .neq('plan_id', 'free')
        .eq('subscription_status', 'active')

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const results = {
        processed: 0,
        errors: [] as string[]
    }

    // 3. Process Downgrades
    if (expiredTenants && expiredTenants.length > 0) {
        for (const tenant of expiredTenants) {
            try {
                // A. Downgrade Tenant
                const { error: updateError } = await supabase
                    .from('tenants')
                    .update({
                        plan_id: 'free',
                        subscription_status: 'active', // Back to active free plan
                        next_billing_at: null, // No next billing date for free plan
                        subscription_tier: 'free'
                    })
                    .eq('id', tenant.id)

                if (updateError) throw new Error(`Update failed: ${updateError.message}`)

                // B. Log Transaction (Plan Change Log)
                const { error: logError } = await supabase
                    .from('billing_transactions')
                    .insert({
                        tenant_id: tenant.id,
                        transaction_type: 'plan_downgrade',
                        amount: 0,
                        fee_amount: 0,
                        provider: 'system_cron',
                        provider_transaction_id: `CRON-${Date.now()}-${tenant.id}`,
                        order_id: null,
                        occurred_at: new Date().toISOString(),
                        description: '[系統自動] 方案到期，降級至免費版'
                    })

                if (logError) throw new Error(`Log failed: ${logError.message}`)

                results.processed++
                console.log(`[Cron] Downgraded tenant ${tenant.id} (${tenant.name}) to free plan.`)

            } catch (err: any) {
                console.error(`[Cron] Failed to downgrade tenant ${tenant.id}:`, err)
                results.errors.push(`Tenant ${tenant.id}: ${err.message}`)
            }
        }
    }

    return NextResponse.json({
        success: true,
        scanned: expiredTenants?.length || 0,
        downgraded: results.processed,
        errors: results.errors
    })
}
