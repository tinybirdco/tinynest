import { LineChart, Line, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartConfig } from '@/components/ui/chart'
import { format } from 'date-fns'

interface ResponseTimeData {
    hour: string
    avg_duration: number
    p95_duration: number
    max_duration: number
}

const chartConfig = {
    avg_duration: {
        color: "hsl(var(--primary))",
        label: "Avg Duration (ms)",
    },
    p95_duration: {
        color: "hsl(var(--secondary))",
        label: "P95 Duration (ms)",
    },
} satisfies ChartConfig

export function ResponseTimesChart({ data, isLoading, className }: {
    data: ResponseTimeData[]
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
                    tickFormatter={(value) => `${value}ms`}
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
                                    <div>Avg: {data.avg_duration}ms</div>
                                    <div>P95: {data.p95_duration}ms</div>
                                </div>
                            </div>
                        )
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="avg_duration"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="p95_duration"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ChartContainer>
    )
} 