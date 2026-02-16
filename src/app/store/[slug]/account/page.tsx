'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, User, Phone, MapPin, Mail, LogOut, Save, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface Customer {
    id: string
    name: string
    email: string
    phone: string | null
    address: string | null
    current_points: number
    level?: {
        name: string
    }
}

interface Order {
    id: string
    order_number: string
    status: string
    total: number
    items: Array<{ name: string; quantity: number }>
    created_at: string
}

const statusLabels: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    processing: '處理中',
    shipped: '已出貨',
    completed: '已完成',
    cancelled: '已取消',
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-emerald-100 text-emerald-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
}

export default function AccountPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [message, setMessage] = useState('')
    const [orderCount, setOrderCount] = useState(0)

    // Order Modal State
    const [orders, setOrders] = useState<Order[]>([])
    const [loadingOrders, setLoadingOrders] = useState(false)
    const [showOrdersModal, setShowOrdersModal] = useState(false)

    // Form State
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')

    useEffect(() => {
        fetchCustomer()
    }, [])

    useEffect(() => {
        if (showOrdersModal && customer) {
            fetchOrders()
        }
    }, [showOrdersModal])

    const fetchCustomer = async () => {
        let user, tenant

        try {
            const { data: authData } = await supabase.auth.getUser()
            user = authData.user

            if (!user) {
                router.push(`/store/${slug}`)
                return
            }

            const { data: tenantData } = await supabase.from('tenants').select('id').eq('slug', slug).single()
            tenant = tenantData

            if (!tenant) throw new Error('Store not found')

            const { data: customerData, error } = await supabase
                .from('customers')
                .select(`
                    id, name, email, phone, address, current_points,
                    level:member_levels!member_level_id(name)
                `)
                .eq('tenant_id', tenant.id)
                .eq('auth_user_id', user.id)
                .limit(1)
                .maybeSingle()

            if (error) throw error

            if (!customerData) {
                throw { code: 'PGRST116' }
            }

            setCustomer(customerData as any)
            setName(customerData.name || '')
            setPhone(customerData.phone || '')
            setAddress(customerData.address || '')

            // Fetch order count
            const { count } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', tenant.id)
                .eq('customer_id', customerData.id)

            setOrderCount(count || 0)

        } catch (error: any) {
            if (error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error)
            }

            if (error.code === 'PGRST116') {
                console.error('User is logged in but not a member of this store.')
                await supabase.auth.signOut()
                router.push(`/store/${slug}?error=non-member`)
                return
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchOrders = async () => {
        if (!customer) return
        setLoadingOrders(true)
        try {
            // Re-fetch tenant id if needed, but we used slug to get current page context?
            // Actually fetchCustomer scoped everything.
            // But we didn't save tenantId in state. Simple workaround:
            const { data: tenantData } = await supabase.from('tenants').select('id').eq('slug', slug).single()
            if (!tenantData) return

            const { data: ordersData, error } = await supabase
                .from('orders')
                .select('*')
                .eq('tenant_id', tenantData.id)
                .eq('customer_id', customer.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(ordersData as any[])
        } catch (err) {
            console.error('Error fetching orders:', err)
        } finally {
            setLoadingOrders(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!customer) return
        setSaving(true)
        setMessage('')

        try {
            const { error } = await supabase
                .from('customers')
                .update({
                    name,
                    phone,
                    address
                })
                .eq('id', customer.id)

            if (error) throw error

            setMessage('資料已更新')
            setTimeout(() => setMessage(''), 3000)
        } catch (error) {
            console.error('Update failed:', error)
            setMessage('更新失敗，請稍後再試')
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push(`/store/${slug}`)
        router.refresh()
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!customer) return null

    return (
        <div className="min-h-screen bg-neutral-50/50 pt-28 pb-12">
            <div className="container max-w-4xl mx-auto px-4">

                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-neutral-900">
                        {customer.name ? `你好，${customer.name}！` : '會員中心'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">管理你的個人資料、查看訂單。</p>
                </div>

                {/* Quick Action Cards (No Icons) */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                    {/* My Orders (Modal Trigger) */}
                    <Dialog open={showOrdersModal} onOpenChange={setShowOrdersModal}>
                        <Card
                            className="h-full border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                            onClick={() => setShowOrdersModal(true)}
                        >
                            <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
                                <span className="text-base font-medium text-neutral-900">我的訂單</span>
                                {orderCount > 0 ? (
                                    <span className="text-xs text-muted-foreground mt-1.5">{orderCount} 筆紀錄</span>
                                ) : (
                                    <span className="text-xs text-muted-foreground mt-1.5">尚無訂單</span>
                                )}
                            </CardContent>
                        </Card>

                        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>我的訂單</DialogTitle>
                                <DialogDescription>
                                    近期訂單紀錄
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex-1 pr-4 -mr-4 overflow-y-auto">
                                {loadingOrders ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        尚無訂單紀錄
                                    </div>
                                ) : (
                                    <div className="space-y-4 py-2">
                                        {orders.map((order) => (
                                            <div key={order.id} className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="font-mono font-medium text-neutral-900">
                                                            {order.order_number}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(order.created_at).toLocaleDateString('zh-TW')}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                        {statusLabels[order.status] || order.status}
                                                    </span>
                                                </div>
                                                <div className="border-t border-neutral-200/50 pt-3">
                                                    <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                                                        {order.items.map(item => `${item.name} × ${item.quantity}`).join('、')}
                                                    </p>
                                                    <div className="flex justify-end">
                                                        <p className="font-medium text-neutral-900">
                                                            NT$ {Number(order.total).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Go Shopping */}
                    <Link href={`/store/${slug}`} className="group">
                        <Card className="h-full border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                            <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
                                <span className="text-base font-medium text-neutral-900">回首頁逛逛</span>
                                <span className="text-xs text-muted-foreground mt-1.5">探索更多商品</span>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Member Level */}
                    <Card className="h-full border-neutral-200 col-span-2 md:col-span-1">
                        <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
                            <span className="text-base font-medium text-neutral-900">會員等級</span>
                            <Badge variant="secondary" className="mt-2 bg-neutral-100 text-neutral-700 hover:bg-neutral-100 font-normal">
                                {customer.level?.name || '一般會員'}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Profile Form */}
                <Card className="shadow-sm border-neutral-200">
                    <CardHeader>
                        <CardTitle className="text-xl">個人資料</CardTitle>
                        <CardDescription>維護您的聯絡資訊，方便後續購物配送</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSave}>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">姓名</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="pl-9 bg-neutral-50/50 focus:bg-white transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                        <Input
                                            id="email"
                                            value={customer.email}
                                            disabled
                                            className="pl-9 bg-neutral-100/50 text-muted-foreground cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">聯絡電話</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="pl-9 bg-neutral-50/50 focus:bg-white transition-colors"
                                        placeholder="請輸入手機號碼"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">配送地址</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        id="address"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        className="pl-9 bg-neutral-50/50 focus:bg-white transition-colors"
                                        placeholder="請輸入預設配送地址"
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={`flex items-center gap-2 text-sm font-medium p-3 rounded-md animate-in fade-in slide-in-from-top-1 ${message.includes('失敗')
                                    ? 'text-red-600 bg-red-50'
                                    : 'text-emerald-600 bg-emerald-50'
                                    }`}>
                                    <span className={`h-2 w-2 rounded-full ${message.includes('失敗') ? 'bg-red-500' : 'bg-emerald-500'
                                        }`} />
                                    {message}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleLogout}
                                className="w-full sm:w-auto text-muted-foreground hover:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" /> 登出帳號
                            </Button>

                            <Button type="submit" disabled={saving} className="w-full sm:w-auto ml-auto min-w-[120px]">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                儲存變更
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
