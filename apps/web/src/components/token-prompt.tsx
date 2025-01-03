"use client"

import { SquareArrowOutUpRight } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function TokenPrompt({ error }: { error?: string }) {
    const [token, setToken] = useQueryState('token')
    const [inputToken, setInputToken] = useState('')

    const handleSave = () => {
        if (!inputToken.trim()) return;
        setToken(inputToken)
    }

    if (token) return null

    return (
        <>
            <h2>Already deployed? Enter your token</h2>
            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                    type="password"
                    placeholder="Enter your 'read' token from Tinybird"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                <Button type="submit" onClick={handleSave}>Save</Button>
            </div>
        </>

    )
}
