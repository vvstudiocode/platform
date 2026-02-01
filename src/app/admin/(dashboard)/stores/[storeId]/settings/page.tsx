import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
        .eq('managed_by', user?.id)
        .single()

    if (!store) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href={`/admin/stores/${storeId}`}
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    返回 {store.name}
                </Link>
                <h1 className="text-2xl font-bold text-white">商店設定</h1>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-6">
                <div className="space-y-2">
                    <Label className="text-zinc-300">商店名稱</Label>
                    <Input
                        defaultValue={store.name}
                        className="bg-zinc-800 border-zinc-700 text-white max-w-md"
                        disabled
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-300">網址代號</Label>
                    <div className="flex items-center gap-2 max-w-md">
                        <span className="text-zinc-500 text-sm">https://</span>
                        <Input
                            defaultValue={store.slug}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            disabled
                        />
                        <span className="text-zinc-500 text-sm">.yourdomain.com</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-300">訂閱方案</Label>
                    <Input
                        defaultValue={store.subscription_tier || 'Free'}
                        className="bg-zinc-800 border-zinc-700 text-white max-w-md"
                        disabled
                    />
                </div>

                <div className="pt-4 border-t border-zinc-800">
                    <Button className="bg-white text-black hover:bg-zinc-200" disabled>
                        儲存變更（即將推出）
                    </Button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6">
                <h3 className="text-lg font-medium text-red-400">危險區域</h3>
                <p className="text-sm text-zinc-400 mt-1 mb-4">
                    刪除商店將永久移除所有相關資料，此操作無法復原
                </p>
                <Button variant="outline" className="border-red-900 text-red-400 hover:bg-red-950" disabled>
                    刪除商店（即將推出）
                </Button>
            </div>
        </div>
    )
}
