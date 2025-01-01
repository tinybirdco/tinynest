import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartConfig, ChartTooltipContent } from '@/components/ui/chart'

interface StatusData {
    status: number
    count: number
    percentage: number
}

const chartConfig = {
    count: {
        color: "hsl(var(--primary))",
        label: "Requests",
    },
} satisfies ChartConfig

export function StatusDistributionChart({ data, isLoading, className }: { 
    data: StatusData[]
    isLoading: boolean
    className?: string 
}) {
    if (isLoading) return <div className={`flex items-center justify-center ${className}`}>Loading...</div>
    if (!data.length) return <div className={`flex items-center justify-center ${className}`}>No data available</div>

    return (
        <ChartContainer config={chartConfig} className={`w-full ${className}`}>
            <BarChart 
                data={data}
                layout="vertical"
                margin={{ left: 70, right: 24, top: 24, bottom: 24 }}
            >
                <XAxis type="number" />
                <YAxis 
                    type="category"
                    dataKey="status"
                    tickLine={false}
                    axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 4, 4]}
                />
            </BarChart>
        </ChartContainer>
    )
} 