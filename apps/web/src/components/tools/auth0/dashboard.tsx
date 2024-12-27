"use client"

import { useQueryState } from 'nuqs'
import { useEffect, useState, useCallback } from 'react'
import { pipe } from '@/lib/tinybird'
import MetricCard from './metric'
import { DauChart, DauDataPoint } from './dau-chart'
import { AuthMechChart, AuthMechDataPoint } from './auth-mech-chart'
import { DailySignupsChart, DailySignupsDataPoint } from './daily-signups-chart'
import { DailyLoginFailsChart, DailyLoginFailsDataPoint } from './daily-login-fails-chart'
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker'
import { startOfDay, endOfDay, format, subDays } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserRetentionChart, UserRetentionDataPoint } from './user-retention-chart'
import { LogsTable } from './logs-table'

interface SummaryMetrics {
    total_users: number
    total_applications: number
    total_apis: number
    total_connections: number
    monthly_signups: number
    monthly_active_users: number
    conversion_rate: number
}

interface UsersResult {
    data: { total_users: number }[]
}

interface ConversionRateResult {
    data: { conversion_rate: number }[]
}

interface LogEntry {
  timestamp: string
  type: string
  description: string
  id: string
  connection: string
  application: string
}

export default function Auth0Dashboard() {
    const [token] = useQueryState('token')
    const [dateRange, setDateRange] = useState<DateRange>({
        from: startOfDay(new Date(new Date().setDate(new Date().getDate() - 7))),
        to: endOfDay(new Date())
    })
    const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetrics>({
        total_users: 0,
        total_applications: 0,
        total_apis: 0,
        total_connections: 0,
        monthly_signups: 0,
        monthly_active_users: 0,
        conversion_rate: 0
    })
    const [dauData, setDauData] = useState<DauDataPoint[]>([])
    const [authMechData, setAuthMechData] = useState<AuthMechDataPoint[]>([])
    const [dailySignupsData, setDailySignupsData] = useState<DailySignupsDataPoint[]>([])
    const [dailyLoginFailsData, setDailyLoginFailsData] = useState<DailyLoginFailsDataPoint[]>([])
    const [selectedApp, setSelectedApp] = useState<string>('all')
    const [selectedConnection, setSelectedConnection] = useState<string>('all')
    const [applications, setApplications] = useState<Array<{ client_id: string, client_name: string }>>([])
    const [connections, setConnections] = useState<Array<{ connection_id: string, connection_name: string }>>([])
    const [timeRange, setTimeRange] = useState<'hourly' | 'daily' | 'monthly'>('daily')
    const [userRetentionData, setUserRetentionData] = useState<UserRetentionDataPoint[]>([])
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [logsPage, setLogsPage] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [logsFilters, setLogsFilters] = useState({
        eventType: 'all',
        connection: 'all',
        clientName: 'all'
    })
    const [logsDateRange, setLogsDateRange] = useState<DateRange>({
        from: startOfDay(new Date(new Date().setDate(new Date().getDate() - 7))),
        to: endOfDay(new Date())
    })

    useEffect(() => {
        async function fetchInitialData() {
            if (!token) return
            try {
                const [appsResult, connsResult] = await Promise.all([
                    pipe<{ data: Array<{ client_id: string, client_name: string }> }>(
                        token, 
                        'auth0_applications'
                    ),
                    pipe<{ data: Array<{ id: string, connection_name: string }> }>(
                        token, 
                        'auth0_connections'
                    )
                ])
                setApplications(appsResult.data ?? [])
                setConnections(connsResult.data ?? [])
            } catch (error) {
                console.error('Failed to fetch initial data:', error)
            }
        }
        fetchInitialData()
    }, [token])

    useEffect(() => {
        let mounted = true

        async function fetchMetrics() {
            if (!token) return
            setIsLoading(true)
            try {
                const fromDate = format(dateRange.from, "yyyy-MM-dd HH:mm:ss")
                const toDate = format(dateRange.to, "yyyy-MM-dd HH:mm:ss")
                const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd HH:mm:ss")

                const params = {
                    date_from: fromDate,
                    date_to: toDate,
                    time_range: timeRange,
                    ...(selectedApp !== 'all' && { client_id: selectedApp }),
                    ...(selectedConnection !== 'all' && { connection_id: selectedConnection })
                }

                const thirtyDayParams = {
                    date_from: thirtyDaysAgo,
                    time_range: timeRange,
                    ...(selectedApp !== 'all' && { client_id: selectedApp }),
                    ...(selectedConnection !== 'all' && { connection_id: selectedConnection })
                }

                const [
                    usersResult,
                    applicationsResult,
                    apisResult,
                    connectionsResult,
                    monthlySignupsResult,
                    monthlyActiveUsersResult,
                    conversionRateResult,
                    userRetentionTimeSeriesResult,
                    dauResult,
                    authMechResult,
                    dailySignupsResult,
                    dailyLoginFailsResult,
                    logsResult
                ] = await Promise.all([
                    pipe<UsersResult>(token, 'auth0_users_total', selectedApp !== 'all' || selectedConnection !== 'all' ? {
                        time_range: timeRange,
                        ...(selectedApp !== 'all' && { client_id: selectedApp }),
                        ...(selectedConnection !== 'all' && { connection_id: selectedConnection })
                    } : undefined),
                    pipe(token, 'auth0_applications'),
                    pipe(token, 'auth0_apis'),
                    pipe(token, 'auth0_connections'),
                    pipe(token, 'auth0_signups', thirtyDayParams),
                    pipe(token, 'auth0_mau', thirtyDayParams),
                    pipe<ConversionRateResult>(token, 'auth0_conversion_rate', thirtyDayParams),
                    pipe<{ data: UserRetentionDataPoint[] }>(token, 'auth0_user_retention_ts', params),
                    pipe<{ data: DauDataPoint[] }>(token, 'auth0_dau_ts', params),
                    dateRange.compareMode ? pipe<{ data: DauDataPoint[] }>(token, 'auth0_dau_ts', {
                        ...params,
                        date_from: comparisonFromDate,
                        date_to: comparisonToDate
                    }) : Promise.resolve({ data: [] }),
                    pipe<{ data: AuthMechDataPoint[] }>(token, 'auth0_mech_usage', params),
                    pipe<{ data: DailySignupsDataPoint[] }>(token, 'auth0_daily_signups', params),
                    pipe<{ data: DailyLoginFailsDataPoint[] }>(token, 'auth0_daily_login_fails', params),
                    pipe<{ data: LogEntry[] }>(token, 'auth0_logs', {
                        page: logsPage,
                        date_from: format(logsDateRange.from, "yyyy-MM-dd HH:mm:ss"),
                        date_to: format(logsDateRange.to, "yyyy-MM-dd HH:mm:ss"),
                        ...(logsFilters.eventType !== 'all' && { event_type: logsFilters.eventType }),
                        ...(logsFilters.connection !== 'all' && { connection: logsFilters.connection }),
                        ...(logsFilters.clientName !== 'all' && { client_name: logsFilters.clientName })
                    })
                ])

                setSummaryMetrics({
                    total_users: usersResult?.data?.[0]?.total_users ?? 0,
                    total_applications: applicationsResult?.data?.length ?? 0,
                    total_apis: apisResult?.data?.length ?? 0,
                    total_connections: connectionsResult?.data?.length ?? 0,
                    monthly_signups: monthlySignupsResult?.data?.[0]?.total ?? 0,
                    monthly_active_users: monthlyActiveUsersResult?.data?.[0]?.active ?? 0,
                    conversion_rate: conversionRateResult?.data?.[0]?.conversion_rate ?? 0
                })

                setDauData(dauResult?.data ?? [])
                setAuthMechData(authMechResult?.data ?? [])
                setDailySignupsData(dailySignupsResult?.data ?? [])
                setDailyLoginFailsData(dailyLoginFailsResult?.data ?? [])
                setUserRetentionData(userRetentionTimeSeriesResult?.data ?? [])
                setLogs(logsResult?.data ?? [])
            } catch (error) {
                console.error('Failed to fetch metrics:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMetrics()
        return () => {
            mounted = false
        }
    }, [token, dateRange.from, dateRange.to, dateRange.compareMode, selectedApp, selectedConnection, timeRange, logsPage])

    const fetchLogs = useCallback(async () => {
        if (!token || !logsDateRange?.from || !logsDateRange?.to) return
        setIsLoading(true)
        try {
            const logsResult = await pipe<{ data: LogEntry[] }>(token, 'auth0_logs', {
                page: logsPage,
                date_from: format(new Date(logsDateRange.from), "yyyy-MM-dd HH:mm:ss"),
                date_to: format(new Date(logsDateRange.to), "yyyy-MM-dd HH:mm:ss"),
                ...(logsFilters.eventType !== 'all' && { event_type: logsFilters.eventType }),
                ...(logsFilters.connection !== 'all' && { connection: logsFilters.connection }),
                ...(logsFilters.clientName !== 'all' && { client_name: logsFilters.clientName })
            })
            setLogs(logsResult?.data ?? [])
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        } finally {
            setIsLoading(false)
        }
    }, [token, logsPage, logsDateRange, logsFilters])

    useEffect(() => {
        fetchLogs()
    }, [logsPage, logsDateRange, logsFilters, fetchLogs])

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center gap-4">
                <div className="flex gap-2">
                    <Select value={selectedApp} onValueChange={setSelectedApp}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select application" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Applications</SelectItem>
                            {applications.map((app) => (
                                <SelectItem key={app.client_id} value={app.client_id}>
                                    {app.client_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedConnection} onValueChange={setSelectedConnection}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select connection" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Connections</SelectItem>
                            {connections.map((conn) => (
                                <SelectItem key={conn.connection_id} value={conn.connection_id}>
                                    {conn.connection_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Top row - Total metrics */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Total Users</span>
                            <span className="text-2xl font-bold">{summaryMetrics.total_users}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Applications</span>
                            <span className="text-2xl font-bold">{summaryMetrics.total_applications}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">APIs</span>
                            <span className="text-2xl font-bold">{summaryMetrics.total_apis}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Connections</span>
                            <span className="text-2xl font-bold">{summaryMetrics.total_connections}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Second row - Monthly metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                    title="Monthly Sign Ups"
                    value={summaryMetrics.monthly_signups}
                    description="New users signed up in the last 30 days"
                />
                <MetricCard
                    title="Monthly Active Users"
                    value={summaryMetrics.monthly_active_users}
                    description="Users active in the last 30 days"
                />
                <MetricCard
                    title="New Signups Rate"
                    value={`${summaryMetrics.conversion_rate}%`}
                    description="New users compared to total users"
                />
            </div>

            <Separator className="my-6" />

            <div className="flex justify-end items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button 
                        variant={timeRange === 'hourly' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('hourly')}
                    >
                        Hourly
                    </Button>
                    <Button 
                        variant={timeRange === 'daily' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('daily')}
                    >
                        Daily
                    </Button>
                    <Button 
                        variant={timeRange === 'monthly' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('monthly')}
                    >
                        Monthly
                    </Button>
                </div>
                <DateRangePicker
                    initialDateRange={dateRange}
                    onChange={(newRange) => setDateRange(newRange)}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 grid-cols-1">
                <DauChart 
                    data={dauData} 
                    comparisonData={dateRange.compareMode ? dauComparisonData : undefined}
                    timeRange={timeRange}
                    className="h-[300px]"
                />
            </div>
            <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2">
                <UserRetentionChart 
                    data={userRetentionData}
                    timeRange={timeRange}
                    className="h-[300px]"
                />
                <DailySignupsChart 
                    data={dailySignupsData}
                    timeRange={timeRange}
                    className="h-[300px]"
                />
            </div>
            <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2">
                <DailyLoginFailsChart 
                    data={dailyLoginFailsData}
                    timeRange={timeRange}
                    className="h-[300px]"
                />
                <AuthMechChart 
                    data={authMechData}
                    className="h-[300px]"
                />
            </div>
            <Separator className="my-6" />
            <Card>
                <CardHeader>
                    <CardTitle>Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <LogsTable 
                        data={logs} 
                        page={logsPage}
                        dateRange={logsDateRange}
                        isLoading={isLoading}
                        connections={connections}
                        applications={applications}
                        onPageChange={(newPage) => {
                            setLogsPage(newPage)
                        }}
                        onFiltersChange={(filters) => {
                            if (filters.dateRange) setLogsDateRange(filters.dateRange)
                            if (filters.eventType) setLogsFilters(prev => ({ ...prev, eventType: filters.eventType }))
                            if (filters.connection) setLogsFilters(prev => ({ ...prev, connection: filters.connection }))
                            if (filters.clientName) setLogsFilters(prev => ({ ...prev, clientName: filters.clientName }))
                            setLogsPage(0)
                        }}
                    />
                </CardContent>
            </Card>
            
        </div>
    )
}