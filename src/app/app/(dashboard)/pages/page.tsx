import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Edit, Globe, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppPageDeleteButton } from './page-delete-button'

async function getUserStore(supabase: any, userId: string) {
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id, tenants:tenant_id(id, slug)')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()
    return data?.tenants as any
}

export default async function AppPagesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/app/login')

    const store = await getUserStore(supabase, user.id)
    if (!store) redirect('/app/onboarding')

    const { data: pages } = await supabase
        .from('pages')
        .select('*')
        .eq('tenant_id', store.id)
        .order('is_homepage', { ascending: false })
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">頁面管理</h1>
                <Link href="/app/pages/new">
                    <Button className="gap-2 shadow-soft">
                        <Plus className="h-4 w-4" />
                        新增頁面
                    </Button>
                </Link>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">頁面標題</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">網址</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">狀態</th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages && pages.length > 0 ? (
                                pages.map((page) => (
                                    <tr key={page.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                        <td className="px-3 md:px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {page.is_homepage && (
                                                    <Home className="h-4 w-4 text-sky-500" />
                                                )}
                                                <span className="text-foreground font-medium text-xs md:text-sm">{page.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-4">
                                            <span className="text-muted-foreground font-mono text-xs md:text-sm">/{page.slug}</span>
                                        </td>
                                        <td className="px-3 md:px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${page.published
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-muted text-muted-foreground border-border'
                                                }`}>
                                                {page.published ? '已發布' : '草稿'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={page.is_homepage
                                                        ? `/store/${store.slug}`
                                                        : `/store/${store.slug}/${page.slug}`
                                                    }
                                                    target="_blank"
                                                >
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                        <Globe className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/app/pages/${page.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <AppPageDeleteButton pageId={page.id} pageName={page.title} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="h-8 w-8 opacity-20" />
                                            <p>尚無頁面</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
