"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartConfig,
    ChartTooltipContent
} from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { format } from "date-fns"

export interface DauDataPoint {
    day: string
    active: number
}

export interface DauChartData {
    data: DauDataPoint[]
    comparisonData?: DauDataPoint[]
    timeRange: 'hourly' | 'daily' | 'monthly'
    className?: string
}

const chartConfig = {
    active: {
        color: "hsl(var(--primary))",
        label: "Active Users",
    },
} satisfies ChartConfig

export function DauChart({ data, timeRange, className }: DauChartData) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Users</CardTitle>
            </CardHeader>
            <CardContent className="">
                <ChartContainer config={chartConfig} className={`h-[400px] w-full ${className}`}>
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
                                value: "Active Users",
                                angle: -90,
                                position: "left",
                                offset: 32
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Line
                            type="monotone"
                            dataKey="active"
                            strokeWidth={2}
                            activeDot={{
                                r: 4,
                                style: { fill: "hsl(var(--primary))" },
                            }}
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
