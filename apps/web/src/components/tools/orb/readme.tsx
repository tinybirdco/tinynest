"use client"

import Link from 'next/link'
import { useQueryState } from 'nuqs'

export default function OrbReadme() {
    const [token] = useQueryState('token')

    return (
        <div>
            <div>
                <h1 className="text-2xl font-bold">Orb Analytics</h1>
                <Link
                    href={token ? `/?token=${token}` : '/'}
                    className="text-sm text-muted-foreground hover:text-primary"
                >
                    ← Back to Apps
                </Link>
            </div>
            <div>
                <h2 className="text-xl font-bold mt-8">README</h2>
                <pre>
                    <code>
                        1. do something
                        2. do something else
                    </code>
                </pre>
            </div>
        </div>
    )
}