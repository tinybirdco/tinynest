"use client"

import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { pipe } from '@/lib/tinybird'
import MetricCard from '../auth0/metric'
import { SubsChart } from './subs-chart'

interface SubsDataPoint {
    day: string
    invoices: number
}

export default function OrbDashboard() {
    const [token] = useQueryState('token')
    const [newSubs, setNewSubs] = useState<number>(0)
    const [churnedSubs, setChurnedSubs] = useState<number>(0)
    const [issuedInvoices, setIssuedInvoices] = useState<number>(0)
    const [paidInvoices, setPaidInvoices] = useState<number>(0)
    const [subsTimeSeriesData, setSubsTimeSeriesData] = useState<SubsDataPoint[]>([])

    useEffect(() => {
        async function fetchMetrics() {
            if (!token) return

            try {
                const [
                    newSubsResult,
                    churnedSubsResult,
                    issuedInvoicesResult,
                    paidInvoicesResult,
                    subsTimeSeriesResult
                ] = await Promise.all([
                    pipe(token, 'orb_new_subs'),
                    pipe(token, 'orb_churn_subs'),
                    pipe(token, 'orb_invoices_issued'),
                    pipe(token, 'orb_invoices_paid'),
                    pipe<{ data: SubsDataPoint[] }>(token, 'orb_subs_ts')
                ])

                setNewSubs(newSubsResult.data[0]?.subs || 0)
                setChurnedSubs(churnedSubsResult.data[0]?.subs || 0)
                setIssuedInvoices(issuedInvoicesResult.data[0]?.invoices || 0)
                setPaidInvoices(paidInvoicesResult.data[0]?.invoices || 0)
                setSubsTimeSeriesData(subsTimeSeriesResult.data)
            } catch (error) {
                console.error('Failed to fetch metrics:', error)
            }
        }

        fetchMetrics()
    }, [token])

    const churnRate = newSubs > 0 
        ? Math.round((churnedSubs / newSubs) * 100) 
        : 0

    const invoicePaymentRate = issuedInvoices > 0 
        ? Math.round((paidInvoices / issuedInvoices) * 100)
        : 0

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Orb Analytics</h1>
                <Link
                    href={token ? `/?token=${token}` : '/'}
                    className="text-sm text-muted-foreground hover:text-primary"
                >
                    ← Back to Apps
                </Link>
            </div>

            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="New Subscriptions"
                    value={newSubs.toLocaleString()}
                    description="New subscriptions in the last 30 days"
                />
                <MetricCard
                    title="Churned Subscriptions"
                    value={churnedSubs.toLocaleString()}
                    description="Cancelled subscriptions in the last 30 days"
                />
                <MetricCard
                    title="Churn Rate"
                    value={`${churnRate}%`}
                    description="Churned / New subscriptions"
                />
                <MetricCard
                    title="Invoice Payment Rate"
                    value={`${invoicePaymentRate}%`}
                    description="Paid / Issued invoices"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                <SubsChart data={subsTimeSeriesData} />
            </div>
        </div>
    )
}
