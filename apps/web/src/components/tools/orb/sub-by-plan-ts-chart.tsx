"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis } from "recharts"

export interface SubsByPlanTsDataPoint {
    day: string
    plan: string
    subs: number
}

export interface SubsByPlanTsChartData {
    data: SubsByPlanTsDataPoint[]
}

export interface TransformedDataPoint {
    day: string
    [planName: string]: string | number
}

function transformData(rawData: SubsByPlanTsDataPoint[]): TransformedDataPoint[] {
    const transformedData: { [key: string]: TransformedDataPoint } = {};

    rawData.forEach((item) => {
        if (!transformedData[item.day]) {
            transformedData[item.day] = { day: item.day };
        }
        transformedData[item.day][item.plan] = item.subs;
    });

    return Object.values(transformedData);
}

const chartConfig = {
} satisfies ChartConfig

export function SubsByPlanTsChart({ data: rawData }: SubsByPlanTsChartData) {
    const transformedData = transformData(rawData);
    const planNames = Array.from(new Set(rawData.map(d => d.plan)));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscriptions by Plan</CardTitle>
                <CardDescription>Active subscriptions over time</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={transformedData}
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
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        {planNames.map((plan) => (
                            <Line
                                key={plan}
                                type="monotone"
                                dataKey={plan}
                                name={plan}
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
