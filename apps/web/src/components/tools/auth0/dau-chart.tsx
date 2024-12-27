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

interface DauDataPoint {
    day: string
    active: number
}

interface DauChartData {
    data: DauDataPoint[]
}

const chartConfig = {
    active: {
        color: "hsl(var(--primary))",
        label: "Active Users",
    },
} satisfies ChartConfig

export function DauChart({ data }: DauChartData) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
            </CardHeader>
            <CardContent className="">
                <ChartContainer config={chartConfig} >
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
                            tickFormatter={(value) => value.split('-')[2]}
                            label={{
                                value: "Day of Month",
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
