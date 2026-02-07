import { LucideIcon, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Props {
    title: string
    value: string | number
    icon: LucideIcon
    href?: string
    iconColor?: string
    bgColor?: string
    description?: string
}

export function StatCard({ title, value, icon: Icon, href, iconColor = "text-muted-foreground", bgColor = "bg-muted", description }: Props) {
    const Content = () => (
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all group h-full">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${bgColor}`}>
                    <Icon className={`h-5 w-5 ${iconColor} group-hover:scale-110 transition-transform`} />
                </div>
                {href && <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
            </div>
            <p className="text-3xl font-serif font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{title}</p>
            {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
        </div>
    )

    if (href) {
        return (
            <Link href={href}>
                <Content />
            </Link>
        )
    }

    return <Content />
}
