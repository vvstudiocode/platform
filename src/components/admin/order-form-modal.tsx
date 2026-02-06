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
}

interface OrderItem {
    productId: string
    quantity: number
    price: number // Snapshot price
    name: string
    options?: any
}

export function OrderFormModal({ storeId, storeSlug, products, order, trigger }: Props) {
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
            const defaultFee = shippingMethod === 'home' ? 100 : (shippingMethod === '711' ? 60 : 0)
            setShippingFee(defaultFee)
        }
    }, [shippingMethod, isManualShipping, order])


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
        setShippingFee(100)
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
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        新增訂單
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-zinc-200">
                <DialogHeader>
                    <DialogTitle>{isEdit ? '編輯訂單' : '建立新訂單'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? '修改訂單內容。' : '手動建立訂單。'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h3 className="font-medium border-b border-zinc-700 pb-2 text-zinc-200">客戶資訊</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>姓名 *</Label>
                                <Input required value={customerName} onChange={e => setCustomerName(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-600 focus:border-zinc-600" />
                            </div>
                            <div className="space-y-2">
                                <Label>電話 *</Label>
                                <Input required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-600 focus:border-zinc-600" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-600 focus:border-zinc-600" />
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info with Fee Override */}
                    <div className="space-y-4">
                        <h3 className="font-medium border-b border-zinc-700 pb-2 text-zinc-200">配送與運費</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>運送方式</Label>
                                <Select value={shippingMethod} onValueChange={setShippingMethod}>
                                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-600">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="home">宅配</SelectItem>
                                        <SelectItem value="711">7-11 取貨</SelectItem>
                                        <SelectItem value="pickup">店面自取</SelectItem>
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
                                        className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-600 focus:border-zinc-600"
                                    />
                                </div>
                            </div>

                            {shippingMethod === 'home' && (
                                <div className="space-y-2 col-span-2">
                                    <Label>地址 *</Label>
                                    <Input required value={address} onChange={e => setAddress(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-600 focus:border-zinc-600" />
                                </div>
                            )}
                            {shippingMethod === '711' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>門市名稱</Label>
                                        <Input value={storeName} onChange={e => setStoreName(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-600 focus:border-zinc-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>門市代號</Label>
                                        <Input value={storeCode} onChange={e => setStoreCode(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-600 focus:border-zinc-600" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Order Items with Combobox */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="font-medium">訂單內容</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="h-3 w-3 mr-1" />
                                加入商品
                            </Button>
                        </div>

                        {items.length === 0 && (
                            <div className="text-center py-8 text-zinc-500 bg-zinc-800/50 rounded-lg border border-dashed border-zinc-700">
                                尚未加入商品
                            </div>
                        )}

                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-start">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs">商品搜尋</Label>
                                        <Combobox
                                            options={productOptions}
                                            value={item.productId}
                                            onChange={(val) => updateItem(index, 'productId', val)}
                                            placeholder="選擇商品..."
                                            searchPlaceholder="搜尋商品名稱..."
                                        />
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <Label className="text-xs">數量</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-600 focus:border-zinc-600"
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
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
                    <div className="space-y-4 border-t border-zinc-700 pt-4 bg-zinc-800/50 p-4 rounded-lg">
                        <h3 className="font-medium text-zinc-200">金額計算</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>折扣類型</Label>
                                <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-600">
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
                                    className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-600 focus:border-zinc-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-sm">
                                <span>小計</span>
                                <span>NT$ {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-600">
                                <span>折扣 ({discountType === 'percent' ? `${discountValue}%` : `$${discountValue}`})</span>
                                <span>- NT$ {discountAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>運費</span>
                                <span>NT$ {shippingFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                <span>總金額</span>
                                <span>NT$ {total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>備註</Label>
                        <Input value={notes} onChange={e => setNotes(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-600 focus:border-zinc-600" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isEdit ? '儲存變更' : '建立訂單'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
