'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, User, Mail, Phone, Calendar, Star, History } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Customer {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    level_id: string | null
    level: { name: string } | null
    current_points: number
    total_spent: number
    orders_count: number
    created_at: string
    tags: string[]
}

export default function CustomerDetailPage() {
    const params = useParams()
    const storeId = params.storeId as string
    const id = params.id as string

    const supabase = createClient()
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) fetchData()
    }, [id])

    const fetchData = async () => {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    level:member_levels(name)
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setCustomer(data as any)

            // Fetch transactions (Removed)
            // const { data: tx, error: txError } = await supabase...
            // if (!txError) setTransactions(tx)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
    if (!customer) return <div className="p-8">找不到顧客</div>

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href={`/admin/stores/${storeId}/customers`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    返回列表
                </Link>
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-foreground">{customer.name || '未命名'}</h1>
                    <Badge variant="outline">{customer.level?.name || '一般會員'}</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>基本資料</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.email || '-'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.phone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(customer.created_at).toLocaleDateString()} 加入</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Status (Simplified, Removed Points) */}
                <Card>
                    <CardHeader>
                        <CardTitle>消費概況</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Removed Points Display */}
                        <div className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4 text-muted-foreground" />
                                <span>累積消費</span>
                            </div>
                            <span className="font-medium">${customer.total_spent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">累積訂單</span>
                            <span>{customer.orders_count} 筆</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions (Removed Points Adjustment) */}
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>快速操作</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {/* <Button variant="outline" className="w-full justify-start">調整點數</Button> */}
                        <Button variant="outline" className="w-full justify-start">變更等級</Button>
                        <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10">封鎖黑名單</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Card Removed */}
        </div>
    )
}
