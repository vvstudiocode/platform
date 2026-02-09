"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface TopProductsChartProps {
    data: {
        name: string
        revenue: number
        count: number
    }[]
}

export function TopProductsChart({ data }: TopProductsChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[350px] w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                尚無資料
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                    interval={0}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => `NT$ ${value.toLocaleString()}`}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
        </ResponsiveContainer>
    )
}
