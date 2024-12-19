"use client"

import { useQueryState } from 'nuqs'
import { useEffect } from 'react'
import Link from 'next/link'

export default function ResendDashboard() {
    const [token] = useQueryState('token')

    useEffect(() => {
        async function fetchMetrics() {
            if (!token) return

            try {
                const [] = await Promise.all([
                ])
            } catch (error) {
                console.error('Failed to fetch metrics:', error)
            }
        }

        fetchMetrics()
    }, [token])

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Resend Analytics</h1>
                <Link
                    href={token ? `/?token=${token}` : '/'}
                    className="text-sm text-muted-foreground hover:text-primary"
                >
                    ← Back to Apps
                </Link>
            </div>

            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-3">
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2">
            </div>
        </div>
    )
}
