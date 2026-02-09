"use client"

import * as React from "react"
import { addDays, format, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function CalendarDateRangePicker({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [date, setDate] = React.useState<DateRange | undefined>(() => {
        const from = searchParams.get("from")
        const to = searchParams.get("to")
        if (from && to) {
            return {
                from: new Date(from),
                to: new Date(to),
            }
        }
        return {
            from: startOfMonth(new Date()),
            to: endOfMonth(new Date()),
        }
    })

    // Sync with URL when date changes
    React.useEffect(() => {
        if (date?.from && date?.to) {
            const params = new URLSearchParams(searchParams.toString())
            // Check if dates actually changed to avoid loop/redundant push
            const currentFrom = params.get("from")
            const currentTo = params.get("to")
            const newFrom = format(date.from, "yyyy-MM-dd")
            const newTo = format(date.to, "yyyy-MM-dd")

            if (currentFrom !== newFrom || currentTo !== newTo) {
                params.set("from", newFrom)
                params.set("to", newTo)
                router.push(`${pathname}?${params.toString()}`)
            }
        }
    }, [date, router, pathname, searchParams])

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "yyyy/MM/dd")} -{" "}
                                    {format(date.to, "yyyy/MM/dd")}
                                </>
                            ) : (
                                format(date.from, "yyyy/MM/dd")
                            )
                        ) : (
                            <span>選擇日期範圍</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-2 border-b">
                        <Select
                            onValueChange={(value) => {
                                const today = new Date()
                                let newDate: DateRange | undefined

                                switch (value) {
                                    case "today":
                                        newDate = { from: today, to: today }
                                        break
                                    case "yesterday":
                                        const yesterday = subDays(today, 1)
                                        newDate = { from: yesterday, to: yesterday }
                                        break
                                    case "last7":
                                        newDate = { from: subDays(today, 7), to: today }
                                        break
                                    case "last30":
                                        newDate = { from: subDays(today, 30), to: today }
                                        break
                                    case "thisMonth":
                                        newDate = { from: startOfMonth(today), to: endOfMonth(today) }
                                        break
                                    case "lastMonth":
                                        const lastMonth = subMonths(today, 1)
                                        newDate = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
                                        break
                                }
                                if (newDate) {
                                    setDate(newDate)
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="快捷選項" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="today">今天</SelectItem>
                                <SelectItem value="yesterday">昨天</SelectItem>
                                <SelectItem value="last7">過去 7 天</SelectItem>
                                <SelectItem value="last30">過去 30 天</SelectItem>
                                <SelectItem value="thisMonth">本月</SelectItem>
                                <SelectItem value="lastMonth">上個月</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
