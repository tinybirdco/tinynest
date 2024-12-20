"use client"

import Link from 'next/link'
import { useQueryState } from 'nuqs'

export default function ClerkReadme() {
    const [token] = useQueryState('token')

    return (
        <div>
            <div>
                <Link
                    href={token ? `/?token=${token}` : '/'}
                    className="text-sm text-muted-foreground hover:text-primary"
                >
                    ← Back to Apps
                </Link>
            </div>
            <div className='prose'>
                <p className='mt-8'>You haven&apos;t configured Clerk yet.</p>
                <h2 className="text-xl font-bold">Configure Clerk</h2>
                <ol>
                    <li>
                        Clone the <Link href='https://github.com/tinybirdco/tinynest'>Tinynest repo</Link>
                    </li>
                    <li>
                        Use the Tinybird CLI to push the Clerk
                    </li>
                </ol>
            </div>
        </div>
    )
}