import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { NavigationManager } from '@/features/navigation/components/navigation-manager'
import { addStoreNavItem, removeStoreNavItem, updateStoreNavOrder } from './actions'

interface Props {
    params: Promise<{ storeId: string }>
}

export default async function StoreNavigationPage({ params }: Props) {
    const { storeId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return <div className="p-6 text-red-500">請先登入</div>
    }

    // 驗證權限
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('id', storeId)
        .eq('managed_by', user.id)
        .single()

    if (!store) {
        notFound()
    }

    // 取得目前的導覽項目
    const { data: navItems } = await supabase
        .from('nav_items')
        .select('id, title, position, page_id, pages(title, slug)')
        .eq('tenant_id', storeId)
        .order('position', { ascending: true })

    // 取得所有已發布的頁面（用於選擇器）
    const { data: pages } = await supabase
        .from('pages')
        .select('id, title, slug')
        .eq('tenant_id', storeId)
        .eq('published', true)
        .order('title', { ascending: true })

    return (
        <div className="p-6">
            <NavigationManager
                navItems={(navItems || []) as any}
                availablePages={pages || []}
                addAction={addStoreNavItem.bind(null, storeId)}
                removeAction={removeStoreNavItem.bind(null, storeId)}
                updateOrderAction={updateStoreNavOrder.bind(null, storeId)}
            />
        </div>
    )
}
