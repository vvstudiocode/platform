'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteStore, updateStoreSettings } from './actions'

interface Props {
    storeId: string
    storeName: string
    currentTier: string
}

const subscriptionTiers = [
    { value: 'free', label: '免費方案', description: '基本功能' },
    { value: 'basic', label: '基礎方案', description: '進階功能' },
    { value: 'pro', label: '專業方案', description: '完整功能' },
    { value: 'enterprise', label: '企業方案', description: '客製化' },
]

export function StoreSettingsClient({ storeId, storeName, currentTier }: Props) {
    const [isPending, startTransition] = useTransition()
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedTier, setSelectedTier] = useState(currentTier || 'free')
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSave = () => {
        startTransition(async () => {
            const formData = new FormData()
            formData.set('subscription_tier', selectedTier)
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
            {/* 訂閱方案 */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">訂閱方案</label>
                    <select
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(e.target.value)}
                        className="w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {subscriptionTiers.map((tier) => (
                            <option key={tier.value} value={tier.value}>
                                {tier.label} - {tier.description}
                            </option>
                        ))}
                    </select>
                </div>

                {message && (
                    <div className={`text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-white text-black hover:bg-zinc-200"
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

            {/* 危險區域 */}
            <div className="pt-6 border-t border-zinc-800">
                <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6">
                    <h3 className="text-lg font-medium text-red-400">危險區域</h3>
                    <p className="text-sm text-zinc-400 mt-1 mb-4">
                        刪除商店將永久移除所有相關資料（商品、訂單、頁面等），此操作無法復原
                    </p>
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="border-red-900 text-red-400 hover:bg-red-950"
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
