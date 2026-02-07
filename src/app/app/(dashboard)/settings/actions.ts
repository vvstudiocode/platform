'use server'

import { getCurrentTenant } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import * as sharedActions from '@/features/settings/actions'

export async function updateStoreSettings(storeId: string, prevState: any, formData: FormData) {
    const tenant = await getCurrentTenant('app')
    if (!tenant) return { error: '請先登入' }

    // Verify storeId matches
    if (tenant.id !== storeId) return { error: 'Unauthorized' }

    const result = await sharedActions.updateGeneralSettings(tenant.id, prevState, formData)

    if (result.success) {
        revalidatePath('/app/settings')

        // Log Audit Action
        const { logAuditAction } = await import('@/lib/audit')
        await logAuditAction({
            tenantId: tenant.id,
            action: 'UPDATE_SETTINGS',
            entityType: 'store_settings',
            entityId: tenant.id,
            details: { updated: true }
        })
    }

    return result
}
