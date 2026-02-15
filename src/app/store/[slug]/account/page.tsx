'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2, User, Phone, MapPin, Mail, LogOut, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

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

export default function AccountPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [message, setMessage] = useState('')

    // Form State
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')

    useEffect(() => {
        fetchCustomer()
    }, [])

    const fetchCustomer = async () => {
        let user, tenant

        try {
            const { data: authData } = await supabase.auth.getUser()
            user = authData.user

            if (!user) {
                // Not logged in, redirect to home with a query param to open login?
                // For now, just go home
                router.push(`/store/${slug}`)
                return
            }

            // Fetch Store ID first? Or directly query customers by auth_id + tenant slug?
            // Easier to get tenant first
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
                // Throw specific error to trigger self-healing
                throw { code: 'PGRST116' }
            }

            setCustomer(customerData as any)
            setName(customerData.name || '')
            setPhone(customerData.phone || '')
            setAddress(customerData.address || '')

        } catch (error: any) {
            // Only log if it's NOT the "no rows found" error (which we handle by creating)
            if (error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error)
            }

            // Strict Mode: No auto-creation. If profile missing, they are not a member.
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
                <div className="flex flex-col md:flex-row gap-8 items-start justify-center">

                    {/* Sidebar / Status Card */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <Card className="bg-gradient-to-br from-white to-neutral-50 border-neutral-200 overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
                            <div className="absolute top-0 right-0 p-3 opacity-5">
                                <User className="w-32 h-32" />
                            </div>
                            <CardHeader className="pb-2 relative z-10">
                                <CardTitle className="text-lg font-medium text-neutral-600">會員狀態</CardTitle>
                                <CardDescription>您的目前等級與點數</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                <div>
                                    <div className="mb-2">
                                        <Badge variant="outline" className="px-3 py-1 bg-white/50 backdrop-blur text-base font-normal border-primary/20 text-primary">
                                            {customer.level?.name || '一般會員'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold font-heading text-neutral-900 tracking-tight">
                                            {customer.current_points}
                                        </span>
                                        <span className="text-sm text-neutral-500">點</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="hidden md:block">
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="w-full justify-start text-neutral-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
                            >
                                <LogOut className="mr-2 h-4 w-4" /> 登出帳號
                            </Button>
                        </div>
                    </div>

                    {/* Main Content / Form */}
                    <div className="w-full md:w-2/3">
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
                                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-md animate-in fade-in slide-in-from-top-1">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            {message}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleLogout}
                                        className="sm:hidden w-full text-muted-foreground hover:text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" /> 登出
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
            </div>
        </div>
    )
}
