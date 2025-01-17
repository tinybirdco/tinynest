"use client"

import { useQueryState } from 'nuqs'
import { useEffect, useState, useCallback } from 'react'
import { pipe } from '@/lib/tinybird'
import MetricCard from '@/components/metric-card'
import { Auth0Dau } from './dau-chart'
import { Auth0TopAuth } from './auth-mech-chart'
import { Auth0TopBrowsers } from './top-browsers-chart'
import { Auth0TopDevices } from './top-devices-chart'
import { Auth0DailySignups } from './daily-signups-chart'
import { Auth0DailyLoginFails } from './daily-login-fails-chart'
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker'
import { startOfDay, endOfDay, format } from 'date-fns'
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
import { Auth0UserRetention } from './user-retention-chart'
import { LogsTable } from './logs-table'
import { Auth0TopDomains } from './top-domains-chart'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Auth0CumulativeSignups } from './cumulative-signups-chart'

interface SummaryMetrics {
    total_users: number
    total_applications: number
    total_apis: number
    total_connections: number
    monthly_signups: number
    monthly_active_users: number
    conversion_rate: number
}

interface LogEntry {
    event_time: string
    event_type: string
    description: string
    id: string
    connection: string
    application: string
}

export default function Auth0Dashboard() {
    const [token] = useQueryState('token')
    const [dateRange, setDateRange] = useState<DateRange>({
        from: startOfDay(new Date(new Date().setDate(new Date().getDate() - 30))),
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
    const [selectedApp, setSelectedApp] = useState<string>('all')
    const [selectedConnection, setSelectedConnection] = useState<string>('all')
    const [applications, setApplications] = useState<Array<{ client_id: string, client_name: string }>>([])
    const [connections, setConnections] = useState<Array<{ connection_id: string, connection_name: string }>>([])
    const [timeRange, setTimeRange] = useState<'hourly' | 'daily' | 'monthly'>('daily')
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [logsPage, setLogsPage] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [logsFilters, setLogsFilters] = useState({
        eventType: 'all',
        connection: 'all',
        clientName: 'all',
        tenant: 'all'
    })
    const [logsDateRange, setLogsDateRange] = useState<DateRange>({
        from: startOfDay(new Date(new Date().setDate(new Date().getDate() - 7))),
        to: endOfDay(new Date())
    })
    const [selectedTenant, setSelectedTenant] = useState<string>('all')
    const [tenants, setTenants] = useState<Array<{ tenant_name: string }>>([])
    const [isDomainsOpen, setIsDomainsOpen] = useState(false)

    useEffect(() => {
        async function fetchInitialData() {
            if (!token) return
            try {
                const [appsResult, connsResult, tenantsResult] = await Promise.all([
                    pipe<{ data: Array<{ client_id: string, client_name: string }> }>(
                        token, 
                        'auth0_applications'
                    ),
                    pipe<{ data: Array<{ connection_id: string, connection_name: string }> }>(
                        token, 
                        'auth0_connections'
                    ),
                    pipe<{ data: Array<{ tenant_name: string }> }>(
                        token,
                        'auth0_tenants'
                    )
                ])
                setApplications(appsResult.data ?? [])
                setConnections(connsResult.data ?? [])
                setTenants(tenantsResult.data ?? [])
            } catch (error) {
                console.error('Failed to fetch initial data:', error)
            }
        }
        fetchInitialData()
    }, [token])

    useEffect(() => {
        fetchMetrics()
    }, [token, dateRange.from, dateRange.to, selectedApp, selectedConnection, timeRange, logsPage, selectedTenant])

    const fetchMetrics = async () => {
        if (!token) return
        setIsLoading(true)
        try {
            const fromDate = dateRange.from ? format(dateRange.from, "yyyy-MM-dd HH:mm:ss") : format(new Date(), "yyyy-MM-dd HH:mm:ss")
            const toDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd HH:mm:ss") : format(new Date(), "yyyy-MM-dd HH:mm:ss")

            const baseParams = {
                date_from: fromDate,
                date_to: toDate,
                time_range: timeRange,
                ...(selectedApp !== 'all' && { client_id: selectedApp }),
                ...(selectedConnection !== 'all' && { connection_id: selectedConnection }),
                ...(selectedTenant !== 'all' && { tenant_name: selectedTenant })
            }

            const [
                usersResult,
                applicationsResult,
                apisResult,
                connectionsResult,
                monthlySignupsResult,
                monthlyActiveUsersResult,
                conversionRateResult,
                logsResult
            ] = await Promise.all([
                pipe(token, 'auth0_users_total', baseParams),
                pipe(token, 'auth0_applications', baseParams),
                pipe(token, 'auth0_apis', baseParams),
                pipe(token, 'auth0_connections', baseParams),
                pipe(token, 'auth0_signups', baseParams),
                pipe(token, 'auth0_mau', baseParams),
                pipe(token, 'auth0_conversion_rate', baseParams),
                pipe<{ data: LogEntry[] }>(token, 'auth0_logs', {
                    ...baseParams,
                    page: logsPage,
                    ...(logsFilters.eventType !== 'all' && { event_type: logsFilters.eventType }),
                    ...(logsFilters.connection !== 'all' && { connection: logsFilters.connection }),
                    ...(logsFilters.clientName !== 'all' && { client_name: logsFilters.clientName }),
                    ...(logsFilters.tenant !== 'all' && { tenant_name: logsFilters.tenant })
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
            setLogs(logsResult?.data ?? [])
        } catch (error) {
            console.error('Failed to fetch metrics:', error)
        } finally {
            setIsLoading(false)
        }
    }

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
                ...(logsFilters.clientName !== 'all' && { client_name: logsFilters.clientName }),
                ...(logsFilters.tenant !== 'all' && { tenant_name: logsFilters.tenant })
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
                    <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select tenant" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tenants</SelectItem>
                            {tenants.map((tenant) => (
                                <SelectItem key={tenant.tenant_name} value={tenant.tenant_name}>
                                    {tenant.tenant_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

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
                    isLoading={isLoading}
                />
                <MetricCard
                    title="Monthly Active Users"
                    value={summaryMetrics.monthly_active_users}
                    isLoading={isLoading}
                />
                <MetricCard
                    title="New Signups Rate"
                    value={`${summaryMetrics.conversion_rate}%`}
                    isLoading={isLoading}
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Cumulative Signups</CardTitle>
                </CardHeader>
                <CardContent>
                    <Auth0CumulativeSignups 
                        client_id={selectedApp}
                        connection_id={selectedConnection}
                        tenant_name={selectedTenant}
                        token={token ?? ''}
                        date_from={dateRange.from ? format(dateRange.from, "yyyy-MM-dd HH:mm:ss") : undefined}
                        date_to={dateRange.to ? format(dateRange.to, "yyyy-MM-dd HH:mm:ss") : undefined}
                    />
                </CardContent>
            </Card>

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
                <Card>
                    <CardHeader>
                        <CardTitle>Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Auth0Dau 
                            client_id={selectedApp}
                            connection_id={selectedConnection}
                            tenant_name={selectedTenant}
                            token={token ?? ''}
                            date_from={dateRange.from ? format(dateRange.from, "yyyy-MM-dd HH:mm:ss") : undefined}
                            date_to={dateRange.to ? format(dateRange.to, "yyyy-MM-dd HH:mm:ss") : undefined}
                            time_range={timeRange}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Retention</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Auth0UserRetention 
                            token={token ?? ''}
                            date_from={dateRange.from ? format(dateRange.from, "yyyy-MM-dd HH:mm:ss") : undefined}
                            date_to={dateRange.to ? format(dateRange.to, "yyyy-MM-dd HH:mm:ss") : undefined}
                            time_range={timeRange}
                            client_id={selectedApp}
                            connection_id={selectedConnection}
                            tenant_name={selectedTenant}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Signups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Auth0DailySignups 
                            client_id={selectedApp}
                            connection_id={selectedConnection}
                            tenant_name={selectedTenant}
                            token={token ?? ''}
                            date_from={dateRange.from ? format(dateRange.from, "yyyy-MM-dd HH:mm:ss") : undefined}
                            date_to={dateRange.to ? format(dateRange.to, "yyyy-MM-dd HH:mm:ss") : undefined}
                            time_range={timeRange}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Auth Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Auth0TopAuth 
                            client_id={selectedApp}
                            connection_id={selectedConnection}
                            tenant_name={selectedTenant}
                            token={token ?? ''}
                            date_from={dateRange.from ? format(dateRange.from, "yyyy-MM-dd HH:mm:ss") : undefined}
                            date_to={dateRange.to ? format(dateRange.to, "yyyy-MM-dd HH:mm:ss") : undefined}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Browsers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Auth0TopBrowsers 
                            client_id={selectedApp}
                            connection_id={selectedConnection}
                            tenant_name={selectedTenant}
                            token={token ?? ''}
                            date_from={dateRange.from ? format(dateRange.from, "yyyy-MM-dd HH:mm:ss") : undefined}
                            date_to={dateRange.to ? format(dateRange.to, "yyyy-MM-dd HH:mm:ss") : undefined}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Devices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Auth0TopDevices 
                            client_id={selectedApp}
                            connection_id={selectedConnection}
                            tenant_name={selectedTenant}
                            token={token ?? ''}
                            date_from={dateRange.from ? format(dateRange.from, "yyyy-MM-dd HH:mm:ss") : undefined}
                            date_to={dateRange.to ? format(dateRange.to, "yyyy-MM-dd HH:mm:ss") : undefined}
                        />
                    </CardContent>
                </Card>
            </div>
            <Collapsible open={isDomainsOpen} onOpenChange={setIsDomainsOpen}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Top Domains</CardTitle>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    {isDomainsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent>
                            <Auth0TopDomains 
                                client_id={selectedApp}
                                connection_id={selectedConnection}
                                tenant_name={selectedTenant}
                                token={token ?? ''}
                                date_from={dateRange.from ? format(dateRange.from, "yyyy-MM-dd HH:mm:ss") : undefined}
                                date_to={dateRange.to ? format(dateRange.to, "yyyy-MM-dd HH:mm:ss") : undefined}
                            />
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
            <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Login Fails</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Auth0DailyLoginFails 
                            client_id={selectedApp}
                            connection_id={selectedConnection}
                            tenant_name={selectedTenant}
                            token={token ?? ''}
                            date_from={dateRange.from ? format(dateRange.from, "yyyy-MM-dd HH:mm:ss") : undefined}
                            date_to={dateRange.to ? format(dateRange.to, "yyyy-MM-dd HH:mm:ss") : undefined}
                            time_range={timeRange}
                        />
                    </CardContent>
                </Card>
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
                        tenants={tenants}
                        onPageChange={(newPage) => {
                            setLogsPage(newPage)
                        }}
                        onFiltersChange={(filters) => {
                            if (filters.dateRange) setLogsDateRange(filters.dateRange)
                            if (filters.eventType) setLogsFilters(prev => ({ ...prev, eventType: filters.eventType as string }))
                            if (filters.connection) setLogsFilters(prev => ({ ...prev, connection: filters.connection as string }))
                            if (filters.clientName) setLogsFilters(prev => ({ ...prev, clientName: filters.clientName as string }))
                            if (filters.tenant) setLogsFilters(prev => ({ ...prev, tenant: filters.tenant as string }))
                            setLogsPage(0)
                        }}
                    />
                </CardContent>
            </Card>
            
        </div>
    )
}