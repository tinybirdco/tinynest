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
    const clientRef = useRef<MCPClient>(new MCPClient())
    const initRef = useRef(false)

    // Initialize MCP client
    useEffect(() => {
        const initClient = async () => {
            if (initRef.current) return;
            initRef.current = true;
            
            try {
                await clientRef.current.start()
                console.log('MCP client initialized')
            } catch (error) {
                console.error('Failed to initialize MCP client:', error)
                initRef.current = false; // Allow retry on error
            }
        }

        initClient()

        // Cleanup
        return () => {
            initRef.current = false;
        }
    }, []) // Empty dependency array

    const formatToolCall = (toolName: string, args: any): string => {
        return `\n[${toolName}] ${JSON.stringify(args, null, 2)}\n`;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMessage = input.trim()
        setInput('')
        
        // Create new assistant message
        const assistantMessage = { role: 'assistant', content: '' }
        setMessages(prev => [...prev, 
            { role: 'user', content: userMessage },
            assistantMessage
        ])
        
        try {
            const onMessage: MessageCallback = (message) => {
                if (message.role === 'tool') {
                    const toolCall = formatToolCall(
                        message.toolName || '', 
                        message.toolArgs || {}
                    )
                    assistantMessage.content += toolCall
                } else {
                    assistantMessage.content += message.content
                }
                
                setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }])
            }
            
            clientRef.current?.sendMessage(userMessage, onMessage).catch(error => {
                console.error('Error sending message:', error)
                assistantMessage.content += "\n\nSorry, there was an error. Please try again."
                setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }])
            })
        } catch (error) {
            console.error('Error in handleSubmit:', error)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                {/* <CardTitle>Chat with Claude</CardTitle> */}
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
                                        className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap ${
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
                            placeholder="Type your message..."
                        />
                        <Button type="submit" disabled={!input.trim()}>
                            Send
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
} 