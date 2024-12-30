import { spawn } from 'child_process';

interface MCPClient {
  send: (message: string) => void;
}

export class MCPServer {
    private process: any;
    private clients: Set<MCPClient> = new Set();
    private isReady: boolean = false;

    async start() {
        console.log('Starting MCP server...');
        
        if (this.isReady) {
            return;
        }

        this.process = spawn('uv', [
            '--directory',
            '/Users/alrocar/gr/mcp-tinybird',
            'run',
            'mcp-tinybird'
        ], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, PYTHONUNBUFFERED: '1' }
        });

        // Log everything immediately
        this.process.stdout.on('data', (data: Buffer) => {
            console.log('MCP stdout:', data.toString());
        });

        this.process.stderr.on('data', (data: Buffer) => {
            console.log('MCP stderr:', data.toString());
        });
    }

    addClient(client: MCPClient) {
        this.clients.add(client);
    }

    removeClient(client: MCPClient) {
        this.clients.delete(client);
    }

    async handleMessage(message: string, client: MCPClient) {
        // Forward message to MCP server process
        this.process.stdin.write(message + '\n');

        // Handle response from MCP server
        this.process.stdout.once('data', (data: Buffer) => {
            client.send(data.toString());
        });
    }

    stop() {
        if (this.process) {
            this.process.kill();
        }
        this.clients.clear();
    }
} 