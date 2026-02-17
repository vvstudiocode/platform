import { Reorder, useDragControls } from 'framer-motion'
import { GripVertical, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Product {
    id: string
    name: string
    image_url?: string
    price: number
    category?: string
}

interface SortableProductListProps {
    value: string[]
    products: Product[]
    onChange: (ids: string[]) => void
}

export function SortableProductList({ value, products, onChange }: SortableProductListProps) {
    // Map IDs to product objects for display
    // We maintain the order based on 'value'
    const selectedProducts: (Product | undefined)[] = value.map(id => products.find(p => p.id === id))

    if (value.length === 0) {
        return null
    }

    return (
        <div className="space-y-2 mb-4">
            <div className="text-xs text-muted-foreground font-medium mb-2">
                已選擇商品 (拖曳可排序)
            </div>
            <Reorder.Group
                axis="y"
                values={value}
                onReorder={onChange}
                className="space-y-2"
            >
                {selectedProducts.map((product, index) => {
                    // Handle case where product might not be found (e.g. deleted)
                    if (!product) {
                        const id = value[index];
                        return (
                            <Reorder.Item
                                key={id}
                                value={id}
                                className="flex items-center gap-2 p-2 bg-background border rounded-md shadow-sm relative group"
                            >
                                <span className="text-xs text-red-500">商品已失效 (ID: {id})</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 ml-auto text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                        const newIds = value.filter(pid => pid !== id)
                                        onChange(newIds)
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </Reorder.Item>
                        )
                    }

                    return (
                        <SortableProductItem
                            key={product.id}
                            product={product}
                            onRemove={() => {
                                const newIds = value.filter(id => id !== product.id)
                                onChange(newIds)
                            }}
                        />
                    )
                })}
            </Reorder.Group>
        </div>
    )
}

function SortableProductItem({ product, onRemove }: { product: Product, onRemove: () => void }) {
    const controls = useDragControls()

    return (
        <Reorder.Item
            value={product.id}
            dragListener={false}
            dragControls={controls}
            className="flex items-center gap-2 p-2 bg-background border border-border rounded-md shadow-sm relative group select-none"
        >
            <div
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
                onPointerDown={(e) => controls.start(e)}
            >
                <GripVertical className="h-4 w-4" />
            </div>

            <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                {product.image_url ? (
                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                        無圖
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{product.name}</div>
                <div className="text-xs text-muted-foreground">
                    {product.category || '未分類'} · NT${product.price}
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation() // Prevent drag start if clicking remove
                    onRemove()
                }}
            >
                <X className="h-4 w-4" />
            </Button>
        </Reorder.Item>
    )
}
