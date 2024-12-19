"use client"

import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function Auth0Dashboard() {
    const [token] = useQueryState('token')
    const [monthlySignUps, setMonthlySignUps] = useState<number>(0)
    const [monthlyMau, setMonthlyMau] = useState<number>(0)
    const [conversionRate, setConversionRate] = useState<number>(0)
    const [dauData, setDauData] = useState<DauDataPoint[]>([])
    const [authMechData, setAuthMechData] = useState<AuthMechData[]>([])

    useEffect(() => {
        async function fetchMetrics() {
            if (!token) return

            try {
                const [monthlySignUpsResult, monthlyMauResult, dauResult, authMechResult] = await Promise.all([
                    pipe(token, 'auth0_signups'),
                    pipe(token, 'auth0_mau'),
                    pipe<{ data: DauDataPoint[] }>(token, 'auth0_dau_ts'),
                    pipe<{ data: AuthMechData[] }>(token, 'auth0_mech_usage')
                ])

                setMonthlySignUps(monthlySignUpsResult.data[0]?.total || 0)
                setMonthlyMau(monthlyMauResult.data[0]?.active || 0)
                setConversionRate(0)
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
            <div>
                <h1 className="text-2xl font-bold">Auth0 Analytics</h1>
                <Link
                    href={token ? `/?token=${token}` : '/'}
                    className="text-sm text-muted-foreground hover:text-primary"
                >
                    ← Back to Apps
                </Link>
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
                    description="Active users / Total users"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                <DauChart data={dauData} />
                <AuthMechChart data={authMechData} />
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Something else</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Something else</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}