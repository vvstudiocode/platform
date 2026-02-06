'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============ BRANDS ============

export async function getBrands(tenantId: string) {
    const supabase = await createClient()
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
    const { error } = await supabase
        .from('brands')
        .insert({ tenant_id: tenantId, name: name.trim() })

    if (error) {
        if (error.code === '23505') {
            return { error: '此品牌名稱已存在' }
        }
        return { error: error.message }
    }

    revalidatePath('/admin/settings/brands')
    revalidatePath('/app/settings/brands')
    return { success: true }
}

export async function updateBrand(brandId: string, name: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('brands')
        .update({ name: name.trim() })
        .eq('id', brandId)

    if (error) return { error: error.message }

    revalidatePath('/admin/settings/brands')
    revalidatePath('/app/settings/brands')
    return { success: true }
}

export async function deleteBrand(brandId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId)

    if (error) return { error: error.message }

    revalidatePath('/admin/settings/brands')
    revalidatePath('/app/settings/brands')
    return { success: true }
}

// ============ CATEGORIES ============

export async function getCategories(tenantId: string) {
    const supabase = await createClient()
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
    const { error } = await supabase
        .from('categories')
        .insert({
            tenant_id: tenantId,
            name: name.trim(),
            parent_id: parentId || null
        })

    if (error) {
        if (error.code === '23505') {
            return { error: '此分類名稱已存在' }
        }
        return { error: error.message }
    }

    revalidatePath('/admin/settings/categories')
    revalidatePath('/app/settings/categories')
    return { success: true }
}

export async function updateCategory(categoryId: string, name: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('categories')
        .update({ name: name.trim() })
        .eq('id', categoryId)

    if (error) return { error: error.message }

    revalidatePath('/admin/settings/categories')
    revalidatePath('/app/settings/categories')
    return { success: true }
}

export async function deleteCategory(categoryId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

    if (error) return { error: error.message }

    revalidatePath('/admin/settings/categories')
    revalidatePath('/app/settings/categories')
    return { success: true }
}
