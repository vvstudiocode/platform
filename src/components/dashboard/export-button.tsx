"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ExportButton() {
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)

    const handleExport = async (type: 'orders' | 'products' | 'revenue') => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams(searchParams.toString())
            params.set('type', type)

            const response = await fetch(`/api/reports/export?${params.toString()}`)

            if (!response.ok) throw new Error('Export failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Export error:', error)
            // Ideally show toast error here
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isLoading} className="gap-2">
                    <Download className="h-4 w-4" />
                    {isLoading ? "匯出中..." : "匯出報表"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('orders')}>
                    訂單明細
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('products')}>
                    商品銷售
                </DropdownMenuItem>
                {/* <DropdownMenuItem onClick={() => handleExport('revenue')}>
                    營收報表
                </DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
