import { Anthropic } from '@anthropic-ai/sdk';
import {
  ListToolsResultSchema,
  CallToolResultSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';
import { Tool } from '@anthropic-ai/sdk/resources/index.mjs';
import { Stream } from '@anthropic-ai/sdk/streaming.mjs';

interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  toolArgs?: any;
}

type AnthropicMessage = {
  role: 'user' | 'assistant';
  content: string;
}

export type MessageCallback = (message: Message) => void;

export class MCPClient {
  private anthropicClient: Anthropic;
  private messages: Message[] = [];
  private mcpClient: Client;
  private transport: WebSocketClientTransport;
  private tools: Tool[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor() {
    this.anthropicClient = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  async start() {
    try {
      console.log('Connecting to MCP server...')
      this.transport = new WebSocketClientTransport(
        new URL('ws://localhost:3001')
      )
      
      this.mcpClient = new Client(
        { name: 'web-client', version: '1.0.0' },
        {
        capabilities: {
          jsonrpc: {
            request_response: true,
            notifications: true
          }
        }
      })

      // Access underlying WebSocket
      const ws = (this.transport as any).ws;
      if (ws) {
        ws.addEventListener('close', () => this.handleDisconnect());
        ws.addEventListener('error', (error) => {
          console.error('Transport error:', error);
          this.handleDisconnect();
        });
      }

      await this.mcpClient.connect(this.transport)
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Connected to MCP server')
      await this.initMCPTools()
      console.log('Initialized MCP tools')
    } catch (error) {
      console.error('Failed to connect to MCP server:', error)
      await this.handleDisconnect();
      throw error
    }
  }

  private async handleDisconnect() {
    this.isConnected = false;
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      await this.start();
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private async initMCPTools() {
    try {
      const toolsResults = await this.mcpClient.request(
        { method: 'tools/list' },
        ListToolsResultSchema,
        { timeout: 120000 }  // 2 minutes timeout
      )
      this.tools = toolsResults.tools.map(({ inputSchema, ...tool }) => ({
        ...tool,
        input_schema: inputSchema,
      }))
    } catch (error) {
      console.error('Failed to initialize tools:', error)
      throw error
    }
  }

  private async processStream(
    stream: Stream<Anthropic.Messages.RawMessageStreamEvent>,
    onMessage: MessageCallback
  ): Promise<void> {
    let currentMessage = '';
    let currentToolName = '';
    let currentToolInputString = '';

    for await (const chunk of stream) {
      switch (chunk.type) {
        case 'message_start':
        case 'content_block_stop':
          continue;

        case 'content_block_start':
          if (chunk.content_block?.type === 'tool_use') {
            currentToolName = chunk.content_block.name;
          }
          break;

        case 'content_block_delta':
          if (chunk.delta.type === 'text_delta') {
            currentMessage += chunk.delta.text;
            onMessage({ role: 'assistant', content: chunk.delta.text });
          } else if (chunk.delta.type === 'input_json_delta') {
            if (currentToolName && chunk.delta.partial_json) {
              currentToolInputString += chunk.delta.partial_json;
            }
          }
          break;

        case 'message_delta':
          if (chunk.delta.stop_reason === 'tool_use') {
            const toolArgs = currentToolInputString
              ? JSON.parse(currentToolInputString)
              : {};

            // Send tool call as a message
            onMessage({ 
              role: 'tool', 
              content: '',
              toolName: currentToolName,
              toolArgs: toolArgs
            });

            const toolResult = await this.mcpClient.request(
              {
                method: 'tools/call',
                params: {
                  name: currentToolName,
                  arguments: toolArgs,
                },
              },
              CallToolResultSchema,
              { timeout: 120000 }  // 2 minutes timeout
            );

            if (currentMessage) {
              this.messages.push({
                role: 'assistant',
                content: currentMessage,
              });
            }

            const formattedResult = JSON.stringify(toolResult.content.flatMap((c) => c.text));
            this.messages.push({
              role: 'user',
              content: formattedResult,
            });

            const nextStream = await this.anthropicClient.messages.create({
              messages: this.messages,
              model: 'claude-3-5-sonnet-latest',
              max_tokens: 8192,
              tools: this.tools,
              stream: true,
            });
            await this.processStream(nextStream, onMessage);
          }
          break;

        case 'message_stop':
          if (currentMessage) {
            this.messages.push({
              role: 'assistant',
              content: currentMessage,
            });
          }
          break;
      }
    }
  }

  async sendMessage(message: string, onMessage: MessageCallback) {
    try {
      if (!this.isConnected) {
        await this.start();
      }
      const prompt = "use the auth0 data source, do not use semicolons for queries, do not use JSONExtract instead use dots to access JSON nested attributes"
      message = `${prompt}\n${message}`
      this.messages.push({ role: 'user', content: message });

      const anthropicMessages: AnthropicMessage[] = this.messages.map(({ role, content }) => ({
        role: role === 'tool' ? 'assistant' : role,
        content
      }));

      const stream = await this.anthropicClient.messages.create({
        messages: anthropicMessages,
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 8192,
        tools: this.tools,
        stream: true,
      });

      await this.processStream(stream, onMessage);
    } catch (error) {
      console.error('Error during message processing:', error);
      if (error.message?.includes('timeout')) {
        await this.handleDisconnect();
      }
      throw error;
    }
  }
} 