import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../catalog-actions'
import { BrandCategoryManager } from '@/components/admin/brand-category-manager'

async function getHQTenantId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('tenants')
        .select('id')
        .or(`slug.eq.hq,slug.eq.omo`)
        .limit(1)
        .single()
    return data?.id
}

export default async function CategoriesSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    const tenantId = await getHQTenantId(supabase, user.id)
    if (!tenantId) {
        return (
            <div className="p-8 text-center text-zinc-500">
                尚未建立商店
            </div>
        )
    }

    const categories = await getCategories(tenantId)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/settings" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">分類管理</h1>
                    <p className="text-zinc-400 text-sm">新增、編輯或刪除商品分類</p>
                </div>
            </div>

            <BrandCategoryManager
                type="category"
                items={categories}
                tenantId={tenantId}
                createAction={createCategory}
                updateAction={updateCategory}
                deleteAction={deleteCategory}
            />
        </div>
    )
}
