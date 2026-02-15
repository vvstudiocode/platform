'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Crown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MemberLevelForm } from './member-level-form'
import { MemberPointsSettings } from './member-points-settings'
import { MembersTable } from './members-table'

interface Props {
    params: {
        storeId: string
    }
}

export default function MemberSettingsPage({ params }: Props) {
    const { storeId } = params
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'list' | 'levels'>('list')

    // Data state
    const [levels, setLevels] = useState<any[]>([])
    const [storeSettings, setStoreSettings] = useState<any>({})

    // Plan check
    const [isGrowthPlan, setIsGrowthPlan] = useState(false)
    const [planLoading, setPlanLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [storeId])

    const fetchData = async () => {
        try {
            // 1. Check Store Plan
            const { data: store, error: storeError } = await supabase
                .from('tenants')
                .select('name, plan_id, subscription_status, settings')
                .eq('id', storeId)
                .single()

            if (storeError) throw storeError

            const validPlans = ['growth', 'scale', 'enterprise']
            if (store.plan_id && validPlans.includes(store.plan_id)) {
                setIsGrowthPlan(true)
                setStoreSettings(store.settings || {})
            } else {
                setIsGrowthPlan(false)
                setPlanLoading(false)
                return
            }

            // 2. Fetch Levels
            const { data: levelsData, error: levelsError } = await supabase
                .from('member_levels')
                .select('*')
                .eq('tenant_id', storeId)
                .order('min_spend', { ascending: true })

            if (levelsError) throw levelsError

            if (levelsData && levelsData.length > 0) {
                setLevels(levelsData.map(l => ({
                    id: l.id,
                    name: l.name,
                    min_spend: l.min_spend,
                    discount_type: l.discount_type || 'none',
                    discount_value: l.discount_value,
                    point_rate: l.point_earn_rate,
                    is_default: l.is_default,
                    tenant_id: l.tenant_id
                })))
            } else {
                const defaultLevels = [
                    { id: crypto.randomUUID(), name: '一般會員', min_spend: 0, discount_type: 'none', discount_value: 0, point_rate: 1.0, is_default: true, tenant_id: storeId },
                    { id: crypto.randomUUID(), name: '黃金會員', min_spend: 10000, discount_type: 'percent', discount_value: 5, point_rate: 1.2, is_default: false, tenant_id: storeId },
                    { id: crypto.randomUUID(), name: '鑽石會員', min_spend: 30000, discount_type: 'percent', discount_value: 10, point_rate: 1.5, is_default: false, tenant_id: storeId },
                ]
                setLevels(defaultLevels)
            }

        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setPlanLoading(false)
            setLoading(false)
        }
    }

    if (planLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
    }

    if (!isGrowthPlan) {
        return (
            <div className="space-y-6">
                <div>
                    <Link
                        href={`/admin/stores/${storeId}/settings`}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        返回設定
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">會員制度設定</h1>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-12 text-center shadow-sm">
                    <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                        <Crown className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-900 mb-2">進階會員功能</h3>
                    <p className="text-amber-700 max-w-md mx-auto mb-8">
                        此功能僅開放給 <span className="font-bold">成長方案 (Growth)</span> 及以上等級的商店使用。
                        升級方案即可啟用會員分級、點數回饋等強大功能，提升顧客忠誠度。
                    </p>
                    <Link href={`/admin/stores/${storeId}/settings`}>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                            前往升級方案
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href={`/admin/stores/${storeId}/settings`}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        返回設定
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">會員管理</h1>
                </div>
            </div>

            <div className="w-full">
                <div className="border-b flex gap-6 mb-6">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`pb-2 border-b-2 transition-colors ${activeTab === 'list' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        會員名單
                    </button>
                    <button
                        onClick={() => setActiveTab('levels')}
                        className={`pb-2 border-b-2 transition-colors ${activeTab === 'levels' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        等級設定
                    </button>
                </div>

                {activeTab === 'list' && (
                    <MembersTable storeId={storeId} />
                )}

                {activeTab === 'levels' && !loading && (
                    <MemberLevelForm
                        storeId={storeId}
                        initialLevels={levels}
                    />
                )}


            </div>
        </div>
    )
}
