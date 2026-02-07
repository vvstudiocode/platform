import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

interface ActivityItem {
    id: string
    title: string
    subtitle: string
    value?: string
    status?: {
        label: string
        color: string
    }
    href?: string
}

interface Props {
    title: string
    viewAllHref?: string
    items: ActivityItem[]
    emptyMessage?: string
    type: 'orders' | 'stores' // 根據類型微調樣式
}

export function RecentActivity({ title, viewAllHref, items, emptyMessage = "尚無資料", type }: Props) {
    return (
        <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
                <h2 className="font-serif font-semibold text-foreground">{title}</h2>
                {viewAllHref && (
                    <Link href={viewAllHref} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group">
                        查看全部 <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                )}
            </div>
            <div className="divide-y divide-border flex-1">
                {items && items.length > 0 ? (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors group"
                        >
                            {item.href ? (
                                <Link href={item.href} className="flex-1 flex items-center justify-between">
                                    <ItemContent item={item} />
                                    <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all ml-4" />
                                </Link>
                            ) : (
                                <div className="flex-1 flex items-center justify-between">
                                    <ItemContent item={item} />
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="px-6 py-12 text-center text-muted-foreground bg-muted/5">
                        <p>{emptyMessage}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function ItemContent({ item }: { item: ActivityItem }) {
    return (
        <div className="flex items-center justify-between w-full">
            <div>
                <p className="font-medium text-foreground text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
            </div>
            <div className="text-right">
                {item.value && (
                    <p className="text-sm font-medium text-foreground font-mono">{item.value}</p>
                )}
                {item.status && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${item.status.color}`}>
                        {item.status.label}
                    </span>
                )}
            </div>
        </div>
    )
}
