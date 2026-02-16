import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StoreSettingsClient } from './store-settings-client'
import { getAllPlans, getBillingHistory } from '@/features/billing/actions'

interface Props {
    params: Promise<{ storeId: string }>
}

export default async function StoreSettingsPage({ params }: Props) {
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

    // 獲取方案與帳單資料
    const [plans, billingHistory] = await Promise.all([
        getAllPlans(),
        getBillingHistory(storeId)
    ])

    // 商店網址
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'omoselect.shop'
    const storeUrl = `https://${store.slug}.${rootDomain}`

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href={`/admin/stores/${storeId}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    返回 {store.name}
                </Link>
                <h1 className="text-2xl font-bold text-foreground">商店設定</h1>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
                <div className="space-y-2">
                    <Label className="text-foreground">商店名稱</Label>
                    <Input
                        defaultValue={store.name}
                        className="max-w-md bg-muted text-foreground"
                        disabled
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-foreground">網址代號</Label>
                    <div className="flex items-center gap-2 max-w-lg">
                        <Input
                            value={storeUrl}
                            className="bg-muted text-foreground flex-1"
                            readOnly
                        />
                        <a
                            href={storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                    <p className="text-xs text-muted-foreground">這是您商店的公開網址</p>
                </div>

                {/* 會員制度設定入口 */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Link href={`/admin/stores/${storeId}/settings/members`} className="w-full">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors shadow-sm cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">會員制度設定</h3>
                                    <p className="text-xs text-muted-foreground">設定會員等級、點數回饋與折抵規則</p>
                                </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </Link>
                </div>

                {/* 可編輯設定 */}
                <StoreSettingsClient
                    storeId={store.id}
                    storeName={store.name}
                    currentPlanId={store.plan_id || 'free'}
                    currentStatus={store.subscription_status || 'active'}
                    currentNextBillingAt={store.next_billing_at}
                    dbPlans={plans}
                    billingHistory={billingHistory as any}
                />
            </div>
        </div>
    )
}

