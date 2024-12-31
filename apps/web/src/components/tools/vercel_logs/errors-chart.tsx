import { LineChart, Line, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartConfig, ChartTooltipContent } from '@/components/ui/chart'
import { format } from 'date-fns'

interface ErrorData {
    hour: string
    error_count: number
    total_requests: number
    error_rate: number
}

const chartConfig = {
    error_rate: {
        color: "hsl(var(--destructive))",
        label: "Error Rate %",
    },
} satisfies ChartConfig

export function ErrorsChart({ data, isLoading, className }: {
    data: ErrorData[]
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
                                    {data.error_rate}%
                                </div>
                            </div>
                        )
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="error_rate"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ChartContainer>
    )
} 