import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { WebSocketServer } from 'ws'
import { MCPServer } from './src/lib/mcp-server'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
const wsPort = 3001

// Initialize Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Start WebSocket server on different port
  const wss = new WebSocketServer({ port: wsPort })
  const mcpServer = new MCPServer()
  mcpServer.start().catch(console.error)

  wss.on('connection', (ws) => {
    console.log('MCP Client connected')
    mcpServer.addClient(ws)

    ws.on('message', async (message) => {
      try {
        await mcpServer.handleMessage(message.toString(), ws)
      } catch (error) {
        console.error('Error handling message:', error)
        ws.send(JSON.stringify({ error: 'Internal server error' }))
      }
    })

    ws.on('close', () => {
      console.log('MCP Client disconnected')
      mcpServer.removeClient(ws)
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket server running on ws://${hostname}:${wsPort}`)
  })
}) 