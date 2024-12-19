"use client"

import { SquareArrowOutUpRight } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Link from 'next/link'

export default function TokenPrompt({ error }: { error?: string }) {
    const [token, setToken] = useQueryState('token')
    const [inputToken, setInputToken] = useState('')

    const handleSave = () => {
        if (!inputToken.trim()) return;
        setToken(inputToken)
    }

    if (token) return null

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
            <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold tracking-tight">Already deployed?</h2>
                        <p className="text-sm text-muted-foreground">
                            Enter your Tinybird admin token to continue
                        </p>
                        <div className="flex w-full max-w-sm flex-col gap-2">
                            <div className="flex items-center space-x-2">
                                <Input
                                    placeholder="Enter your token"
                                    value={inputToken}
                                    onChange={(e) => setInputToken(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                />
                                <Button onClick={handleSave}>Save</Button>
                            </div>
                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold tracking-tight">New here?</h2>
                        <p className="text-sm text-muted-foreground">
                            Deploy a new project to Tinybird to get started
                        </p>
                        <Link
                            href="https://app.tinybird.co/?starter_kit=https://github.com/tinybirdco/tinynest/tinybird"
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
                        >
                            Deploy to Tinybird
                            <SquareArrowOutUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
