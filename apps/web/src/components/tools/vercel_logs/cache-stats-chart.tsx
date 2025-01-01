import { LineChart, Line, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartConfig } from '@/components/ui/chart'
import { format } from 'date-fns'

interface CacheData {
    hour: string
    total_requests: number
    cache_hits: number
    hit_rate: number
}

const chartConfig = {
    hit_rate: {
        color: "hsl(var(--primary))",
        label: "Cache Hit Rate %",
    },
} satisfies ChartConfig

export function CacheStatsChart({ data, isLoading, className }: {
    data: CacheData[]
    isLoading: boolean
    className?: string
}) {
    if (isLoading) return <div className={`flex items-center justify-center ${className}`}>Loading...</div>
    if (!data.length) return <div className={`flex items-center justify-center ${className}`}>No data available</div>

    return (
        <ChartContainer config={chartConfig} className={`w-full ${className}`}>
            <LineChart
                data={data}
                margin={{ left: 24, right: 24, top: 24, bottom: 24 }}
            >
                <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => format(new Date(value), 'd HH:mm')}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip 
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0].payload
                        return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="text-xs text-muted-foreground">
                                    {format(new Date(data.hour), 'd HH:mm')}
                                </div>
                                <div className="font-bold">
                                    {data.hit_rate}%
                                </div>
                            </div>
                        )
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="hit_rate"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ChartContainer>
    )
} 