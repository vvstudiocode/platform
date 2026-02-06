import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getBrands, createBrand, updateBrand, deleteBrand } from '@/app/admin/(dashboard)/settings/catalog-actions'
import { BrandCategoryManager } from '@/components/admin/brand-category-manager'

async function getTenantId(supabase: any, userId: string) {
    // For sub-site, find the tenant owned by this user
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()
    return data?.tenant_id
}

export default async function AppBrandsSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/app/login')

    const tenantId = await getTenantId(supabase, user.id)
    if (!tenantId) {
        return (
            <div className="p-8 text-center text-zinc-500">
                尚未建立商店
            </div>
        )
    }

    const brands = await getBrands(tenantId)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/app/settings" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">品牌管理</h1>
                    <p className="text-zinc-400 text-sm">新增、編輯或刪除商品品牌</p>
                </div>
            </div>

            <BrandCategoryManager
                type="brand"
                items={brands}
                tenantId={tenantId}
                createAction={createBrand}
                updateAction={updateBrand}
                deleteAction={deleteBrand}
            />
        </div>
    )
}
