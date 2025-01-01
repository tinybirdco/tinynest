import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartConfig, ChartTooltipContent } from '@/components/ui/chart'

interface SignupData {
    day: string
    new_users: number
    cumulative_users: number
}

interface CumulativeSignupsChartProps {
    data: SignupData[]
    isLoading: boolean
    className?: string
}

const chartConfig = {
    cumulative_users: {
        color: "hsl(var(--primary))",
        label: "Total Users",
    },
    new_users: {
        color: "hsl(var(--secondary))",
        label: "New Users",
    },
} satisfies ChartConfig

export function CumulativeSignupsChart({ data, isLoading, className }: CumulativeSignupsChartProps) {
    if (isLoading) return <div className={`flex items-center justify-center ${className}`}>Loading...</div>
    if (!data.length) return <div className={`flex items-center justify-center ${className}`}>No data available</div>

    return (
        <ChartContainer config={chartConfig} className={`w-full ${className}`}>
            <BarChart 
                data={data} 
                margin={{
                    left: 24,
                    right: 12,
                    top: 12,
                    bottom: 24,
                }}
            >
                <XAxis 
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis 
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
                    dataKey="cumulative_users" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                />
                <Bar 
                    dataKey="new_users" 
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                />
            </BarChart>
        </ChartContainer>
    )
} 