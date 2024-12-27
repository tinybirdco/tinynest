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

export interface DailyLoginFailsDataPoint {
    day: string
    fails: number
}

export interface DailyLoginFailsChartData {
    data: DailyLoginFailsDataPoint[]
    timeRange: 'hourly' | 'daily' | 'monthly'
    className?: string
}

const chartConfig = {
    fails: {
        color: "hsl(var(--primary))",
        label: "Login Fails",
    },
} satisfies ChartConfig

export function DailyLoginFailsChart({ data, timeRange, className }: DailyLoginFailsChartData) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Login Failures</CardTitle>
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
                                value: "Login Failures",
                                angle: -90,
                                position: "left",
                                offset: 32
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="fails"
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
