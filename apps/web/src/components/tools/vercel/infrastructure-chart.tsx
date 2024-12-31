import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartConfig } from '@/components/ui/chart'

interface InfraData {
    region: string
    deployment_type: string
    plan: string
    deployments: number
}

const chartConfig = {
    deployments: {
        color: "hsl(var(--primary))",
        label: "Deployments",
    },
} satisfies ChartConfig

export function InfrastructureChart({ data, isLoading, className }: {
    data: InfraData[]
    isLoading: boolean
    className?: string
}) {
    if (isLoading) return <div className={`flex items-center justify-center ${className}`}>Loading...</div>
    if (!data.length) return <div className={`flex items-center justify-center ${className}`}>No data available</div>

    return (
        <div className="space-y-8">
            {/* Regions Chart */}
            <div>
                <h4 className="text-sm font-medium mb-4">Regions</h4>
                <ChartContainer config={chartConfig} className="w-full">
                    <BarChart
                        data={data}
                        margin={{ left: 120, right: 24, top: 24, bottom: 24 }}
                        layout="vertical"
                    >
                        <XAxis type="number" tickLine={false} axisLine={false} />
                        <YAxis 
                            type="category" 
                            dataKey="region" 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip 
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null
                                const data = payload[0].payload
                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="text-xs font-bold">{data.region}</div>
                                        <div>Deployments: {data.deployments}</div>
                                    </div>
                                )
                            }}
                        />
                        <Bar
                            dataKey="deployments"
                            fill={chartConfig.deployments.color}
                            radius={[0, 4, 4, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </div>

            {/* Deployment Types Chart */}
            <div>
                <h4 className="text-sm font-medium mb-4">Deployment Types</h4>
                <ChartContainer config={chartConfig} className="w-full">
                    <BarChart
                        data={data.reduce((acc, curr) => {
                            const existing = acc.find(d => d.deployment_type === curr.deployment_type)
                            if (existing) {
                                existing.deployments += curr.deployments
                            } else {
                                acc.push({
                                    deployment_type: curr.deployment_type,
                                    deployments: curr.deployments
                                })
                            }
                            return acc
                        }, [] as any[])}
                        margin={{ left: 120, right: 24, top: 24, bottom: 24 }}
                        layout="vertical"
                    >
                        <XAxis type="number" tickLine={false} axisLine={false} />
                        <YAxis 
                            type="category" 
                            dataKey="deployment_type" 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip 
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null
                                const data = payload[0].payload
                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="text-xs font-bold">{data.deployment_type}</div>
                                        <div>Deployments: {data.deployments}</div>
                                    </div>
                                )
                            }}
                        />
                        <Bar
                            dataKey="deployments"
                            fill={chartConfig.deployments.color}
                            radius={[0, 4, 4, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </div>

            {/* Plans Chart */}
            <div>
                <h4 className="text-sm font-medium mb-4">Plans</h4>
                <ChartContainer config={chartConfig} className="w-full">
                    <BarChart
                        data={data.reduce((acc, curr) => {
                            const existing = acc.find(d => d.plan === curr.plan)
                            if (existing) {
                                existing.deployments += curr.deployments
                            } else {
                                acc.push({
                                    plan: curr.plan,
                                    deployments: curr.deployments
                                })
                            }
                            return acc
                        }, [] as any[])}
                        margin={{ left: 120, right: 24, top: 24, bottom: 24 }}
                        layout="vertical"
                    >
                        <XAxis type="number" tickLine={false} axisLine={false} />
                        <YAxis 
                            type="category" 
                            dataKey="plan" 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip 
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null
                                const data = payload[0].payload
                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="text-xs font-bold">{data.plan}</div>
                                        <div>Deployments: {data.deployments}</div>
                                    </div>
                                )
                            }}
                        />
                        <Bar
                            dataKey="deployments"
                            fill={chartConfig.deployments.color}
                            radius={[0, 4, 4, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </div>
        </div>
    )
} 