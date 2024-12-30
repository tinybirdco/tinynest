import { WebSocketServer } from 'ws';
import { MCPServer } from '@/lib/mcp-server';

const SUBPROTOCOL = "mcp";
const WS_PORT = 3001;

let wss: WebSocketServer | null = null;

if (process.env.NODE_ENV === 'development' && !wss) {
    try {
        wss = new WebSocketServer({ 
            port: WS_PORT,
            handleProtocols: (protocols: Set<string>) => {
                return Array.from(protocols).includes(SUBPROTOCOL) ? SUBPROTOCOL : false;
            }
        });

        const mcpServer = new MCPServer();
        mcpServer.start().catch(console.error);

        wss.on('connection', (ws) => {
            console.log('MCP Client connected');
            mcpServer.addClient(ws);

            ws.on('message', async (message) => {
                try {
                    await mcpServer.handleMessage(message.toString(), ws);
                } catch (error) {
                    console.error('Error handling message:', error);
                    ws.send(JSON.stringify({ error: 'Internal server error' }));
                }
            });

            ws.on('close', () => {
                console.log('MCP Client disconnected');
                mcpServer.removeClient(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
        });

        wss.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });

        console.log(`WebSocket server is running on port ${WS_PORT}`);
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

export async function GET() {
    return new Response('WebSocket server status: ' + (wss ? 'running' : 'not running'));
} 