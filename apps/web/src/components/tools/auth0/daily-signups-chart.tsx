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
import { Line, LineChart, XAxis, YAxis } from "recharts"
import { format } from "date-fns"

export interface DailySignupsDataPoint {
    day: string
    signups: number
}

export interface DailySignupsChartData {
    data: DailySignupsDataPoint[]
    timeRange: 'hourly' | 'daily' | 'monthly'
}

const chartConfig = {
    signups: {
        color: "hsl(var(--primary))",
        label: "Signups",
    },
} satisfies ChartConfig

export function DailySignupsChart({ data, timeRange }: DailySignupsChartData) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Signups</CardTitle>
            </CardHeader>
            <CardContent className="">
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <LineChart
                        data={data}
                        margin={{
                            left: 48,
                            right: 12,
                            top: 12,
                            bottom: 32
                        }}
                    >
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
                                value: "Signups",
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
                            dataKey="signups"
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
