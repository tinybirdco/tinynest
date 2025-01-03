"use client"

import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { pipe } from '@/lib/tinybird'
import MetricCard from '@/components/metric-card'
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

export default function ClerkDashboard() {
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
                    pipe(token, 'clerk_signups'),
                    pipe(token, 'clerk_mau'),
                    pipe<{ data: DauDataPoint[] }>(token, 'clerk_dau_ts'),
                    pipe<{ data: AuthMechData[] }>(token, 'clerk_mech_usage')
                ])

                const total = monthlySignUpsResult.data[0]?.total || 0
                const active = monthlyMauResult.data[0]?.active || 0

                setMonthlySignUps(total)
                setMonthlyMau(active)
                setConversionRate(total > 0 ? Math.round((active / total) * 100) : 0)
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
                    description="Active users / Total users"
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
