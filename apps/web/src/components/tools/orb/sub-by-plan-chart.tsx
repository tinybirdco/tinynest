"use client"

import { Pie, PieChart } from "recharts"

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
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"


export interface SubsByPlanDataPoint {
    plan: string
    subs: number
}

export interface SubsByPlanChartData {
    data: SubsByPlanDataPoint[]
}

function transformData(data: SubsByPlanDataPoint[]): (SubsByPlanDataPoint & { fill: string })[] {
    return data.map((item, index) => ({
        ...item,
        fill: `hsl(var(--chart-${(index % 12) + 1}))`  // Using hsl() to properly use the CSS variable
    }));
}

function generateChartConfig(data: SubsByPlanDataPoint[]): ChartConfig {
    const planNames = Array.from(new Set(data.map(d => d.plan)));

    return Object.fromEntries([
        ['plan', { label: 'Plan' }],
        ...planNames.map((plan) => [
            plan,
            {
                label: plan,
            }
        ])
    ]);
}

export function SubsByPlanChart({ data: rawData }: SubsByPlanChartData) {
    const chartConfig = generateChartConfig(rawData);
    const data = transformData(rawData);

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle>Subscriptions by Plan</CardTitle>
                <CardDescription>Past 30 days</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <Pie data={data} dataKey="subs" nameKey="plan" />
                        <ChartLegend
                            content={<ChartLegendContent nameKey="plan" />}
                            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
