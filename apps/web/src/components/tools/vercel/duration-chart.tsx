import { format } from 'date-fns'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/card'
import { type TimeRange } from '@/components/time-range'

export interface DurationData {
    period: string
    avg_duration: number
    p95_duration: number
}

interface DurationChartProps {
    data: DurationData[]
    timeRange: TimeRange
}

export function DurationChart({ data, timeRange }: DurationChartProps) {

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

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => format(new Date(value), dateFormat)}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}s`}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        return (
                            <Card className="p-2">
                                <div className="text-sm text-muted-foreground">
                                    {format(new Date(payload[0].payload.period), dateFormat)}
                                </div>
                                <div className="font-bold">
                                    Avg: {payload[0].payload.avg_duration}s
                                </div>
                                <div className="font-bold">
                                    P95: {payload[0].payload.p95_duration}s
                                </div>
                            </Card>
                        )
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="avg_duration"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="p95_duration"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    )
} 