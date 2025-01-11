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

export interface SubsDataPoint {
    day: string
    invoices: number
}

export interface SubsChartProps {
    data: SubsDataPoint[]
}

const chartConfig = {
    invoices: {
        color: "hsl(var(--chart-1))",
        label: "New Subscriptions",
    },
} satisfies ChartConfig

export function SubsChart({ data }: SubsChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>New Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <LineChart
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12
                        }}
                    >
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            // interval="equidistantPreserveStart"
                            label={{
                                value: "Day of Month",
                                position: "bottom",
                                offset: 0
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
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <Line
                            type="monotone"
                            dataKey="invoices"
                            strokeWidth={2}
                            activeDot={{
                                r: 4,
                                style: { fill: chartConfig.invoices.color },
                            }}
                            stroke={chartConfig.invoices.color}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
