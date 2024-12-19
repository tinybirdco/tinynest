"use client"

import Link from 'next/link'
import { useQueryState } from 'nuqs'

export default function Auth0Readme() {
    const [token] = useQueryState('token')

    return (
        <div>
            <div>
                <h1 className="text-2xl font-bold">Auth0 Analytics</h1>
                <Link
                    href={token ? `/?token=${token}` : '/'}
                    className="text-sm text-muted-foreground hover:text-primary"
                >
                    ← Back to Apps
                </Link>
            </div>
            <pre>
                <code>
                    1. do something
                    2. do something else
                </code>
            </pre>
        </div>
    )
}