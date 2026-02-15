import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Store, ExternalLink, Settings, CreditCard, Calendar } from 'lucide-react'

export default async function StoresPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: stores } = await supabase
        .from('tenants')
        .select('*')
        .eq('managed_by', user?.id || '')
        .order('created_at', { ascending: false })

    const planLabels: Record<string, string> = {
        free: '免費體驗',
        starter: '起步方案',
        growth: '成長方案',
        scale: '企業方案',
    }

    const statusColors: Record<string, string> = {
        active: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
        trialing: 'bg-blue-500/10 text-blue-600 border-blue-200',
        past_due: 'bg-amber-500/10 text-amber-600 border-amber-200',
        canceled: 'bg-red-500/10 text-red-600 border-red-200',
    }

    const statusLabels: Record<string, string> = {
        active: '啟用中',
        trialing: '試用中',
        past_due: '逾期',
        canceled: '已取消',
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">商店管理</h1>
                    <p className="text-muted-foreground mt-1">管理您旗下的所有網路商店</p>
                </div>
                <Link href="/admin/stores/new">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        新增商店
                    </Button>
                </Link>
            </div>

            {stores && stores.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {stores.map((store) => (
                        <div
                            key={store.id}
                            className="rounded-xl border border-border bg-card p-6 hover:border-accent/50 transition-colors shadow-soft flex flex-col justify-between h-full"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <Store className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif font-semibold text-foreground">{store.name}</h3>
                                            <p className="text-muted-foreground text-sm">/store/{store.slug}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColors[store.subscription_status || 'active'] || statusColors.active}`}>
                                        {statusLabels[store.subscription_status || 'active'] || '啟用中'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        <span>方案：{planLabels[store.plan_id || 'free'] || '免費體驗'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>
                                            到期日：
                                            {store.next_billing_at
                                                ? new Date(store.next_billing_at).toLocaleDateString('zh-TW')
                                                : '永久有效'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border flex gap-2">
                                <Link href={`/admin/stores/${store.id}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-muted">
                                        <Settings className="h-4 w-4 mr-2" />
                                        管理
                                    </Button>
                                </Link>
                                <a
                                    href={`/store/${store.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground hover:bg-muted">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card p-12 text-center shadow-soft">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Store className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-serif font-medium text-foreground">尚未建立任何商店</h3>
                    <p className="text-muted-foreground mt-1 mb-4">建立您的第一家網路商店開始營業</p>
                    <Link href="/admin/stores/new">
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 mx-auto">
                            <Plus className="h-4 w-4" />
                            建立第一家商店
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
