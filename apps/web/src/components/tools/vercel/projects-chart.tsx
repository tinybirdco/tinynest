import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartConfig } from '@/components/ui/chart'

interface ProjectData {
    project_name: string
    total_deployments: number
    error_rate: number
}

const chartConfig = {
    total_deployments: {
        color: "hsl(var(--primary))",
        label: "Total Deployments",
    },
    error_rate: {
        color: "hsl(0 84.2% 60.2%)",
        label: "Error Rate %",
    },
} satisfies ChartConfig

export function ProjectsChart({ data, isLoading, className }: {
    data: ProjectData[]
    isLoading: boolean
    className?: string
}) {
    if (isLoading) return <div className={`flex items-center justify-center ${className}`}>Loading...</div>
    if (!data.length) return <div className={`flex items-center justify-center ${className}`}>No data available</div>

    return (
        <ChartContainer config={chartConfig} className={`w-full ${className}`}>
            <BarChart
                data={data}
                margin={{ left: 24, right: 24, top: 24, bottom: 24 }}
                layout="vertical"
            >
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis 
                    type="category" 
                    dataKey="project_name" 
                    tickLine={false} 
                    axisLine={false} 
                    width={150}
                />
                <ChartTooltip 
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0].payload
                        return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="text-xs font-bold">{data.project_name}</div>
                                <div>Deployments: {data.total_deployments}</div>
                                <div>Error Rate: {data.error_rate}%</div>
                            </div>
                        )
                    }}
                />
                <Bar
                    dataKey="total_deployments"
                    fill={chartConfig.total_deployments.color}
                    radius={[0, 4, 4, 0]}
                />
            </BarChart>
        </ChartContainer>
    )
} 