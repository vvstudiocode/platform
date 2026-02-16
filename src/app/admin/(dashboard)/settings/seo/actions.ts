'use server'

import { getCurrentTenant } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import * as sharedActions from '@/features/settings/actions'

export type State = sharedActions.State

export async function updateSeoSettings(prevState: any, formData: FormData) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: '請先登入' }

    const result = await sharedActions.updateSeoSettings(tenant.id, prevState, formData)

    if (result.success) {
        revalidatePath('/admin/settings/seo')
        revalidatePath('/', 'layout')
    }

    return result
}
