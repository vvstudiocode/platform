'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, Edit, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateOrder } from '@/app/admin/(dashboard)/orders/actions'
import { Combobox } from "@/components/ui/combobox"

interface Product {
    id: string
    name: string
    price: number
    stock: number
    variants?: any // For now, simple products
}

interface Props {
    storeId: string
    storeSlug: string // Needed for the API
    products: Product[]
    order?: any // If provided, edit mode
    trigger?: React.ReactNode // Custom trigger
    settings?: any // Tenant settings for shipping names/fees
}

interface OrderItem {
    productId: string
    quantity: number
    price: number // Snapshot price
    name: string
    options?: any
}

export function OrderFormModal({ storeId, storeSlug, products, order, trigger, settings }: Props) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const isEdit = !!order

    // Form State
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [customerEmail, setCustomerEmail] = useState('')
    const [shippingMethod, setShippingMethod] = useState('home')
    const [address, setAddress] = useState('')
    const [storeName, setStoreName] = useState('') // For pickup/711
    const [storeCode, setStoreCode] = useState('') // For 711
    const [items, setItems] = useState<OrderItem[]>([])
    const [notes, setNotes] = useState('')

    // New Fields
    const [shippingFee, setShippingFee] = useState<number>(100)
    const [isManualShipping, setIsManualShipping] = useState(false)
    const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed')
    const [discountValue, setDiscountValue] = useState<number>(0)


    // Effect to Fill Data on Edit
    useEffect(() => {
        if (open && order) {
            setCustomerName(order.customer_name || '')
            setCustomerPhone(order.customer_phone || '')
            setCustomerEmail(order.customer_email || '')
            setShippingMethod(order.shipping_method || 'home')
            setAddress(order.store_address || '')
            setStoreName(order.store_name || '')
            setStoreCode(order.store_code || '')
            setNotes(order.notes || '')

            // Set Shipping Fee
            if (order.shipping_fee !== undefined) {
                setShippingFee(order.shipping_fee)
                setIsManualShipping(true) // Assert manual if it exists in DB, or we can check against default logic
            }

            // Set Discount
            setDiscountType(order.discount_type || 'fixed')
            setDiscountValue(order.discount_value || 0)

            // Map items
            // Assumption: order.items is an array of objects matching OrderItem somewhat
            if (Array.isArray(order.items)) {
                setItems(order.items.map((item: any) => ({
                    productId: item.productId || item.product_id, // Handle different casing if any
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    options: item.options
                })))
            }
        } else if (open && !order) {
            resetForm()
        }
    }, [open, order])

    // Update Shipping Fee Default if NOT manual
    useEffect(() => {
        if (!isManualShipping && !order) {
            let defaultFee = 100
            if (shippingMethod === 'home') defaultFee = settings?.shipping_home_fee || 100
            else if (shippingMethod === '711') defaultFee = settings?.shipping_711_fee || 60
            else if (shippingMethod === 'pickup') defaultFee = settings?.shipping_pickup_fee || 0

            setShippingFee(defaultFee)
        }
    }, [shippingMethod, isManualShipping, order, settings])


    // Calculation
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    // Use order's original shipping fee if editing? Or re-calc? 
    // Re-calc is safer for consistency, but maybe manual override is desired. 
    // Let's re-calc based on method for now.

    let discountAmount = 0
    if (discountType === 'fixed') {
        discountAmount = discountValue
    } else {
        discountAmount = Math.round(subtotal * (discountValue / 100))
    }

    const total = Math.max(0, subtotal - discountAmount + shippingFee)

    const addItem = () => {
        // Show feedback if no products available
        if (products.length === 0) {
            alert('尚無可用商品，請先在商品管理中新增商品')
            return
        }
        const product = products[0]
        setItems([...items, {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        }])
    }

    const updateItem = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...items]
        const item = { ...newItems[index] }

        if (field === 'productId') {
            const product = products.find(p => p.id === value)
            if (product) {
                item.productId = product.id
                item.name = product.name
                item.price = product.price
            }
        } else if (field === 'quantity') {
            item.quantity = Number(value)
        }

        newItems[index] = item
        setItems(newItems)
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (items.length === 0) {
            alert('請至少加入一項商品')
            return
        }

        setLoading(true)

        try {
            const payload = {
                customerName,
                customerPhone,
                customerEmail,
                shippingMethod,
                storeAddress: address,
                storeName,
                storeCode,
                items: items.map(item => ({
                    product_id: item.productId, // Use snake_case for consistency via API? Action uses camelCase mapping usually.
                    productId: item.productId,   // Send both or consistency? API uses productId usually.
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    options: item.options
                })),
                shippingFee,
                subtotal,
                total,
                discountType,
                discountValue,
                notes
            }

            if (isEdit) {
                // UPDATE
                const res = await updateOrder(storeId, order.id, payload, storeSlug === 'hq')

                if (res.error) throw new Error(res.error)
            } else {
                // CREATE (Keep using API for now or switch to action? API handles stock decrement. Action currently doesn't decrement stock!)
                // The API /api/orders handles stock decrement.
                // Does update need to handle stock? Ideally yes, complex delta.
                // For now, let's assume update doesn't adjust stock automatically to minimize complexity 
                // OR we warn user.
                // Given constraints, I will keep Create via API.

                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, storeSlug })
                })

                const data = await res.json()
                if (!res.ok) throw new Error(data.error || '建立失敗')
            }

            setOpen(false)
            router.refresh()
            if (!isEdit) resetForm()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setCustomerName('')
        setCustomerPhone('')
        setCustomerEmail('')
        setAddress('')
        setItems([])
        setNotes('')
        setShippingMethod('home')
        setStoreName('')
        setStoreCode('')
        setStoreName('')
        setStoreCode('')
        setShippingFee(settings?.shipping_home_fee || 100)
        setIsManualShipping(false)
        setDiscountType('fixed')
        setDiscountValue(0)
    }

    // Prepare options for Combobox
    const productOptions = products.map(p => ({
        value: p.id,
        label: `${p.name} ($${p.price}) (庫存: ${p.stock})`
    }))

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90 shadow-soft">
                        <Plus className="h-4 w-4" />
                        新增訂單
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
                <DialogHeader>
                    <DialogTitle>{isEdit ? '編輯訂單' : '建立新訂單'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? '修改訂單內容。' : '手動建立訂單。'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h3 className="font-serif font-semibold border-b border-border pb-2 text-foreground">客戶資訊</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>姓名 *</Label>
                                <Input required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="客戶姓名" />
                            </div>
                            <div className="space-y-2">
                                <Label>電話 *</Label>
                                <Input required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="聯絡電話" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="電子郵件" />
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info with Fee Override */}
                    <div className="space-y-4">
                        <h3 className="font-serif font-semibold border-b border-border pb-2 text-foreground">配送與運費</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>運送方式</Label>
                                <Select value={shippingMethod} onValueChange={setShippingMethod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="home">{settings?.shipping_home_name || '宅配'}</SelectItem>
                                        <SelectItem value="711">{settings?.shipping_711_name || '7-11 取貨'}</SelectItem>
                                        <SelectItem value="pickup">{settings?.shipping_pickup_name || '店面自取'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>運費 (NT$)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={shippingFee}
                                        onChange={e => {
                                            setShippingFee(Number(e.target.value))
                                            setIsManualShipping(true)
                                        }}
                                    />
                                </div>
                            </div>

                            {shippingMethod === 'home' && (
                                <div className="space-y-2 col-span-2">
                                    <Label>地址 *</Label>
                                    <Input required value={address} onChange={e => setAddress(e.target.value)} placeholder="運送地址" />
                                </div>
                            )}
                            {shippingMethod === '711' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>門市名稱</Label>
                                        <Input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="7-11 門市名稱" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>門市代號</Label>
                                        <Input value={storeCode} onChange={e => setStoreCode(e.target.value)} placeholder="7-11 門市代號" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Order Items with Combobox */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h3 className="font-serif font-semibold text-foreground">訂單內容</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="h-3 w-3 mr-1" />
                                加入商品
                            </Button>
                        </div>

                        {items.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                                尚未加入商品
                            </div>
                        )}

                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-start bg-card p-3 rounded-lg border border-border shadow-sm">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs text-muted-foreground">商品搜尋</Label>
                                        <Combobox
                                            options={productOptions}
                                            value={item.productId}
                                            onChange={(val) => updateItem(index, 'productId', val)}
                                            placeholder="選擇商品..."
                                            searchPlaceholder="搜尋商品名稱..."
                                        />
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <Label className="text-xs text-muted-foreground">數量</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-24 pt-6 text-right font-medium text-sm">
                                        ${(item.price * item.quantity).toLocaleString()}
                                    </div>
                                    <div className="pt-6">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Discount & Total */}
                    <div className="space-y-4 border-t border-border pt-4 bg-muted/30 p-4 rounded-lg">
                        <h3 className="font-medium text-foreground">金額計算</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>折扣類型</Label>
                                <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">定額減免 ($)</SelectItem>
                                        <SelectItem value="percent">百分比折扣 (%)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>折扣數值</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={discountValue}
                                    onChange={e => setDiscountValue(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-sm">
                                <span>小計</span>
                                <span>NT$ {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-destructive">
                                <span>折扣 ({discountType === 'percent' ? `${discountValue}%` : `$${discountValue}`})</span>
                                <span>- NT$ {discountAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>運費</span>
                                <span>NT$ {shippingFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2">
                                <span>總金額</span>
                                <span>NT$ {total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>備註</Label>
                        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="訂單備註" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
                        <Button type="submit" disabled={loading} className="bg-foreground text-background hover:bg-foreground/90">
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isEdit ? '儲存變更' : '建立訂單'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
