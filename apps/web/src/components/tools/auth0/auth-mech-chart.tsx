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
import { Bar, BarChart, XAxis, YAxis } from "recharts"

interface AuthMechData {
    mech: string
    logins: number
}

interface AuthMechChartProps {
    data: AuthMechData[]
}

const chartConfig = {
    logins: {
        color: "hsl(var(--primary))",
        label: "Logins",
    },
} satisfies ChartConfig

export function AuthMechChart({ data }: AuthMechChartProps) {
    // Sort data by number of logins in descending order
    const sortedData = [...data].sort((a, b) => b.logins - a.logins)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Authentication Methods</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        data={sortedData}
                        layout="vertical"
                        margin={{
                            left: 80,
                            right: 12,
                            top: 12,
                            bottom: 12,
                        }}
                    >
                        <XAxis
                            type="number"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            type="category"
                            dataKey="mech"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={70}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent />}
                            cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                        />
                        <Bar
                            dataKey="logins"
                            radius={[4, 4, 4, 4]}
                            fill="hsl(var(--primary))"
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}