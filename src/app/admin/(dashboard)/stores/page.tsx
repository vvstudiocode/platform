import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Store, ExternalLink, Settings } from 'lucide-react'

export default async function StoresPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: stores } = await supabase
        .from('tenants')
        .select('*')
        .eq('managed_by', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">商店管理</h1>
                    <p className="text-zinc-400 mt-1">管理您旗下的所有網路商店</p>
                </div>
                <Link href="/admin/stores/new">
                    <Button className="bg-white text-black hover:bg-zinc-200 flex items-center gap-2">
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
                            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-zinc-800">
                                        <Store className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{store.name}</h3>
                                        <p className="text-zinc-500 text-sm">{store.slug}.yourdomain.com</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-2">
                                <Link href={`/admin/stores/${store.id}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:text-white">
                                        <Settings className="h-4 w-4 mr-2" />
                                        管理
                                    </Button>
                                </Link>
                                <a
                                    href={`https://${store.slug}.yourdomain.com`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                        <Store className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">尚未建立任何商店</h3>
                    <p className="text-zinc-400 mt-1 mb-4">建立您的第一家網路商店開始營業</p>
                    <Link href="/admin/stores/new">
                        <Button className="bg-white text-black hover:bg-zinc-200 flex items-center gap-2 mx-auto">
                            <Plus className="h-4 w-4" />
                            建立第一家商店
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
