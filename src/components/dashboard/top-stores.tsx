"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TopStoresProps {
    data: {
        name: string
        slug: string
        revenue: number
        orders: number
    }[]
}

export function TopStores({ data }: TopStoresProps) {
    if (!data || data.length === 0) {
        return <div className="text-muted-foreground text-sm py-8 text-center">尚無資料</div>
    }

    const maxRevenue = Math.max(...data.map(d => d.revenue))

    return (
        <div className="space-y-6">
            {data.map((store, index) => (
                <div key={store.slug} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex bg-primary/10 items-center justify-center w-9 h-9 rounded-full font-bold text-primary text-sm">
                            {index + 1}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{store.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {store.slug}.yourdomain.com
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium">NT$ {store.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{store.orders} 筆訂單</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
