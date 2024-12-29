import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltip, ChartConfig, ChartTooltipContent } from '@/components/ui/chart'

interface Browser {
    browser: string
    request_count: number
    unique_ips: number
    event_types: string
}

interface TopBrowsersChartProps {
    data: Browser[]
    isLoading: boolean
    className?: string
}

const chartConfig = {
    request_count: {
        color: "hsl(var(--primary))",
        label: "Requests",
    },
} satisfies ChartConfig

export function TopBrowsersChart({ data, isLoading, className }: TopBrowsersChartProps) {
    if (isLoading) return <div className={`flex items-center justify-center ${className}`}>Loading...</div>
    if (!data.length) return <div className={`flex items-center justify-center ${className}`}>No data available</div>

    return (
        <ChartContainer config={chartConfig} className={`w-full ${className}`}>
            <BarChart 
                data={data.slice(0, 5)} 
                layout="vertical" 
                margin={{
                    left: 24,
                    right: 12,
                    top: 12,
                    bottom: 12,
                }}
            >
                <XAxis 
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis 
                    type="category"
                    dataKey="browser"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={70}
                />
                <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                />
                <Bar 
                    dataKey="request_count" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 4, 4]}
                />
            </BarChart>
        </ChartContainer>
    )
} 