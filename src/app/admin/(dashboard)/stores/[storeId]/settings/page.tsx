import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StoreSettingsClient } from './store-settings-client'

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

    // 商店網址
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'omoselect.shop'
    const storeUrl = `https://${store.slug}.${rootDomain}`

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
                    <div className="flex items-center gap-2 max-w-lg">
                        <Input
                            value={storeUrl}
                            className="bg-zinc-800 border-zinc-700 text-white flex-1"
                            readOnly
                        />
                        <a
                            href={storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                    <p className="text-xs text-zinc-500">這是您商店的公開網址</p>
                </div>

                {/* 可編輯設定 */}
                <StoreSettingsClient
                    storeId={store.id}
                    storeName={store.name}
                    currentTier={store.subscription_tier || 'free'}
                />
            </div>
        </div>
    )
}

