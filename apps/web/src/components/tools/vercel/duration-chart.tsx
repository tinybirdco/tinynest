import { format } from 'date-fns'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/card'

interface DurationChartProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[]
}

export function DurationChart({ data }: DurationChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <XAxis 
                    dataKey="period" 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => format(new Date(value), 'd MMM HH:mm')}
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
                                    {format(new Date(payload[0].payload.period), 'd MMM HH:mm')}
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
        </ResponsiveContainer>
    )
} 