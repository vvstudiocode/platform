'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, X } from 'lucide-react'

// Types based on the SQL schema
export interface ProductOption {
    id: string
    name: string // e.g. "Color"
    values: string[] // e.g. ["Red", "Blue"]
}

export interface ProductVariant {
    id?: string
    name: string // e.g. "Red / S"
    options: Record<string, string> // e.g. { "Color": "Red", "Size": "S" }
    price: number
    stock: number
    sku: string
}

interface Props {
    initialOptions?: ProductOption[]
    initialVariants?: ProductVariant[]
    basePrice: number
    baseStock: number
    baseSku: string
    onChange: (data: { options: ProductOption[], variants: ProductVariant[] }) => void
}

export function ProductVariantsEditor({ initialOptions = [], initialVariants = [], basePrice, baseStock, baseSku, onChange }: Props) {
    const [options, setOptions] = useState<ProductOption[]>(initialOptions)
    const [variants, setVariants] = useState<ProductVariant[]>(initialVariants)

    // Add a new option (e.g. Color)
    const addOption = () => {
        const newOption: ProductOption = {
            id: crypto.randomUUID(),
            name: '',
            values: []
        }
        setOptions([...options, newOption])
    }

    // Remove an option
    const removeOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index)
        setOptions(newOptions)
        generateVariants(newOptions)
    }

    // Update option name
    const updateOptionName = (index: number, name: string) => {
        const newOptions = [...options]
        newOptions[index].name = name
        setOptions(newOptions)
    }

    // Add value to an option (e.g. "Red")
    const addValue = (optionIndex: number, value: string) => {
        if (!value) return
        const newOptions = [...options]
        if (!newOptions[optionIndex].values.includes(value)) {
            newOptions[optionIndex].values.push(value)
            setOptions(newOptions)
            generateVariants(newOptions)
        }
    }

    // Remove value from an option
    const removeValue = (optionIndex: number, valueIndex: number) => {
        const newOptions = [...options]
        newOptions[optionIndex].values.splice(valueIndex, 1)
        setOptions(newOptions)
        generateVariants(newOptions)
    }

    // Generate variants based on options
    const generateVariants = (currentOptions: ProductOption[]) => {
        // Filter out incomplete options
        const validOptions = currentOptions.filter(o => o.name && o.values.length > 0)

        if (validOptions.length === 0) {
            setVariants([])
            onChange({ options: currentOptions, variants: [] })
            return
        }

        // Cartesian product of all values
        const combinations = cartesian(validOptions.map(o => o.values))

        const newVariants = combinations.map(combo => {
            const variantOptions: Record<string, string> = {}
            let variantNameParts: string[] = []

            validOptions.forEach((opt, idx) => {
                const val = Array.isArray(combo) ? combo[idx] : combo // Handle single option case
                variantOptions[opt.name] = val
                variantNameParts.push(val)
            })

            const name = variantNameParts.join(' / ')

            // Try to find existing variant to preserve price/stock/sku
            const existing = variants.find(v => {
                // Check if all NEW options match the existing variant's options
                // (Partial match allows keeping data when adding new options, but we need to be careful when removing)
                // When removing, validOptions has FEWER keys.
                // We want to match if the existing variant *contains* the new requirement.
                return Object.entries(variantOptions).every(([key, val]) => v.options[key] === val)
            })

            if (existing) {
                // Update name and options, keep other fields
                return {
                    ...existing,
                    name,
                    options: variantOptions
                }
            }

            return {
                id: crypto.randomUUID(),
                name,
                options: variantOptions,
                price: basePrice || 0,
                stock: baseStock || 0,
                sku: `${baseSku || ''}-${variantNameParts.join('-')}`
            }
        })

        setVariants(newVariants)
        onChange({ options: currentOptions, variants: newVariants })
    }

    // Helper for Cartesian product
    const cartesian = (args: any[]) => {
        const r: any[] = []
        const max = args.length - 1
        function helper(arr: any[], i: number) {
            for (let j = 0, l = args[i].length; j < l; j++) {
                const a = arr.slice(0) // clone
                a.push(args[i][j])
                if (i === max) r.push(a)
                else helper(a, i + 1)
            }
        }
        if (args.length > 0) helper([], 0)
        return r
    }

    const updateVariantField = (index: number, field: keyof ProductVariant, value: any) => {
        const newVariants = [...variants]
        newVariants[index] = { ...newVariants[index], [field]: value }
        setVariants(newVariants)
        onChange({ options, variants: newVariants })
    }

    return (
        <div className="space-y-6">
            {/* Options Management */}
            <div className="space-y-4">
                <Label className="text-base text-foreground font-medium">規格設定</Label>
                {options.map((option, idx) => (
                    <div key={option.id} className="bg-card p-4 rounded-xl space-y-3 border border-border shadow-sm">
                        <div className="flex gap-2 items-center">
                            <Label className="w-16 text-muted-foreground">規格名稱</Label>
                            <Input
                                value={option.name}
                                onChange={(e) => updateOptionName(idx, e.target.value)}
                                placeholder="例如：顏色、尺寸"
                                className="bg-background border-input"
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(idx)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex gap-2 items-start">
                            <Label className="w-16 pt-2 text-muted-foreground">選項值</Label>
                            <div className="flex-1 flex flex-wrap gap-2">
                                {option.values.map((val, vIdx) => (
                                    <div key={vIdx} className="bg-muted text-foreground px-2 py-1 rounded-md flex items-center gap-1 text-sm border border-border">
                                        {val}
                                        <button type="button" onClick={() => removeValue(idx, vIdx)} className="hover:text-destructive text-muted-foreground">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex gap-2 items-center">
                                    <Input
                                        id={`option-input-${option.id}`}
                                        placeholder="輸入後按 Enter"
                                        className="w-32 h-8 text-sm bg-background border-input"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                addValue(idx, e.currentTarget.value)
                                                e.currentTarget.value = ''
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 px-2"
                                        onClick={() => {
                                            const input = document.getElementById(`option-input-${option.id}`) as HTMLInputElement
                                            if (input && input.value) {
                                                addValue(idx, input.value)
                                                input.value = ''
                                            }
                                        }}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <Button type="button" onClick={addOption} variant="outline" className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 hover:bg-accent/30">
                    <Plus className="h-4 w-4 mr-2" /> 新增規格
                </Button>
            </div>

            {/* Variants Table */}
            {
                variants.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-base text-foreground font-medium">規格列表 ({variants.length})</Label>
                        <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">規格</th>
                                            <th className="px-4 py-3 w-32 font-medium">價格</th>
                                            <th className="px-4 py-3 w-24 font-medium">庫存</th>
                                            <th className="px-4 py-3 w-32 font-medium">SKU</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-card divide-y divide-border">
                                        {variants.map((variant, idx) => (
                                            <tr key={idx} className="hover:bg-accent/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-foreground">{variant.name}</td>
                                                <td className="px-4 py-3">
                                                    <Input
                                                        type="number"
                                                        value={variant.price}
                                                        onChange={(e) => updateVariantField(idx, 'price', Number(e.target.value))}
                                                        className="h-8 bg-background border-input"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Input
                                                        type="number"
                                                        value={variant.stock}
                                                        onChange={(e) => updateVariantField(idx, 'stock', Number(e.target.value))}
                                                        className="h-8 bg-background border-input"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Input
                                                        value={variant.sku || ''}
                                                        onChange={(e) => updateVariantField(idx, 'sku', e.target.value)}
                                                        className="h-8 bg-background border-input"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
