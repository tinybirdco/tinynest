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
import { startOfDay, endOfDay, format } from 'date-fns'

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

    useEffect(() => {
        async function fetchMetrics() {
            if (!token) return

            const fromDate = format(dateRange.from, "yyyy-MM-dd HH:mm:ss")
            const toDate = format(dateRange.to, "yyyy-MM-dd HH:mm:ss")
            const thirtyDaysAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd HH:mm:ss")

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
                    authMechResult,
                    dailySignupsResult,
                    dailyLoginFailsResult
                ] = await Promise.all([
                    pipe<UsersResult>(token, 'auth0_users_total'),
                    pipe(token, 'auth0_applications'),
                    pipe(token, 'auth0_apis'),
                    pipe(token, 'auth0_connections'),
                    pipe(token, 'auth0_signups', {
                        date_from: thirtyDaysAgo
                    }),
                    pipe(token, 'auth0_mau', {
                        date_from: thirtyDaysAgo
                    }),
                    pipe<ConversionRateResult>(token, 'auth0_conversion_rate', {
                        date_from: thirtyDaysAgo
                    }),
                    pipe<{ data: DauDataPoint[] }>(token, 'auth0_dau_ts', {
                        date_from: fromDate,
                        date_to: toDate
                    }),
                    pipe<{ data: AuthMechDataPoint[] }>(token, 'auth0_mech_usage', {
                        date_from: fromDate,
                        date_to: toDate
                    }),
                    pipe<{ data: DailySignupsDataPoint[] }>(token, 'auth0_daily_signups', {
                        date_from: fromDate,
                        date_to: toDate
                    }),
                    pipe<{ data: DailyLoginFailsDataPoint[] }>(token, 'auth0_daily_login_fails', {
                        date_from: fromDate,
                        date_to: toDate
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
            } catch (error) {
                console.error('Failed to fetch metrics:', error)
            }
        }

        fetchMetrics()
    }, [token, dateRange])

    return (
        <div className="space-y-8">
            {/* Top row - Total metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Users"
                    value={summaryMetrics.total_users}
                />
                <MetricCard
                    title="Applications"
                    value={summaryMetrics.total_applications}
                />
                <MetricCard
                    title="APIs"
                    value={summaryMetrics.total_apis}
                />
                <MetricCard
                    title="Connections"
                    value={summaryMetrics.total_connections}
                />
            </div>

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

            {/* Date Range Picker */}
            <div className="flex justify-end">
                <DateRangePicker
                    initialDateRange={dateRange}
                    onChange={(newRange) => setDateRange(newRange)}
                />
            </div>

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