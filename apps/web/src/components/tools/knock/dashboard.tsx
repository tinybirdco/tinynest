"use client"

import { useQueryState } from 'nuqs'
import { useEffect } from 'react'

export default function KnockDashboard() {
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
            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-3">
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2">
            </div>
        </div>
    )
}
