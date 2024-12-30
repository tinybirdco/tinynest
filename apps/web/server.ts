import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { MCPServer } from './src/lib/mcp-server'
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
const sseClients = new Set<{
  send: (data: string) => void;
  close: () => void;
}>()

// Initialize Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const mcpServer = new MCPServer()
  mcpServer.start().catch(console.error)

  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)

      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(200, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        })
        res.end()
        return
      }

      // Handle SSE endpoint
      if (parsedUrl.pathname === '/events') {
        console.log('New SSE connection request')
        
        // Set SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        })

        // Force flush headers
        res.flushHeaders();

        // Send the endpoint event first
        console.log('Sending endpoint event')
        res.write('event: endpoint\n')
        res.write(`data: ${req.url}/send\n\n`)
        
        // Send heartbeat
        res.write(':\n\n')
        
        // Force flush the written data
        const response = res as unknown as { flush?: () => void };
        if (typeof response.flush === 'function') {
            response.flush();
        }
        
        // Create client object
        const client = {
          send: (data: string) => {
            try {
              console.log('Sending message to client:', data.substring(0, 100))
              res.write(`data: ${data}\n\n`)
              const response = res as unknown as { flush?: () => void };
              if (typeof response.flush === 'function') {
                  response.flush();
              }
            } catch (error) {
              console.error('Error sending message:', error)
            }
          },
          close: () => {
            console.log('Closing client connection')
            sseClients.delete(client)
            res.end()
          }
        }

        // Keep connection alive
        const keepAlive = setInterval(() => {
          try {
            res.write(':\n\n')
            const response = res as unknown as { flush?: () => void };
            if (typeof response.flush === 'function') {
                response.flush();
            }
          } catch (error) {
            console.error('Error sending heartbeat:', error)
            clearInterval(keepAlive)
            client.close()
          }
        }, 15000)

        // Add client to set
        sseClients.add(client)
        console.log('Client connected, total clients:', sseClients.size)

        // Handle client disconnect
        req.on('close', () => {
          console.log('Client disconnected')
          clearInterval(keepAlive)
          sseClients.delete(client)
        })

        mcpServer.addClient(client)
        console.log('Client added to MCP server')

        return
      }

      // Handle POST requests for sending messages
      if (parsedUrl.pathname === '/events/send') {
        console.log('Received POST request to send message')
        
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const message = JSON.parse(body);
            console.log('Received message:', message);
            
            // Handle initialization request
            if (message.method === 'initialize') {
              // Find the client's SSE connection
              for (const client of sseClients) {
                client.send(JSON.stringify({
                  jsonrpc: '2.0',
                  id: message.id,
                  result: {
                    protocolVersion: '2024-11-05',
                    serverInfo: {
                      name: 'tinynest-server',
                      version: '1.0.0'
                    },
                    capabilities: {
                      jsonrpc: {
                        request_response: true,
                        notifications: true
                      }
                    }
                  }
                }));
              }
            } else {
              // Forward message to MCPServer
              await mcpServer.handleMessage(JSON.stringify(message));
            }
            
            // Send HTTP response
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok' }));
          } catch (error) {
            console.error('Error handling message:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
        
        return;
      }

      // Handle POST requests (messages from client)
      if (req.method === 'POST' && parsedUrl.pathname === '/events') {
        let body = ''
        req.on('data', chunk => {
          body += chunk.toString()
        })

        req.on('end', async () => {
          try {
            const message: JSONRPCMessage = JSON.parse(body)
            await mcpServer.handleMessage(JSON.stringify(message));
            res.writeHead(200)
            res.end()
          } catch (error) {
            console.error('Error handling message:', error)
            res.writeHead(500)
            res.end('Internal Server Error')
          }
        })

        return
      }

      // Handle Next.js requests
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> SSE endpoint running on http://${hostname}:${port}/events`)
  })
}) 