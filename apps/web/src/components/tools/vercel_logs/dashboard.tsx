"use client"

import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { pipe } from '@/lib/tinybird'
import { StatusDistributionChart } from './status-distribution-chart'
import { ErrorsChart } from './errors-chart'
import { CacheStatsChart } from './cache-stats-chart'
import { ResponseTimesChart } from './response-times-chart'
import { TopPathsTable } from './top-paths-table'
import { VercelFilters } from './filters'

export default function VercelLogsDashboard() {
    const [token] = useQueryState('token')
    const [environment, setEnvironment] = useState('')
    const [host, setHost] = useState('')
    const [project, setProject] = useState('')
    const [eventType, setEventType] = useState('')
    const [source, setSource] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [requestsData, setRequestsData] = useState<any[]>([])
    const [errorsData, setErrorsData] = useState<any[]>([])
    const [responseTimesData, setResponseTimesData] = useState<any[]>([])
    const [topPathsData, setTopPathsData] = useState<any[]>([])
    const [cacheStatsData, setCacheStatsData] = useState<any[]>([])
    const [topPathsPage, setTopPathsPage] = useState(0)
    const [topPathsLoading, setTopPathsLoading] = useState(false)

    const fetchTopPaths = async () => {
        if (!token) return

        const params = {
            environment,
            host,
            project,
            event_type: eventType,
            source,
            page: topPathsPage,
            page_size: 100
        }

        try {
            setTopPathsLoading(true)
            const result = await pipe(token, 'vercel_top_paths', params)
            setTopPathsData(result?.data ?? [])
        } catch (error) {
            console.error('Failed to fetch top paths:', error)
        } finally {
            setTopPathsLoading(false)
        }
    }

    const fetchMetrics = async () => {
        if (!token) return

        const params = {
            environment,
            host,
            project,
            event_type: eventType,
            source
        }

        try {
            setIsLoading(true)
            const [
                requestsResult,
                errorsResult,
                cacheStatsResult,
                responseTimesResult,
            ] = await Promise.all([
                pipe(token, 'vercel_requests_by_status', params),
                pipe(token, 'vercel_errors', params),
                pipe(token, 'vercel_cache_stats', params),
                pipe(token, 'vercel_response_times', params),
            ])

            setRequestsData(requestsResult?.data ?? [])
            setErrorsData(errorsResult?.data ?? [])
            setCacheStatsData(cacheStatsResult?.data ?? [])
            setResponseTimesData(responseTimesResult?.data ?? [])
        } catch (error) {
            console.error('Failed to fetch metrics:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMetrics()
    }, [token, environment, host, project, eventType, source])

    useEffect(() => {
        fetchTopPaths()
    }, [token, environment, host, project, eventType, source, topPathsPage])

    return (
        <div className="space-y-8">
            <VercelFilters 
                token={token ?? ''} 
                className="mb-8"
                environment={environment}
                host={host}
                project={project}
                eventType={eventType}
                source={source}
                onEnvironmentChange={setEnvironment}
                onHostChange={setHost}
                onProjectChange={setProject}
                onEventTypeChange={setEventType}
                onSourceChange={setSource}
            />
            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "Loading..." : requestsData.reduce((acc, curr) => acc + curr.count, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "Loading..." : `${Math.round(requestsData.find(d => d.status === 200)?.percentage ?? 0)}%`}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Error Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {isLoading ? "Loading..." : `${Math.round(errorsData[0]?.error_rate ?? 0)}%`}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Paths</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TopPathsTable 
                            data={topPathsData}
                            isLoading={topPathsLoading}
                            className="h-[300px]"
                            page={topPathsPage}
                            onPageChange={setTopPathsPage}
                        />
                    </CardContent>
                </Card>
                {/* <Card>
                    <CardHeader>
                        <CardTitle>Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatusDistributionChart 
                            data={requestsData}
                            isLoading={isLoading}
                            className="h-[300px]"
                        />
                    </CardContent>
                </Card> */}
                <Card>
                    <CardHeader>
                        <CardTitle>Error Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ErrorsChart 
                            data={errorsData}
                            isLoading={isLoading}
                            className="h-[300px]"
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Cache Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CacheStatsChart 
                            data={cacheStatsData}
                            isLoading={isLoading}
                            className="h-[300px]"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Response Times</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponseTimesChart 
                            data={responseTimesData}
                            isLoading={isLoading}
                            className="h-[300px]"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
