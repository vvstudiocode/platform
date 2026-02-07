import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ecpay } from '@/lib/payments/ecpay'

// 這是被外部 Cron 服務 (如 Vercel Cron, Zeabur Cron) 呼叫的 API
// 頻率: 每日一次 (e.g., 00:00 UTC)

export async function GET(req: Request) {
    // 1. Security Check
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const supabase = await createClient()

    try {
        // 2. Find Tenants due for billing OR past due
        // We select active tenants due for billing AND past_due tenants for retry/downgrade check
        const now = new Date().toISOString()
        const { data: targets, error } = await supabase
            .from('tenants')
            .select('id, name, plan_id, ecpay_card_id, next_billing_at, subscription_status')
            .or(`subscription_status.eq.active,subscription_status.eq.past_due`)

        if (error) throw error

        const results = []

        for (const tenant of targets || []) {
            try {
                // Filter logic in JS because mixed OR conditions with dates in Supabase can be tricky without raw query
                if (!tenant.next_billing_at) continue
                const nextBillingDate = new Date(tenant.next_billing_at)
                const currentDate = new Date()

                // If future, skip
                if (nextBillingDate > currentDate) continue

                const daysOverdue = Math.floor((currentDate.getTime() - nextBillingDate.getTime()) / (1000 * 60 * 60 * 24))

                // STRATEGY:
                // 1. Active & Due -> Charge. Fail -> past_due.
                // 2. Past Due & < 3 days -> Retry Charge.
                // 3. Past Due & >= 3 days -> Downgrade.

                if (tenant.subscription_status === 'past_due' && daysOverdue >= 3) {
                    // Downgrade to FREE
                    console.log(`[Downgrade] Tenant ${tenant.name} overdue ${daysOverdue} days. Downgrading to Free.`)

                    await supabase.from('tenants').update({
                        plan_id: 'free',
                        subscription_status: 'active',
                        next_billing_at: null // Free has no billing date? Or set to null.
                    }).eq('id', tenant.id)

                    // Send Downgrade Email
                    // await emailService.sendDowngradeNotification(...)

                    results.push({ tenant: tenant.name, status: 'downgraded' })
                    continue
                }

                // Prepare to Charge (Retry or First Time)
                if (!tenant.plan_id) continue
                const isRetry = tenant.subscription_status === 'past_due'

                // Get Plan Price
                const { data: plan } = await supabase
                    .from('plans')
                    .select('name, price_monthly, transaction_fee_percent')
                    .eq('id', tenant.plan_id)
                    .single()

                if (!plan) continue

                const totalAmount = plan.price_monthly

                // Free plan -> Just extend date (shouldn't happen if free has no next_billing_at, but safe guard)
                if (totalAmount === 0) {
                    const nextDate = new Date()
                    nextDate.setMonth(nextDate.getMonth() + 1)
                    await supabase.from('tenants').update({ next_billing_at: nextDate.toISOString() }).eq('id', tenant.id)
                    continue
                }

                // Charge Logic
                let chargeSuccess = false
                if (tenant.ecpay_card_id) {
                    // Use ECPay Station Pay 2.0 Method
                    // We use the same MerchantMemberID logic as binding: Truncated TenantID
                    const memberId = tenant.id.replace(/-/g, '').substring(0, 30)

                    console.log(`[Cron] Initiating Charge for ${tenant.name}...`)

                    // Call the Adapter
                    const chargeResult = await ecpay.createTokenCharge(memberId, totalAmount, `續約：${plan.name}`)

                    if (chargeResult.success) {
                        chargeSuccess = true
                        console.log(`[Cron] Charge Success: ${chargeResult.transactionId}`)

                        // Use the real transaction ID if available, else mock
                        await supabase.from('billing_transactions').insert({
                            tenant_id: tenant.id,
                            amount: totalAmount,
                            fee_amount: 0,
                            transaction_type: 'subscription_charge',
                            provider: 'ecpay',
                            provider_transaction_id: chargeResult.transactionId || `CRON-${Date.now()}`,
                            description: `續約：${plan.name}`
                        })
                    } else {
                        console.error(`[Cron] Charge Failed for ${tenant.name}`)
                        // Charge failed, will fall into else block below to mark past_due
                    }
                }

                if (chargeSuccess) {
                    // Success: Extend Date
                    // Extend Date (from NOW if retry? or from original date? Usually from NOW if service was active, or just add month to original to keep cycle)
                    // Let's add 1 month to CURRENT TIME to simplify, or add to next_billing_at.
                    // If we add to next_billing_at, we might be charging for "past time". 
                    // Let's reset cycle to Today + 30 days.
                    const nextDate = new Date()
                    nextDate.setDate(nextDate.getDate() + 30)

                    await supabase.from('tenants').update({
                        subscription_status: 'active',
                        next_billing_at: nextDate.toISOString()
                    }).eq('id', tenant.id)

                    results.push({ tenant: tenant.name, status: 'charged', amount: totalAmount })
                } else {
                    // Failure
                    console.log(`[Fail] Charge failed for ${tenant.name}`)

                    if (tenant.subscription_status === 'active') {
                        // Mark as past_due
                        await supabase.from('tenants').update({ subscription_status: 'past_due' }).eq('id', tenant.id)
                        // Send Failure Email
                    }
                    // If already past_due, do nothing (wait for next retry or downgrade)
                    results.push({ tenant: tenant.name, status: 'failed_retry' })
                }

            } catch (innerError) {
                console.error(`Error processing tenant ${tenant.id}:`, innerError)
            }
        }

        return NextResponse.json({ success: true, processed: results.length, details: results })

    } catch (e: any) {
        console.error('Cron Billing Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
