import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/app/admin/(dashboard)/settings/catalog-actions'
import { BrandCategoryManager } from '@/components/admin/brand-category-manager'

async function getTenantId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .limit(1)
        .maybeSingle()
    return data?.tenant_id
}

export default async function AppCategoriesSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/app/login')

    const tenantId = await getTenantId(supabase, user.id)
    if (!tenantId) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                尚未建立商店
            </div>
        )
    }

    const categories = await getCategories(tenantId)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/app/settings" className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">分類管理</h1>
                    <p className="text-muted-foreground text-sm">新增、編輯或刪除商品分類</p>
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
