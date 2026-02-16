'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2, Calendar, History, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { deleteStore, updateStoreSettings } from './actions'

interface Plan {
    id: string
    name: string
    price_monthly: number
    storage_limit_mb: number
    transaction_fee_percent: number
}

interface BillingTransaction {
    id: string
    tenant_id: string
    transaction_type: string
    amount: number
    fee_amount: number
    provider: string
    provider_transaction_id: string | null
    order_id: string | null
    occurred_at: string | null
    description: string | null
}

interface Props {
    storeId: string
    storeName: string
    currentPlanId: string
    currentStatus: string
    currentNextBillingAt: string | null
    dbPlans: Plan[]
    billingHistory: BillingTransaction[]
}

const statuses = [
    { value: 'active', label: '啟用中 (Active)' },
    { value: 'past_due', label: '逾期 (Past Due)' },
    { value: 'canceled', label: '已取消 (Canceled)' },
    { value: 'trialing', label: '試用中 (Trialing)' },
]

export function StoreSettingsClient({
    storeId,
    storeName,
    currentPlanId,
    currentStatus,
    currentNextBillingAt,
    dbPlans,
    billingHistory,
}: Props) {
    const [isPending, startTransition] = useTransition()
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId)
    const [selectedStatus, setSelectedStatus] = useState(currentStatus)
    const [nextBillingDate, setNextBillingDate] = useState(
        currentNextBillingAt ? new Date(currentNextBillingAt).toISOString().split('T')[0] : ''
    )
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // --- Auto-billing states ---
    const [generateBilling, setGenerateBilling] = useState(true)
    const [billingAmount, setBillingAmount] = useState<string>('')
    const [billingDescription, setBillingDescription] = useState<string>('')

    // Derive plan info
    const selectedPlan = dbPlans.find(p => p.id === selectedPlanId)
    const currentPlan = dbPlans.find(p => p.id === currentPlanId)
    const isPlanChanged = selectedPlanId !== currentPlanId
    const isUpgradeToPaid = isPlanChanged && selectedPlan && selectedPlan.price_monthly > 0

    // When plan selection changes, auto-fill the billing amount
    const handlePlanChange = (newPlanId: string) => {
        setSelectedPlanId(newPlanId)
        const plan = dbPlans.find(p => p.id === newPlanId)
        if (plan && plan.price_monthly > 0) {
            setBillingAmount(String(plan.price_monthly))
            setBillingDescription(`[後台升級] ${plan.name} (月費)`)
            setGenerateBilling(true)
        } else {
            setBillingAmount('')
            setBillingDescription('')
            setGenerateBilling(false)
        }
    }

    const handleSave = () => {
        startTransition(async () => {
            const formData = new FormData()
            formData.set('plan_id', selectedPlanId)
            formData.set('subscription_status', selectedStatus)
            if (nextBillingDate) {
                formData.set('next_billing_at', nextBillingDate)
            }

            // Auto-billing fields
            if (isUpgradeToPaid && generateBilling) {
                formData.set('generate_billing', 'true')
                formData.set('billing_amount', billingAmount || String(selectedPlan?.price_monthly || 0))
                formData.set('billing_description', billingDescription || `[後台升級] ${selectedPlan?.name} (月費)`)
            }

            const result = await updateStoreSettings(storeId, formData)
            if (result.error) {
                setMessage({ type: 'error', text: result.error })
            } else {
                setMessage({ type: 'success', text: result.billingCreated ? '設定已儲存，帳單紀錄已建立 ✅' : '設定已儲存' })
                setTimeout(() => setMessage(null), 5000)
            }
        })
    }

    const handleDelete = () => {
        if (!confirm(`確定要刪除「${storeName}」嗎？此操作無法復原，所有相關資料都會被永久刪除。`)) {
            return
        }

        setIsDeleting(true)
        startTransition(async () => {
            const result = await deleteStore(storeId)
            if (result?.error) {
                setMessage({ type: 'error', text: result.error })
                setIsDeleting(false)
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* 訂閱與狀態設定 */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 方案選擇 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">訂閱方案</label>
                        <select
                            value={selectedPlanId}
                            onChange={(e) => handlePlanChange(e.target.value)}
                            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {dbPlans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name} - NT$ {plan.price_monthly}/月
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 狀態選擇 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">訂閱狀態</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {statuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 到期日選擇 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">下次扣款/到期日</label>
                        <div className="relative">
                            <Input
                                type="date"
                                value={nextBillingDate}
                                onChange={(e) => setNextBillingDate(e.target.value)}
                                className="w-full pl-10"
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            留空表示無到期日（永久或是手動管理）
                        </p>
                    </div>
                </div>

                {/* === 自動建立帳單紀錄區塊 === */}
                {isUpgradeToPaid && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-emerald-600" />
                            <h4 className="font-medium text-emerald-800">自動建立帳單紀錄</h4>
                        </div>
                        <p className="text-sm text-emerald-700">
                            升級為 <strong>{selectedPlan?.name}</strong> 方案，是否同時建立帳單紀錄？
                        </p>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={generateBilling}
                                onChange={(e) => setGenerateBilling(e.target.checked)}
                                className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-emerald-800 font-medium">建立帳單紀錄</span>
                        </label>

                        {generateBilling && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-emerald-700">金額 (NT$)</label>
                                    <Input
                                        type="number"
                                        value={billingAmount}
                                        onChange={(e) => setBillingAmount(e.target.value)}
                                        placeholder={String(selectedPlan?.price_monthly || 0)}
                                        className="bg-white border-emerald-200"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-emerald-700">備註</label>
                                    <Input
                                        value={billingDescription}
                                        onChange={(e) => setBillingDescription(e.target.value)}
                                        placeholder={`[後台升級] ${selectedPlan?.name} (月費)`}
                                        className="bg-white border-emerald-200"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {message && (
                    <div className={`text-sm px-3 py-2 rounded-lg ${message.type === 'success' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-red-600 bg-red-50 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <div className="pt-2">
                    <Button
                        onClick={handleSave}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                儲存中...
                            </>
                        ) : (
                            '儲存變更'
                        )}
                    </Button>
                </div>
            </div>

            {/* === 帳單紀錄 === */}
            <div className="pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">帳單紀錄</h3>
                </div>
                {billingHistory.length > 0 ? (
                    <div className="relative overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-sm text-left text-muted-foreground">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 font-medium">日期</th>
                                    <th className="px-4 py-3 font-medium">項目</th>
                                    <th className="px-4 py-3 font-medium">金額</th>
                                    <th className="px-4 py-3 font-medium">來源</th>
                                    <th className="px-4 py-3 font-medium">狀態</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {billingHistory.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                                            {tx.occurred_at ? new Date(tx.occurred_at).toLocaleDateString('zh-TW') : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {tx.description || (tx.transaction_type === 'subscription_charge' ? '訂閱費' : tx.transaction_type)}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-foreground">NT$ {tx.amount}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className={
                                                tx.provider === 'admin_manual'
                                                    ? 'border-blue-500/30 text-blue-600 bg-blue-500/10'
                                                    : 'border-neutral-300 text-neutral-600 bg-neutral-100'
                                            }>
                                                {tx.provider === 'admin_manual' ? '後台' : tx.provider === 'ecpay' ? 'ECPay' : tx.provider}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                                                成功
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8 bg-muted/30 rounded-xl border border-border">
                        尚無帳單紀錄
                    </p>
                )}
            </div>

            {/* 危險區域 */}
            <div className="pt-6 border-t border-border">
                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <h3 className="text-lg font-medium text-red-600">危險區域</h3>
                    <p className="text-sm text-red-600/80 mt-1 mb-4">
                        刪除商店將永久移除所有相關資料（商品、訂單、頁面等），此操作無法復原
                    </p>
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                刪除中...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                刪除商店
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
