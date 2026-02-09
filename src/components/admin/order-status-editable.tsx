import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, Clock, DollarSign, Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import { updateOrderStatus } from '@/app/admin/(dashboard)/orders/actions'

interface Props {
    orderId: string
    currentStatus: string
    storeId?: string
    isHQ?: boolean
    onUpdate?: () => void
}

const statusConfig: Record<string, { icon: any; label: string; color: string; badge: string }> = {
    pending: { icon: Clock, label: '待付款', color: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    paid: { icon: DollarSign, label: '已付款', color: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    processing: { icon: Package, label: '處理中', color: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    shipped: { icon: Truck, label: '已出貨', color: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    completed: { icon: CheckCircle, label: '已完成', color: 'text-green-400', badge: 'bg-green-500/10 text-green-500 border-green-500/20' },
    cancelled: { icon: XCircle, label: '已取消', color: 'text-red-400', badge: 'bg-red-500/10 text-red-500 border-red-500/20' },
}

const statusOptions = [
    { value: 'pending', label: '待付款' },
    { value: 'paid', label: '已付款' },
    { value: 'processing', label: '處理中' },
    { value: 'shipped', label: '已出貨' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
]

export function OrderStatusEditable({ orderId, currentStatus, storeId, isHQ, onUpdate }: Props) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(currentStatus)
    const router = useRouter()

    useEffect(() => {
        setStatus(currentStatus)
    }, [currentStatus])

    const config = statusConfig[status] || statusConfig.pending
    const StatusIcon = config.icon

    const handleUpdate = async (newStatus: string) => {
        if (newStatus === status) return
        setLoading(true)
        // Optimistic update
        const oldStatus = status
        setStatus(newStatus)

        try {
            const res = await updateOrderStatus(orderId, newStatus)
            if (res.error) {
                console.error(res.error)
                // alert(res.error) // Disable alert to avoid "crash" feel
                setStatus(oldStatus)
            } else {
                if (onUpdate) onUpdate()
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            setStatus(oldStatus)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                    <Badge variant="outline" className={`${config.badge} flex w-fit items-center gap-1.5 hover:bg-opacity-20 transition-all`}>
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <StatusIcon className="h-3 w-3" />}
                        {config.label}
                    </Badge>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[120px] bg-zinc-900 border-zinc-800">
                {statusOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer justify-between"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleUpdate(option.value)
                        }}
                    >
                        {option.label}
                        {status === option.value && <Check className="h-3 w-3 text-blue-500" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
