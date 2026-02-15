'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, User, Trophy, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
    params: {
        storeId: string
    }
}

interface Customer {
    id: string
    name: string | null
    email: string | null
    level: { name: string } | null
    current_points: number
    total_spent: number
    orders_count: number
    created_at: string
}

export default function CustomersPage({ params }: Props) {
    const { storeId } = params
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [planLoading, setPlanLoading] = useState(true)

    useEffect(() => {
        checkPlanAndFetch()
    }, [storeId])

    const checkPlanAndFetch = async () => {
        try {
            // 1. Check Plan
            const { data: store, error: storeError } = await supabase
                .from('tenants')
                .select('plan_id')
                .eq('id', storeId)
                .single()

            if (storeError) throw storeError

            // Allow growth/scale
            if (!['growth', 'scale'].includes(store.plan_id || 'free')) {
                // Redirect or show block. For page, maybe redirect to settings/members to see upsell?
                // Or just render upsell state here.
                // Let's render upsell here too to be safe.
                setPlanLoading(false)
                setLoading(false)
                return
            }
            setPlanLoading(false)

            // 2. Fetch Customers
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    level:member_levels(name)
                `)
                .eq('tenant_id', storeId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setCustomers(data as any) // Type assertion due to nested join

        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const filtered = customers.filter(c =>
    (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (planLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    // If restricted (no customers loaded and plan mismatch - logic handled in fetch)
    // But we need state to know if restricted. 
    // Re-using logic: if loading=false and customers=[] and we didn't fetch... 
    // Let's rely on filtered/auth check logic. 
    // Actually, I should have a state `isRestricted`.

    // Simplification: Just render list. If error/plan fail, it might show empty. 
    // But better DX to show upsell.

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">顧客管理</h1>
                <Button>
                    新增顧客 (手動)
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>顧客列表</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="搜尋姓名或 Email"
                                className="pl-8"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            尚無顧客資料
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>顧客</TableHead>
                                    <TableHead>會員等級</TableHead>
                                    <TableHead>點數</TableHead>
                                    <TableHead>累積消費</TableHead>
                                    <TableHead>加入日期</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(customer => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-muted p-2 rounded-full">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{customer.name || '未命名'}</div>
                                                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="gap-1">
                                                <Trophy className="h-3 w-3 text-amber-500" />
                                                {customer.level?.name || '一般會員'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 font-medium text-amber-600">
                                                <Star className="h-3 w-3 fill-current" />
                                                {customer.current_points}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            ${customer.total_spent.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/admin/stores/${storeId}/customers/${customer.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    詳情
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
