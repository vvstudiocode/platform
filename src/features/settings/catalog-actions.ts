'use server'

import { createClient } from '@/lib/supabase/server'
import { verifyTenantAccess } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

// ==================== Brands ====================

export async function getBrands(tenantId: string) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name')

    if (error) throw error
    return data || []
}

export async function createBrand(tenantId: string, name: string) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('brands')
        .insert({ tenant_id: tenantId, name })

    if (error) return { error: error.message }
    return { success: true }
}

export async function updateBrand(tenantId: string, brandId: string, name: string) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('brands')
        .update({ name })
        .eq('id', brandId)
        .eq('tenant_id', tenantId)

    if (error) return { error: error.message }
    return { success: true }
}

export async function deleteBrand(tenantId: string, brandId: string) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId)
        .eq('tenant_id', tenantId)

    if (error) return { error: error.message }
    return { success: true }
}

// ==================== Categories ====================

export async function getCategories(tenantId: string) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sort_order')
        .order('name')

    if (error) throw error
    return data || []
}

export async function createCategory(tenantId: string, name: string, parentId?: string) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('categories')
        .insert({
            tenant_id: tenantId,
            name,
            parent_id: parentId || null
        })

    if (error) return { error: error.message }
    return { success: true }
}

export async function updateCategory(tenantId: string, categoryId: string, name: string) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', categoryId)
        .eq('tenant_id', tenantId)

    if (error) return { error: error.message }
    return { success: true }
}

export async function deleteCategory(tenantId: string, categoryId: string) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('tenant_id', tenantId)

    if (error) return { error: error.message }
    return { success: true }
}
