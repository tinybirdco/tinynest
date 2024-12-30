'use client'

import { useState, useEffect, useRef } from "react"
import { MCPClient, MessageCallback } from "@/lib/mcp-client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function Chat() {
    const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const clientRef = useRef<MCPClient>(new MCPClient())

    useEffect(() => {
        let isInitialized = false;

        const initClient = async () => {
            if (isInitialized) return;
            isInitialized = true;
            
            try {
                await clientRef.current.start()
                console.log('MCP client initialized')
            } catch (error) {
                console.error('Failed to initialize MCP client:', error)
            }
        }

        initClient()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        
        try {
            setIsLoading(true)
            let currentMessage = { role: 'assistant', content: '' }
            
            const onMessage: MessageCallback = (message) => {
                if (message.content === '\n\n') {
                    setMessages(prev => [
                        ...prev, message
                    ])
                    currentMessage.content = ''
                } else {
                    currentMessage.content += message.content
                    setMessages(prev => [
                        ...prev.slice(0, -1), // Remove previous assistant message
                        { ...currentMessage }  // Add updated message
                    ])
                }
            }
            
            await clientRef.current.sendMessage(userMessage, onMessage)
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Chat with Claude</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col h-[500px]">
                    <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-4">
                            {messages.map((message, i) => (
                                <div
                                    key={i}
                                    className={`flex ${
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={!input.trim() || isLoading}>
                            {isLoading ? 'Sending...' : 'Send'}
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
} 