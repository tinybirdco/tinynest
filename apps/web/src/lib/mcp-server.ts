import * as EventSourceImport from 'eventsource';
const EventSource = EventSourceImport.EventSource;

interface MCPClient {
  send: (message: string) => void;
}

export class MCPServer {
    private clients: Set<MCPClient> = new Set();
    private isReady: boolean = false;
    private eventSource: EventSource;
    private sessionId: string | null = null;

    async start() {
        console.log('Starting MCP server...');
        
        if (this.isReady) {
            return;
        }

        try {
            // First establish SSE connection
            console.log('Establishing SSE connection...');
            this.eventSource = new EventSource('http://localhost:3001/sse');
            
            // Get session ID from the endpoint event
            await new Promise<void>((resolve, reject) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.eventSource.addEventListener('endpoint', (event: any) => {
                    console.log('Received endpoint event:', event.data);
                    const match = event.data.match(/session_id=([^&]+)/);
                    if (match) {
                        this.sessionId = match[1];
                        console.log('Got session ID:', this.sessionId);
                        resolve();
                    } else {
                        console.error('No session ID found in endpoint event');
                        reject(new Error('No session ID found in endpoint event'));
                    }
                });
                
                this.eventSource.onerror = (error) => {
                    console.error('SSE connection error:', error);
                    reject(error);
                };
            });

            // Handle incoming messages
            this.eventSource.onmessage = (event) => {
                console.log('Received SSE message:', event.data);
                for (const client of this.clients) {
                    client.send(event.data);
                }
            };

            this.isReady = true;
            console.log('MCP server ready');
        } catch (error) {
            console.error('Failed to connect to MCP server:', error);
            throw error;
        }
    }

    async handleMessage(message: string) {
        if (!this.sessionId) {
            console.error('No session ID available');
            throw new Error('No session ID available');
        }

        console.log('Sending message with session ID:', this.sessionId);
        console.log('Message:', message);

        try {
            // Send message with session ID
            const response = await fetch(`http://localhost:3001/messages?session_id=${this.sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: message,
                // Add these options to handle the connection better
                keepalive: true,
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            // Don't try to read the response body, just check status
            if (response.status !== 202) {
                throw new Error(`Failed to send message: ${response.status}`);
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Message accepted (timeout is normal)');
                return;
            }
            console.error('Error sending message:', error);
            throw error;
        }
    }

    addClient(client: MCPClient) {
        this.clients.add(client);
    }

    removeClient(client: MCPClient) {
        this.clients.delete(client);
    }

    stop() {
        if (this.eventSource) {
            console.log('Closing SSE connection');
            this.eventSource.close();
        }
        this.clients.clear();
        this.isReady = false;
        this.sessionId = null;
    }
} 