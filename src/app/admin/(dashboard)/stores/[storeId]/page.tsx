import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Store, ExternalLink, Package, ClipboardList, Settings, Users, FileText, UserCircle, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OwnerAccountManager } from './owner-account-manager'

interface Props {
    params: Promise<{ storeId: string }>
}

export default async function StoreDetailPage({ params }: Props) {
    const { storeId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: store } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', storeId)
        .eq('managed_by', user?.id || '')
        .single()

    if (!store) {
        notFound()
    }

    // 取得擁有者資訊
    let ownerInfo = null
    if (store.owner_id) {
        const { data: ownerRole } = await supabase
            .from('users_roles')
            .select('user_id, role')
            .eq('tenant_id', storeId)
            .eq('role', 'store_owner')
            .single()

        if (ownerRole) {
            // 嘗試從 auth.users 取得 email（需要 service role）
            ownerInfo = { id: ownerRole.user_id }
        }
    }

    // 取得統計資料
    const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', storeId)

    const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', storeId)

    const { count: pendingOrderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', storeId)
        .eq('status', 'pending')

    // 計算營收
    const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('tenant_id', storeId)
        .eq('payment_status', 'paid')

    const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

    const quickActions = [
        {
            icon: Package,
            label: '商品管理',
            href: `/admin/stores/${storeId}/products`,
            description: `${productCount || 0} 件商品`,
            color: 'text-blue-500',
        },
        {
            icon: ClipboardList,
            label: '訂單管理',
            href: `/admin/stores/${storeId}/orders`,
            description: `${pendingOrderCount || 0} 筆待處理`,
            color: 'text-amber-500',
        },
        {
            icon: Users,
            label: '客戶管理',
            href: `/admin/stores/${storeId}/customers`,
            description: '管理顧客資料',
            color: 'text-emerald-500',
        },
        {
            icon: FileText,
            label: '頁面編輯',
            href: `/admin/stores/${storeId}/pages`,
            description: '編輯網站頁面',
            color: 'text-purple-500',
        },
        {
            icon: Menu,
            label: '導覽目錄',
            href: `/admin/stores/${storeId}/navigation`,
            description: '管理選單順序',
            color: 'text-cyan-500',
        },
        {
            icon: Settings,
            label: '商店設定',
            href: `/admin/stores/${storeId}/settings`,
            description: '基本設定與配置',
            color: 'text-muted-foreground',
        },
    ]

    // 取得設定的首頁
    const { data: homepage } = await supabase
        .from('pages')
        .select('slug')
        .eq('tenant_id', storeId)
        .eq('is_homepage', true)
        .eq('published', true)
        .maybeSingle()

    const homeUrl = homepage?.slug
        ? `/store/${store.slug}/${homepage.slug}`
        : `/store/${store.slug}`

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/admin/stores"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        返回商店列表
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white border border-border shadow-sm">
                            {store.logo_url ? (
                                <img src={store.logo_url} alt="" className="h-8 w-8 rounded object-cover" />
                            ) : (
                                <Store className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{store.name}</h1>
                            <p className="text-muted-foreground">/store/{store.slug}</p>
                        </div>
                    </div>
                </div>
                <Link href={homeUrl} target="_blank">
                    <Button variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        造訪商店
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">商品數量</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{productCount || 0}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">總訂單</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{orderCount || 0}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">待處理訂單</p>
                    <p className="text-3xl font-bold text-amber-500 mt-1">{pendingOrderCount || 0}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">總營收</p>
                    <p className="text-3xl font-bold text-emerald-500 mt-1">
                        NT$ {totalRevenue.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all group shadow-sm"
                    >
                        <action.icon className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform`} />
                        <p className="font-medium text-foreground mt-3">{action.label}</p>
                        <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    </Link>
                ))}
            </div>

            {/* Owner Account Management */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <UserCircle className="h-5 w-5 text-blue-500" />
                    <h2 className="font-semibold text-foreground">商店擁有者帳號</h2>
                </div>
                <OwnerAccountManager storeId={storeId} hasOwner={!!store.owner_id} />
            </div>

            {/* Store Info */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-semibold text-foreground mb-4">商店資訊</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-muted-foreground">商店 ID</p>
                        <p className="text-foreground font-mono text-sm">{store.id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">建立時間</p>
                        <p className="text-foreground">
                            {store.created_at ? new Date(store.created_at).toLocaleDateString('zh-TW', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            }) : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">訂閱方案</p>
                        <p className="text-foreground">{store.subscription_tier || 'Free'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">商店描述</p>
                        <p className="text-foreground">{store.description || '尚未設定'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

