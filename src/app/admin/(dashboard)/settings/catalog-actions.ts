'use server'

import { getCurrentTenant } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import * as sharedCatalog from '@/features/settings/catalog-actions'

// Brands
export async function getBrands(tenantId: string) {
    return sharedCatalog.getBrands(tenantId)
}

export async function createBrand(tenantId: string, name: string) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant || tenant.id !== tenantId) return { error: 'Unauthorized' }

    const result = await sharedCatalog.createBrand(tenantId, name)
    if (result.success) revalidatePath('/admin/settings/brands')
    return result
}

export async function updateBrand(brandId: string, name: string) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: 'Unauthorized' }

    const result = await sharedCatalog.updateBrand(tenant.id, brandId, name)
    if (result.success) revalidatePath('/admin/settings/brands')
    return result
}

export async function deleteBrand(brandId: string) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: 'Unauthorized' }

    const result = await sharedCatalog.deleteBrand(tenant.id, brandId)
    if (result.success) revalidatePath('/admin/settings/brands')
    return result
}

// Categories
export async function getCategories(tenantId: string) {
    return sharedCatalog.getCategories(tenantId)
}

export async function createCategory(tenantId: string, name: string, parentId?: string) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant || tenant.id !== tenantId) return { error: 'Unauthorized' }

    const result = await sharedCatalog.createCategory(tenantId, name, parentId)
    if (result.success) revalidatePath('/admin/settings/categories')
    return result
}

export async function updateCategory(categoryId: string, name: string) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: 'Unauthorized' }

    const result = await sharedCatalog.updateCategory(tenant.id, categoryId, name)
    if (result.success) revalidatePath('/admin/settings/categories')
    return result
}

export async function deleteCategory(categoryId: string) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: 'Unauthorized' }

    const result = await sharedCatalog.deleteCategory(tenant.id, categoryId)
    if (result.success) revalidatePath('/admin/settings/categories')
    return result
}
