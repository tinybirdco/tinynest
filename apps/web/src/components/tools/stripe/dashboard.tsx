"use client"

import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { DailySubsChart, DailySubsDataPoint } from './subs-ts-chart'
import { pipe } from '@/lib/tinybird'
import MetricCard from '@/components/metric'

type SubsMetricsDataPoint = {
    created: number
    deleted: number
}

export default function StripeDashboard() {
    const [token] = useQueryState('token')
    const [subsTimeSeriesData, setSubsTimeSeriesData] = useState<DailySubsDataPoint[]>([])
    const [subsMetricsData, setSubsMetricsData] = useState<SubsMetricsDataPoint[]>([])

    useEffect(() => {
        async function fetchMetrics() {
            if (!token) return

            try {
                const [dailySubsResult, subsMetricsResult] = await Promise.all([
                    pipe<{ data: DailySubsDataPoint[] }>(token, 'stripe_subs_ts'),
                    pipe<{ data: SubsMetricsDataPoint[] }>(token, 'stripe_subs_metric'),
                ])

                setSubsTimeSeriesData(dailySubsResult.data)
                setSubsMetricsData(subsMetricsResult.data)
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
                <MetricCard title="New Subs" value={subsMetricsData[0]?.created || 0} />
                <MetricCard title="Churned Subs" value={subsMetricsData[0]?.deleted || 0} />
                <MetricCard title="Churn Rate" value={`${subsMetricsData[0]?.deleted > 0 ? Math.round((subsMetricsData[0]?.deleted / subsMetricsData[0]?.created) * 100) : 0}%`} />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                <DailySubsChart data={subsTimeSeriesData} timeRange="daily" />
            </div>
        </div>
    )
}
