'use client'

import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageList } from './components/page-list'

export interface Page {
    id: string
    title: string
    slug: string
    is_homepage: boolean | null
    published: boolean | null
    updated_at: string | null
}

interface PagesPageProps {
    pages: Page[]
    basePath: string // '/admin/pages' or '/app/pages'
    storeSlug: string
    deleteAction: (id: string) => Promise<{ error?: string; success?: boolean }>
    emptyState?: {
        message: string
        actionLabel: string
        actionHref: string
    }
}

export function PagesPage({
    pages,
    basePath,
    storeSlug,
    deleteAction,
    emptyState,
}: PagesPageProps) {
    // 如果沒有頁面也沒有商店，顯示空狀態
    if (emptyState && pages.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-serif font-bold text-foreground">頁面管理</h1>
                <div className="bg-card rounded-xl border border-border p-12 text-center shadow-soft">
                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-6">{emptyState.message}</p>
                    <Link href={emptyState.actionHref}>
                        <Button className="shadow-soft">{emptyState.actionLabel}</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-foreground">頁面管理</h1>
                <Link href={`${basePath}/new`}>
                    <Button className="gap-2 shadow-soft">
                        <Plus className="h-4 w-4" />
                        新增頁面
                    </Button>
                </Link>
            </div>

            <PageList
                pages={pages}
                basePath={basePath}
                storeSlug={storeSlug}
                deleteAction={deleteAction}
            />
        </div>
    )
}
