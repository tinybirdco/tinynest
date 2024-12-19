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
import { Line, LineChart, XAxis } from "recharts"

interface SubsDataPoint {
    day: string
    invoices: number
}

interface SubsChartProps {
    data: SubsDataPoint[]
}

const chartConfig = {
    invoices: {
        color: "hsl(var(--primary))",
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
                <ChartContainer config={chartConfig}>
                    <LineChart
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            interval="equidistantPreserveStart"
                            tickFormatter={(value) => value.split('-')[2]}
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
