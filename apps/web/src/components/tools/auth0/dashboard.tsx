"use client"

import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { pipe } from '@/lib/tinybird'
import MetricCard from './metric'
import { DauChart } from './dau-chart'
import { AuthMechChart } from './auth-mech-chart'

interface DauDataPoint {
    day: string
    active: number
}

interface AuthMechData {
    mech: string
    logins: number
}

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
}

interface UsersResult {
    data: {
        total_users: number
        total_signups: number
        total_active_users: number
        total_failed_users: number
        first_seen: string
        last_seen: string
    }[]
}

export default function Auth0Dashboard() {
    const [token] = useQueryState('token')
    const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetrics>({
        total_users: 0,
        total_applications: 0,
        total_apis: 0,
        total_connections: 0
    })
    const [monthlySignUps, setMonthlySignUps] = useState<number>(0)
    const [monthlyMau, setMonthlyMau] = useState<number>(0)
    const [conversionRate, setConversionRate] = useState<number>(0)
    const [dauData, setDauData] = useState<DauDataPoint[]>([])
    const [authMechData, setAuthMechData] = useState<AuthMechData[]>([])

    useEffect(() => {
        async function fetchMetrics() {
            if (!token) return

            try {
                const [
                    usersResult,
                    applicationsResult,
                    apisResult,
                    connectionsResult,
                    monthlySignUpsResult,
                    monthlyMauResult,
                    dauResult,
                    authMechResult,
                    conversionResult
                ] = await Promise.all([
                    pipe<UsersResult>(token, 'auth0_users_total'),
                    pipe(token, 'auth0_applications'),
                    pipe(token, 'auth0_apis'),
                    pipe(token, 'auth0_connections'),
                    pipe(token, 'auth0_signups'),
                    pipe(token, 'auth0_mau'),
                    pipe<{ data: DauDataPoint[] }>(token, 'auth0_dau_ts'),
                    pipe<{ data: AuthMechData[] }>(token, 'auth0_mech_usage'),
                    pipe<{ data: ConversionData[] }>(token, 'auth0_conversion_rate')
                ])

                setSummaryMetrics({
                    total_users: usersResult?.data?.[0]?.total_users || 0,
                    total_applications: applicationsResult?.data?.length || 0,
                    total_apis: apisResult?.data?.length || 0,
                    total_connections: connectionsResult?.data?.length || 0
                })
                setMonthlySignUps(monthlySignUpsResult.data[0]?.total || 0)
                setMonthlyMau(monthlyMauResult.data[0]?.active || 0)
                setConversionRate(conversionResult.data[0]?.conversion_rate || 0)
                setDauData(dauResult.data)
                setAuthMechData(authMechResult.data)
            } catch (error) {
                console.error('Failed to fetch metrics:', error)
            }
        }

        fetchMetrics()
    }, [token])

    return (
        <div className="space-y-8">
            {/* Summary Card */}
            <div className="grid grid-cols-4 gap-4 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{summaryMetrics.total_users.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Applications</p>
                    <p className="text-2xl font-bold">{summaryMetrics.total_applications.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">APIs</p>
                    <p className="text-2xl font-bold">{summaryMetrics.total_apis.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Connections</p>
                    <p className="text-2xl font-bold">{summaryMetrics.total_connections.toLocaleString()}</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                    title="Monthly Sign Ups"
                    value={monthlySignUps.toLocaleString()}
                    description="New users signed up in the last 30 days"
                />
                <MetricCard
                    title="Monthly Active Users"
                    value={monthlyMau.toLocaleString()}
                    description="Users active in the last 30 days"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${conversionRate}%`}
                    description="New users who became active in the last 30 days"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                <DauChart data={dauData} />
                <AuthMechChart data={authMechData} />
            </div>
        </div>
    )
}