"use client"

import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { query } from '@/lib/tinybird'
import MetricCard from './metric'

export default function Auth0Dashboard() {
    const [token] = useQueryState('token')
    const [totalUsers, setTotalUsers] = useState<number>(0)
    const [activeUsers, setActiveUsers] = useState<number>(0)
    const [conversionRate, setConversionRate] = useState<number>(0)

    useEffect(() => {
        async function fetchMetrics() {
            if (!token) return

            try {
                const [totalResult, activeResult] = await Promise.all([
                    query(token, "SELECT count() as total FROM auth0_logs WHERE type = 'ss' FORMAT JSON"),
                    query(token, "SELECT count(DISTINCT user_id) as active FROM auth0_logs where type == 's' and date >= now() - interval 30 days FORMAT JSON")
                ])

                const total = totalResult.data[0]?.total || 0
                const active = activeResult.data[0]?.active || 0

                setTotalUsers(total)
                setActiveUsers(active)
                setConversionRate(total > 0 ? Math.round((active / total) * 100) : 0)
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
                    title="Total Users"
                    value={totalUsers.toLocaleString()}
                    description="Total registered users"
                />
                <MetricCard
                    title="Active Users (30d)"
                    value={activeUsers.toLocaleString()}
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
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {/* User Growth Chart will go here */}
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Daily Active Users</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {/* DAU Chart will go here */}
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>User Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {/* User Actions Chart will go here */}
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Session Duration</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {/* Session Duration Chart will go here */}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}