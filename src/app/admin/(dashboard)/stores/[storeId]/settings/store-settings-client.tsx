'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteStore, updateStoreSettings } from './actions'

interface Props {
    storeId: string
    storeName: string
    currentPlanId: string
    currentStatus: string
    currentNextBillingAt: string | null
}

const plans = [
    { value: 'free', label: '免費體驗', description: '基本功能' },
    { value: 'starter', label: '起步方案', description: '進階功能' },
    { value: 'growth', label: '成長方案', description: '完整功能' },
    { value: 'scale', label: '企業方案', description: '客製化' },
]

const statuses = [
    { value: 'active', label: '啟用中 (Active)' },
    { value: 'past_due', label: '逾期 (Past Due)' },
    { value: 'canceled', label: '已取消 (Canceled)' },
    { value: 'trialing', label: '試用中 (Trialing)' },
]

export function StoreSettingsClient({ storeId, storeName, currentPlanId, currentStatus, currentNextBillingAt }: Props) {
    const [isPending, startTransition] = useTransition()
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId)
    const [selectedStatus, setSelectedStatus] = useState(currentStatus)
    // Format initial date to YYYY-MM-DD for input[type="date"]
    const [nextBillingDate, setNextBillingDate] = useState(
        currentNextBillingAt ? new Date(currentNextBillingAt).toISOString().split('T')[0] : ''
    )
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSave = () => {
        startTransition(async () => {
            const formData = new FormData()
            formData.set('plan_id', selectedPlanId)
            formData.set('subscription_status', selectedStatus)
            if (nextBillingDate) {
                formData.set('next_billing_at', nextBillingDate)
            }
            // If empty, it will be handled as null in action

            const result = await updateStoreSettings(storeId, formData)
            if (result.error) {
                setMessage({ type: 'error', text: result.error })
            } else {
                setMessage({ type: 'success', text: '設定已儲存' })
                setTimeout(() => setMessage(null), 3000)
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
            // redirect 會在 action 中處理
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
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {plans.map((plan) => (
                                <option key={plan.value} value={plan.value}>
                                    {plan.label} - {plan.description}
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

                {message && (
                    <div className={`text-sm ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
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
