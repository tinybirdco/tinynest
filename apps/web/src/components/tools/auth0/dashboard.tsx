"use client"

import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
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
import { Card, CardContent } from "@/components/ui/card"

interface ConversionData {
    new_signups: number
    active_new_users: number
    conversion_rate: number
}

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

interface ApplicationsResult {
    data: { total_applications: number }[]
}

interface ApisResult {
    data: { total_apis: number }[]
}

interface ConnectionsResult {
    data: { total_connections: number }[]
}

interface MonthlySignupsResult {
    data: { monthly_signups: number }[]
}

interface MonthlyActiveUsersResult {
    data: { active: number }[]
}

interface ConversionRateResult {
    data: { conversion_rate: number }[]
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

            const fromDate = format(dateRange.from, "yyyy-MM-dd HH:mm:ss")
            const toDate = format(dateRange.to, "yyyy-MM-dd HH:mm:ss")
            const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd HH:mm:ss")

            const params = {
                date_from: fromDate,
                date_to: toDate,
                ...(selectedApp !== 'all' && { client_id: selectedApp }),
                ...(selectedConnection !== 'all' && { connection_id: selectedConnection })
            }

            const thirtyDayParams = {
                date_from: thirtyDaysAgo,
                ...(selectedApp !== 'all' && { client_id: selectedApp }),
                ...(selectedConnection !== 'all' && { connection_id: selectedConnection })
            }

            try {
                const [
                    usersResult,
                    applicationsResult,
                    apisResult,
                    connectionsResult,
                    monthlySignupsResult,
                    monthlyActiveUsersResult,
                    conversionRateResult,
                    dauResult,
                    dauComparisonResult,
                    authMechResult,
                    dailySignupsResult,
                    dailyLoginFailsResult
                ] = await Promise.all([
                    pipe<UsersResult>(token, 'auth0_users_total', selectedApp !== 'all' || selectedConnection !== 'all' ? {
                        ...(selectedApp !== 'all' && { client_id: selectedApp }),
                        ...(selectedConnection !== 'all' && { connection_id: selectedConnection })
                    } : undefined),
                    pipe(token, 'auth0_applications'),
                    pipe(token, 'auth0_apis'),
                    pipe(token, 'auth0_connections'),
                    pipe(token, 'auth0_signups', thirtyDayParams),
                    pipe(token, 'auth0_mau', thirtyDayParams),
                    pipe<ConversionRateResult>(token, 'auth0_conversion_rate', thirtyDayParams),
                    pipe<{ data: DauDataPoint[] }>(token, 'auth0_dau_ts', params),
                    dateRange.compareMode ? pipe<{ data: DauDataPoint[] }>(token, 'auth0_dau_ts', {
                        ...params,
                        date_from: comparisonFromDate,
                        date_to: comparisonToDate
                    }) : Promise.resolve({ data: [] }),
                    pipe<{ data: AuthMechDataPoint[] }>(token, 'auth0_mech_usage', params),
                    pipe<{ data: DailySignupsDataPoint[] }>(token, 'auth0_daily_signups', params),
                    pipe<{ data: DailyLoginFailsDataPoint[] }>(token, 'auth0_daily_login_fails', params)
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
            } catch (error) {
                console.error('Failed to fetch metrics:', error)
            }
        }

        fetchMetrics()
        return () => {
            mounted = false
        }
    }, [token, dateRange.from, dateRange.to, dateRange.compareMode, selectedApp, selectedConnection])

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
                    title="Conversion Rate"
                    value={`${summaryMetrics.conversion_rate}%`}
                    description="New users who became active in the last 30 days"
                />
            </div>

            <Separator className="my-6" />

            <div className="flex justify-end">
                <DateRangePicker
                    initialDateRange={dateRange}
                    onChange={(newRange) => setDateRange(newRange)}
                />
            </div>

            <DauChart 
                data={dauData} 
                comparisonData={dateRange.compareMode ? dauComparisonData : undefined} 
            />

            {/* Charts Grid */}
            <div className="grid gap-4 grid-cols-1">
                <DauChart data={dauData} />
            </div>
            <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2">
                <AuthMechChart data={authMechData} />
                <DailySignupsChart data={dailySignupsData} />
            </div>
            <div className="grid gap-4 grid-cols-1">
                <DailyLoginFailsChart data={dailyLoginFailsData} />
            </div>
        </div>
    )
}