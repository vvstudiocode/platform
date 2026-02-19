import { getCurrentTenant } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Crown } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { MemberLevelForm } from '@/app/admin/(dashboard)/stores/[storeId]/settings/members/member-level-form'
import { MembersTable } from '@/app/admin/(dashboard)/stores/[storeId]/settings/members/members-table'

export default async function AdminMemberSettingsPage() {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) redirect('/admin/login')

    const supabase = await createClient()

    // 取得商店詳細資訊 (包含 plan_id)
    const { data: store } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenant.id)
        .single()

    if (!store) redirect('/admin/settings')

    // 檢查方案權限 (Growth 或 Enterprise)
    const isGrowthPlan = store.plan_id === 'growth' || store.plan_id === 'enterprise'

    if (!isGrowthPlan) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto py-8">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-foreground">會員制度</h1>
                    <p className="text-muted-foreground mt-1">管理會員名單、等級與積分回饋規則</p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-12 text-center shadow-sm">
                    <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                        <Crown className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-900 mb-2">進階會員功能</h3>
                    <p className="text-amber-700 max-w-md mx-auto mb-8">
                        此功能僅開放給 <span className="font-bold">成長方案 (Growth)</span> 及以上等級的商店使用。
                        升級方案即可啟用會員分級、點數回饋等強大功能。
                    </p>
                    <Link href="/admin/settings/billing">
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                            前往升級方案
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    // 獲取會員等級設定
    const { data: levels } = await supabase
        .from('member_levels')
        .select('*')
        .eq('tenant_id', store.id)
        .order('min_spend', { ascending: true })

    // 如果沒有設定，給預設值
    const defaultLevels = [
        { name: '一般會員', min_spend: 0, discount_type: 'none', discount_value: 0, point_rate: 1 },
        { name: '黃金會員', min_spend: 10000, discount_type: 'percent', discount_value: 5, point_rate: 1.5 },
        { name: '鑽石會員', min_spend: 50000, discount_type: 'percent', discount_value: 10, point_rate: 2 },
    ]

    const levelsData = levels && levels.length > 0 ? levels : defaultLevels

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-foreground">會員制度</h1>
                    <p className="text-muted-foreground mt-1">管理總部商店的會員名單與等級制度</p>
                </div>
            </div>

            <Tabs defaultValue="list" className="w-full">
                <TabsList>
                    <TabsTrigger value="list">會員名單</TabsTrigger>
                    <TabsTrigger value="levels">會員等級</TabsTrigger>
                    <TabsTrigger value="points">點數規則</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4 mt-4">
                    <MembersTable storeId={store.id} />
                </TabsContent>

                <TabsContent value="levels" className="space-y-4 mt-4">
                    <MemberLevelForm
                        storeId={store.id}
                        initialLevels={levelsData.map((l, index) => ({
                            id: 'id' in l ? l.id : `temp-default-${index}`,
                            name: l.name,
                            min_spend: l.min_spend,
                            discount_type: (l.discount_type as "none" | "percent" | "fixed") || 'none',
                            discount_value: l.discount_value || 0,
                            point_rate: (l as any).point_rate || (l as any).point_earn_rate || 1
                        }))}
                    />
                </TabsContent>

                <TabsContent value="points" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>點數規則</CardTitle>
                            <CardDescription>設定點數累積與折抵規則 (此功能開發中)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-8 text-center text-muted-foreground">
                                功能即將推出
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
