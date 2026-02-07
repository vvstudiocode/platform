'use client'

import Link from 'next/link'
import { Home, Globe, Edit, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/ui/delete-button'

interface Page {
    id: string
    title: string
    slug: string
    is_homepage: boolean | null
    published: boolean | null
    updated_at: string | null
}

interface Props {
    pages: Page[]
    basePath: string // '/admin/pages' or '/app/pages'
    storeSlug?: string // needed for viewing live page
    deleteAction: (id: string) => Promise<{ error?: string; success?: boolean }>
}

export function PageList({ pages, basePath, storeSlug, deleteAction }: Props) {
    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="border-b border-border bg-muted/40">
                            <th className="text-left px-6 py-4 text-xs font-serif font-semibold text-muted-foreground uppercase tracking-wider">頁面標題</th>
                            <th className="text-left px-6 py-4 text-xs font-serif font-semibold text-muted-foreground uppercase tracking-wider">網址</th>
                            <th className="text-left px-6 py-4 text-xs font-serif font-semibold text-muted-foreground uppercase tracking-wider">狀態</th>
                            <th className="text-left px-6 py-4 text-xs font-serif font-semibold text-muted-foreground uppercase tracking-wider">更新時間</th>
                            <th className="text-right px-6 py-4 text-xs font-serif font-semibold text-muted-foreground uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {pages && pages.length > 0 ? (
                            pages.map((page) => (
                                <tr key={page.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {page.is_homepage ? (
                                                <div className="p-1.5 bg-sky-50 rounded text-sky-600" title="首頁">
                                                    <Home className="h-3.5 w-3.5" />
                                                </div>
                                            ) : (
                                                <div className="p-1.5 bg-muted rounded text-muted-foreground">
                                                    <FileText className="h-3.5 w-3.5" />
                                                </div>
                                            )}
                                            <span className="text-foreground font-medium text-sm">{page.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-muted-foreground font-mono text-xs">/{page.slug}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${page.published
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-muted text-muted-foreground border-border'
                                            }`}>
                                            {page.published ? '已發布' : '草稿'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-muted-foreground text-xs">
                                            {page.updated_at ? new Date(page.updated_at).toLocaleDateString('zh-TW') : '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {(page.published && storeSlug) && (
                                                <Link
                                                    href={page.is_homepage ? `/store/${storeSlug}` : `/store/${storeSlug}/${page.slug}`}
                                                    target="_blank"
                                                >
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                        <Globe className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            )}
                                            <Link href={`${basePath}/${page.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {!page.is_homepage && (
                                                <DeleteButton
                                                    itemId={page.id}
                                                    itemName={page.title}
                                                    onDelete={deleteAction}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground bg-muted/5">
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
    )
}
