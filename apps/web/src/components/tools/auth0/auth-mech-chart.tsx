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

export interface AuthMechDataPoint {
    mech: string
    logins: number
}

export interface AuthMechChartData {
    data: AuthMechDataPoint[]
    className?: string
}

const chartConfig = {
    logins: {
        color: "hsl(var(--chart-1))",
        label: "Logins",
    },
} satisfies ChartConfig

function transformData(data: AuthMechDataPoint[]): (AuthMechDataPoint & { fill: string })[] {
    return data.map((item, index) => ({
        ...item,
        fill: `hsl(var(--chart-${(index % 12) + 1}))`
    }));
}

export function AuthMechChart({ data, className }: AuthMechChartData) {
    const sortedData = transformData([...data].sort((a, b) => b.logins - a.logins))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Authentication Methods</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className={`w-full ${className}`}>
                    <BarChart
                        data={sortedData}
                        layout="vertical"
                        margin={{
                            left: 24,
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
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
