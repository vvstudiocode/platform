'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useEffect, useState, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'

export function SearchInput({
    placeholder = "搜尋...",
    className
}: {
    placeholder?: string
    className?: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // Initialize from URL only once on mount
    const initialValue = searchParams.get('q') || ''
    const [value, setValue] = useState(initialValue)
    const debouncedValue = useDebounce(value, 500)

    // Track the last pushed value to prevent loops
    const lastPushedValue = useRef(initialValue)

    // Sync URL -> Input when navigating (e.g., back button)
    const currentQ = searchParams.get('q') || ''
    useEffect(() => {
        // Only sync if the URL value differs from what we last pushed
        // This handles browser back/forward navigation
        if (currentQ !== lastPushedValue.current) {
            setValue(currentQ)
            lastPushedValue.current = currentQ
        }
    }, [currentQ])

    // Sync Input -> URL when debounced value changes
    useEffect(() => {
        // Skip if the value matches what's already in URL
        if (debouncedValue === lastPushedValue.current) {
            return
        }

        lastPushedValue.current = debouncedValue

        const params = new URLSearchParams(searchParams.toString())
        if (debouncedValue) {
            params.set('q', debouncedValue)
        } else {
            params.delete('q')
        }

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`)
        })
    }, [debouncedValue, pathname, router]) // Removed searchParams from dependencies!

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="pl-10 bg-background border-border focus-visible:ring-accent"
            />
        </div>
    )
}
