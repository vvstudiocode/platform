"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'

interface AovTrendChartProps {
    data: {
        date: string
        aov: number
    }[]
}

export function AovTrendChart({ data }: AovTrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[350px] w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                尚無資料
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    labelFormatter={(value) => format(new Date(value), 'yyyy/MM/dd')}
                    formatter={(value: number) => [`NT$ ${value.toLocaleString()}`, '平均客單價']}
                />
                <Line
                    type="monotone"
                    dataKey="aov"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
