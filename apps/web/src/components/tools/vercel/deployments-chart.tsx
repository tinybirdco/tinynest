import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartConfig } from '@/components/ui/chart'
import { format } from 'date-fns'

interface DeploymentsData {
    period: string
    'deployment.succeeded': number
    'deployment.error': number
}

const chartConfig = {
    'deployment.succeeded': {
        color: "hsl(var(--primary))",
        label: "Successful Deployments",
    },
    'deployment.error': {
        color: "hsl(var(--secondary))",
        label: "Failed Deployments",
    },
} satisfies ChartConfig

export function DeploymentsChart({ data, isLoading, className }: {
    data: DeploymentsData[]
    isLoading: boolean
    className?: string
}) {
    if (isLoading) return <div className={`flex items-center justify-center ${className}`}>Loading...</div>
    if (!data.length) return <div className={`flex items-center justify-center ${className}`}>No data available</div>

    const chartData = data.reduce((acc: any[], curr) => {
        const existing = acc.find(d => d.period === curr.period)
        if (existing) {
            existing[curr.event_type] = curr.count
        } else {
            acc.push({
                period: curr.period,
                [curr.event_type]: curr.count
            })
        }
        return acc
    }, [])

    return (
        <ChartContainer config={chartConfig} className={`w-full ${className}`}>
            <BarChart
                data={chartData}
                margin={{ left: 24, right: 24, top: 24, bottom: 24 }}
            >
                <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => format(new Date(value), 'd HH:mm')}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                />
                <ChartTooltip 
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0].payload
                        return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="text-xs text-muted-foreground">
                                    {format(new Date(data.period), 'd HH:mm')}
                                </div>
                                {payload.map((p: any) => (
                                    <div key={p.dataKey} className="font-bold">
                                        {chartConfig[p.dataKey as keyof typeof chartConfig].label}: {p.value}
                                    </div>
                                ))}
                            </div>
                        )
                    }}
                />
                <Bar
                    dataKey="deployment.succeeded"
                    fill={chartConfig['deployment.succeeded'].color}
                    radius={[4, 4, 0, 0]}
                    stackId="stack"
                />
                <Bar
                    dataKey="deployment.error"
                    fill={chartConfig['deployment.error'].color}
                    radius={[4, 4, 0, 0]}
                    stackId="stack"
                />
            </BarChart>
        </ChartContainer>
    )
} 