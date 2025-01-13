import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartConfig } from '@/components/ui/chart'
import { format } from 'date-fns'
import { type TimeRange } from '@/components/time-range'

export interface DeploymentsData {
    period: string
    event_type: string
    count: number
}

const chartConfig = {
    'deployment.succeeded': {
        color: "hsl(var(--chart-2))",
        label: "Successful Deployments",
    },
    'deployment.error': {
        color: "hsl(var(--chart-1))",
        label: "Failed Deployments",
    },
} satisfies ChartConfig

export function DeploymentsChart({ data, timeRange }: { data: DeploymentsData[]; timeRange: TimeRange }) {
    if (!data.length) return <div className={`flex items-center justify-center`}>No data available</div>

    let dateFormat = 'yyyy-MM-dd HH:mm'
    if (timeRange === 'hourly') {
        dateFormat = 'yyyy-MM-dd HH:mm'
    } else if (timeRange === 'daily') {
        dateFormat = 'd MMMM'
    } else if (timeRange === 'weekly') {
        dateFormat = 'd MMMM'
    } else if (timeRange === 'monthly') {
        dateFormat = 'MMMM'
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartData = data.reduce((acc: any[], curr: DeploymentsData) => {
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
        <ChartContainer config={chartConfig} className={`w-full`}>
            <BarChart
                data={chartData}
                margin={{ left: 24, right: 24, top: 24, bottom: 24 }}
            >
                <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => format(new Date(value), dateFormat)}
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
                                    {format(new Date(data.period), dateFormat)}
                                </div>
                                {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    payload.map((p: any) => (
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
                    radius={[0, 0, 4, 4]}
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