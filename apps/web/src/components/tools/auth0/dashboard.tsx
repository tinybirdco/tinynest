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
                const [monthlySignUpsResult, monthlyMauResult, dauResult, authMechResult, conversionResult] = await Promise.all([
                    pipe(token, 'auth0_signups'),
                    pipe(token, 'auth0_mau'),
                    pipe<{ data: DauDataPoint[] }>(token, 'auth0_dau_ts'),
                    pipe<{ data: AuthMechData[] }>(token, 'auth0_mech_usage'),
                    pipe<{ data: ConversionData[] }>(token, 'auth0_conversion_rate')
                ])

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