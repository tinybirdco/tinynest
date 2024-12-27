import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartConfig,
} from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { format } from "date-fns"

export interface UserRetentionDataPoint {
    day: string
    user_retention: number
}

export interface UserRetentionChartData {
    data: UserRetentionDataPoint[]
    timeRange: 'hourly' | 'daily' | 'monthly'
    className?: string
}

const chartConfig = {
    conversion: {
        color: "hsl(var(--primary))",
        label: "User Retention",
    },
} satisfies ChartConfig

export function UserRetentionChart({ data, timeRange, className }: UserRetentionChartData) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Retention</CardTitle>
            </CardHeader>
            <CardContent className="">
                <ChartContainer config={chartConfig} className={`w-full ${className}`}>
                    <LineChart
                        data={data}
                        margin={{
                            left: 48,
                            right: 12,
                            top: 12,
                            bottom: 32
                        }}
                    >
                        <CartesianGrid 
                            horizontal={true}
                            vertical={false}
                            strokeDasharray="3 3"
                            className="stroke-muted"
                        />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            interval="equidistantPreserveStart"
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return timeRange === 'monthly' 
                                    ? format(date, 'MMM yyyy')
                                    : value.split('-')[2]
                            }}
                            label={{
                                value: timeRange === 'monthly' ? "Month of Year" : "Day of Month",
                                position: "bottom",
                                offset: 20
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `${value}%`}
                            label={{
                                value: "User Retention",
                                angle: -90,
                                position: "left",
                                offset: 32
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="user_retention"
                            strokeWidth={2}
                            dot={false}
                            style={{
                                stroke: "hsl(var(--primary))",
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
} 