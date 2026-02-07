import { redirect } from 'next/navigation'
import { getCurrentTenant } from '@/lib/tenant'
import { BillingSettingsPage } from '@/features/billing'
import { getAllPlans, getBillingHistory } from '@/features/billing/actions'

export default async function AdminBillingPage() {
    // 使用統一的 Tenant 獲取邏輯
    const tenant = await getCurrentTenant('admin')

    if (!tenant) {
        redirect('/admin/login')
    }

    // 獲取 Plans 和 Billing History
    const [plans, history] = await Promise.all([
        getAllPlans(),
        getBillingHistory(tenant.id)
    ])

    return (
        <BillingSettingsPage
            tenant={tenant}
            plans={plans}
            history={history}
        />
    )
}
