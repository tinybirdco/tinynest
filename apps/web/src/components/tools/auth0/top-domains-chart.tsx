import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { ChartConfig, ChartTooltip, ChartTooltipContent, ChartContainer } from '@/components/ui/chart'

interface Domain {
    domain: string
    request_count: number
    unique_emails: number
}

interface TopDomainsChartProps {
    data: Domain[]
    isLoading: boolean
    className?: string
}

const chartConfig = {
    unique_emails: {
        color: "hsl(var(--chart-1))",
        label: "Users",
    },
} satisfies ChartConfig

function transformData(data: Domain[]): (Domain & { fill: string })[] {
    return data.map((item, index) => ({
        ...item,
        fill: `hsl(var(--chart-${(index % 12) + 1}))`
    }));
}

export function TopDomainsChart({ data, isLoading, className }: TopDomainsChartProps) {
    if (isLoading) return <div className={`flex items-center justify-center ${className}`}>Loading...</div>
    if (!data.length) return <div className={`flex items-center justify-center ${className}`}>No data available</div>

    data = transformData(data)
    
    return (
        <ChartContainer config={chartConfig} className={`w-full ${className}`}>
            <BarChart 
                data={data.slice(0, 10)} 
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
                    domain={[0, 'dataMax']}
                />
                <YAxis 
                    type="category"
                    dataKey="domain"
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
                    dataKey="unique_emails" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 4, 4]}
                />
            </BarChart>
        </ChartContainer>
    )
} 