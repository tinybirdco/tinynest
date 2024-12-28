"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartConfig
} from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { format } from "date-fns"

export interface DailySubsDataPoint {
    day: string
    created: number
    deleted: number
}

export interface DailySubsChartData {
    data: DailySubsDataPoint[]
    timeRange: 'monthly' | 'daily'
    className?: string
}

const chartConfig = {
    created: {
        color: "hsl(var(--chart-1))",
        label: "Subscriptions Created",
    },
    deleted: {
        color: "hsl(var(--chart-2))",
        label: "Subscriptions Deleted",
    },
} satisfies ChartConfig

export function DailySubsChart({ data, timeRange, className }: DailySubsChartData) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
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
                            label={{
                                value: "Subscriptions",
                                angle: -90,
                                position: "left",
                                offset: 32
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="created"
                            strokeWidth={2}
                            dot={false}
                            style={{
                                stroke: "hsl(var(--chart-1))",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="deleted"
                            strokeWidth={2}
                            dot={false}
                            style={{
                                stroke: "hsl(var(--chart-2))",
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
