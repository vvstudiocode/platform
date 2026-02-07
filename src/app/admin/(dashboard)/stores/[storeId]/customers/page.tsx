import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'

interface Props {
    params: Promise<{ storeId: string }>
}

export default async function StoreCustomersPage({ params }: Props) {
    const { storeId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: store } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('id', storeId)
        .eq('managed_by', user?.id || '')
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
                <h1 className="text-2xl font-bold text-white">客戶管理</h1>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="text-lg font-medium text-white">客戶管理功能開發中</h3>
                <p className="text-zinc-400 mt-1">此功能即將推出</p>
            </div>
        </div>
    )
}
