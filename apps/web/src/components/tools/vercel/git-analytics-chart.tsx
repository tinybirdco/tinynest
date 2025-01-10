import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartConfig } from '@/components/ui/chart'

interface GitData {
    author: string
    commits: number
    github_repo?: string
    gitlab_repo?: string
}

const chartConfig = {
    commits: {
        color: "hsl(var(--primary))",
        label: "Commits",
    },
} satisfies ChartConfig

function transformData(data: GitData[]): (GitData & { fill: string })[] {
    return data.map((item, index) => ({
        ...item,
        fill: `hsl(var(--chart-${(index % 12) + 1}))`
    }));
}

export function GitAnalyticsChart({ data, isLoading, className }: {
    data: GitData[]
    isLoading: boolean
    className?: string
}) {
    if (isLoading) return <div className={`flex items-center justify-center ${className}`}>Loading...</div>
    if (!data.length) return <div className={`flex items-center justify-center ${className}`}>No data available</div>

    data = transformData(data)

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
                    dataKey="author" 
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
                                <div className="text-xs font-bold">{data.author}</div>
                                <div>Commits: {data.commits}</div>
                                {data.github_repo && <div>Repo: {data.github_repo}</div>}
                                {data.gitlab_repo && <div>Repo: {data.gitlab_repo}</div>}
                            </div>
                        )
                    }}
                />
                <Bar
                    dataKey="commits"
                    fill={chartConfig.commits.color}
                    radius={[0, 4, 4, 0]}
                />
            </BarChart>
        </ChartContainer>
    )
} 