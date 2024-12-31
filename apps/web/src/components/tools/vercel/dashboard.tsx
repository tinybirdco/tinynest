"use client"

import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { addDays, format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { pipe } from '@/lib/tinybird'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeRange } from '@/components/tools/shared/time-range'
import MetricCard from '@/components/tools/shared/metric-card'
import { DeploymentsChart } from './deployments-chart'
import { DurationChart } from './duration-chart'
import { ProjectsChart } from './projects-chart'
import { GitAnalyticsChart } from './git-analytics-chart'
import { InfrastructureChart } from './infrastructure-chart'

interface GitData {
    analytics: any[]
    distribution: any[]
    branches: any[]
}

export default function VercelDashboard() {
    const [token] = useQueryState('token')
    const [timeRange, setTimeRange] = useState('daily')
    const [dateRange, setDateRange] = useState<DateRange>({
        from: addDays(new Date(), -7),
        to: new Date()
    })
    
    const [isLoading, setIsLoading] = useState(true)
    const [metrics, setMetrics] = useState<any>()
    const [deploymentsData, setDeploymentsData] = useState<any[]>([])
    const [durationData, setDurationData] = useState<any[]>([])
    const [projectsData, setProjectsData] = useState<any[]>([])
    const [gitData, setGitData] = useState<GitData>({
        analytics: [],
        distribution: [],
        branches: []
    })
    const [infraData, setInfraData] = useState<any[]>([])

    useEffect(() => {
        async function fetchData() {
            if (!token) return

            const params = {
                time_range: timeRange,
                ...(dateRange?.from && { date_from: format(dateRange.from, 'yyyy-MM-dd HH:mm:ss') }),
                ...(dateRange?.to && { date_to: format(dateRange.to, 'yyyy-MM-dd 23:59:59') })
            }

            try {
                setIsLoading(true)
                const [
                    metricsResult,
                    deploymentsResult,
                    durationResult,
                    projectsResult,
                    gitAnalyticsResult,
                    gitDistributionResult,
                    branchResult,
                    infraResult
                ] = await Promise.all([
                    pipe(token, 'vercel_deployment_metrics', params),
                    pipe(token, 'vercel_deployments_over_time', params),
                    pipe(token, 'vercel_deployment_duration', params),
                    pipe(token, 'vercel_project_stats', params),
                    pipe(token, 'vercel_git_analytics', params),
                    pipe(token, 'vercel_git_distribution', params),
                    pipe(token, 'vercel_branch_distribution', params),
                    pipe(token, 'vercel_infrastructure_stats', params)
                ])

                setMetrics(metricsResult?.data?.[0])
                setDeploymentsData(deploymentsResult?.data ?? [])
                setDurationData(durationResult?.data ?? [])
                setProjectsData(projectsResult?.data ?? [])
                setGitData({
                    analytics: gitAnalyticsResult?.data ?? [],
                    distribution: gitDistributionResult?.data ?? [],
                    branches: branchResult?.data ?? []
                })
                setInfraData(infraResult?.data ?? [])
            } catch (error) {
                console.error('Failed to fetch data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [token, timeRange, dateRange])

    return (
        <div className="space-y-8">
            <TimeRange
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                dateRange={dateRange}
                onDateRangeChange={(range) => setDateRange(range || { from: addDays(new Date(), -7), to: new Date() })}
                className="mb-8"
            />

            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-4">
                <MetricCard
                    title="Total Deployments"
                    value={metrics?.total_deployments ?? 'N/A'}
                />
                <MetricCard
                    title="Success Rate"
                    value={metrics?.success_rate ? `${metrics.success_rate}%` : 'N/A'}
                />
                <MetricCard
                    title="Average Deploy Time"
                    value={durationData.length > 0 ? `${Math.round(durationData.reduce((acc, curr) => acc + curr.avg_duration, 0) / durationData.length)}s` : 'N/A'}
                />
                <MetricCard
                    title="Error Rate"
                    value={metrics?.error_rate ? `${metrics.error_rate}%` : 'N/A'}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Deployments Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DeploymentsChart 
                            data={deploymentsData} 
                            isLoading={isLoading}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Deploy Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DurationChart data={durationData} />
                    </CardContent>
                </Card>
            </div>

            {/* Tables and Additional Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProjectsChart 
                            data={projectsData} 
                            isLoading={isLoading}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Git Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GitAnalyticsChart 
                            data={gitData.analytics} 
                            isLoading={isLoading}
                        />
                    </CardContent>
                </Card>

                {/* <Card>
                    <CardHeader>
                        <CardTitle>Infrastructure</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InfrastructureChart 
                            data={infraData} 
                            isLoading={isLoading}
                        />
                    </CardContent>
                </Card> */}
            </div>
        </div>
    )
}
