'use server'

import { getCurrentTenant } from '@/lib/tenant'
import * as sharedActions from '@/features/products/actions'

// Admin 端的 wrapper functions，自動獲取 HQ tenant 並調用共用邏輯
export async function createProduct(prevState: any, formData: FormData) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: '請先登入' }

    return sharedActions.createProduct(tenant.id, '/admin/products', prevState, formData)
}

export async function updateProduct(productId: string, prevState: any, formData: FormData) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: '請先登入' }

    return sharedActions.updateProduct(tenant.id, productId, '/admin/products', prevState, formData)
}

export async function deleteProduct(productId: string) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: '請先登入' }

    return sharedActions.deleteProduct(tenant.id, productId)
}

export async function updateProductStatus(productId: string, status: string) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: '請先登入' }

    return sharedActions.updateProductStatus(tenant.id, productId, status)
}

export async function updateProductOrder(orderData: { id: string; order: number }[]) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: '請先登入' }

    return sharedActions.updateProductOrder(tenant.id, orderData)
}

export async function generateNewSKU() {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) throw new Error('請先登入')

    return sharedActions.generateNewSKU(tenant.id)
}
