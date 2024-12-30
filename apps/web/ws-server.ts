import { WebSocketServer } from 'ws';
import { MCPServer } from './src/lib/mcp-server';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const SUBPROTOCOL = "mcp";
const WS_PORT = 3001;

async function startWebSocketServer() {
    console.log('Starting WebSocket server...');
    
    const wss = new WebSocketServer({ 
        port: WS_PORT,
        handleProtocols: (protocols: Set<string>) => {
            return Array.from(protocols).includes(SUBPROTOCOL) ? SUBPROTOCOL : false;
        }
    });

    const mcpServer = new MCPServer();
    await mcpServer.start();

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
}

startWebSocketServer().catch(console.error); 