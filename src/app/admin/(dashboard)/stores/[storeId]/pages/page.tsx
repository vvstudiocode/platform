import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Plus, Edit, Eye, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    params: Promise<{ storeId: string }>
}

export default async function StorePagesPage({ params }: Props) {
    const { storeId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: store } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('id', storeId)
        .eq('managed_by', user?.id)
        .single()

    if (!store) {
        notFound()
    }

    const { data: pages } = await supabase
        .from('pages')
        .select('*')
        .eq('tenant_id', storeId)
        .order('is_homepage', { ascending: false })
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href={`/admin/stores/${storeId}`}
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        返回 {store.name}
                    </Link>
                    <h1 className="text-2xl font-bold text-white">頁面管理</h1>
                    <p className="text-zinc-400 text-sm mt-1">管理您的網站頁面與 Landing Page</p>
                </div>
                <Link href={`/admin/stores/${storeId}/pages/new`}>
                    <Button className="bg-white text-black hover:bg-zinc-200">
                        <Plus className="h-4 w-4 mr-2" />
                        新增頁面
                    </Button>
                </Link>
            </div>

            {/* Default Homepage Notice */}
            {!pages?.some(p => p.is_homepage) && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-center gap-3">
                    <Home className="h-5 w-5 text-blue-400" />
                    <div>
                        <p className="text-blue-400 font-medium">目前使用的是預設商品列表首頁</p>
                        <p className="text-blue-400/80 text-sm">
                            若要自訂首頁內容，請建立一個新頁面，並在編輯時勾選「設為首頁」。
                        </p>
                    </div>
                </div>
            )}

            {pages && pages.length > 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
                    {pages.map((page) => (
                        <div key={page.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-zinc-800">
                                    {page.is_homepage ? (
                                        <Home className="h-4 w-4 text-amber-400" />
                                    ) : (
                                        <FileText className="h-4 w-4 text-zinc-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-white flex items-center gap-2">
                                        {page.title}
                                        {page.is_homepage && (
                                            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">首頁</span>
                                        )}
                                    </p>
                                    <p className="text-sm text-zinc-500">/{page.slug}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${page.published
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-zinc-500/20 text-zinc-400'
                                    }`}>
                                    {page.published ? '已發佈' : '草稿'}
                                </span>
                                <Link href={`/admin/stores/${storeId}/pages/${page.id}`}>
                                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">尚未建立任何頁面</h3>
                    <p className="text-zinc-400 mt-1 mb-4">建立您的第一個網站頁面</p>
                    <Link href={`/admin/stores/${storeId}/pages/new`}>
                        <Button className="bg-white text-black hover:bg-zinc-200">
                            <Plus className="h-4 w-4 mr-2" />
                            新增頁面
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
