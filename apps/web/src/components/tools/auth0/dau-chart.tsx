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
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        {/* <ChartTooltip content={({ payload }) => {
                            if (!payload?.length) return null

                            return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Date
                                            </span>
                                            <span className="font-bold text-muted-foreground">
                                                {payload[0].payload.day}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Active Users
                                            </span>
                                            <span className="font-bold">
                                                {payload[0].value}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        }} /> */}
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
