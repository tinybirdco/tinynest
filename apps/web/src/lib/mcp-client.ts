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

  constructor() {
    this.anthropicClient = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    this.mcpClient = new Client(
      { name: 'web-client', version: '1.0.0' },
      { capabilities: {
        jsonrpc: {
          request_response: true,
          notifications: true
        }
      } },
    );

    // Connect to the local MCP server
    this.transport = new WebSocketClientTransport(
      new URL('ws://localhost:3001')
    );
  }

  async start() {
    try {
      console.log('Connecting to MCP server...')
      await this.mcpClient.connect(this.transport)
      console.log('Connected to MCP server')
      await this.initMCPTools()
      console.log('Initialized MCP tools')
    } catch (error) {
      console.error('Failed to connect to MCP server:', error)
      throw error
    }
  }

  private async initMCPTools() {
    try {
      const toolsResults = await this.mcpClient.request(
        { method: 'tools/list' },
        ListToolsResultSchema,
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
        //   onMessage({ role: 'assistant', content: '\n\n' });
          continue;

        case 'content_block_start':
          if (chunk.content_block?.type === 'tool_use') {
            currentToolName = chunk.content_block.name;
          }
          break;

        case 'content_block_delta':
          if (chunk.delta.type === 'text_delta') {
            currentMessage += chunk.delta.text;
            // Send incremental updates
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

            const toolResult = await this.mcpClient.request(
              {
                method: 'tools/call',
                params: {
                  name: currentToolName,
                  arguments: toolArgs,
                },
              },
              CallToolResultSchema,
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
          break;
      }
    }
  }

  async sendMessage(message: string, onMessage: MessageCallback) {
    try {
      this.messages.push({ role: 'user', content: message });

      const stream = await this.anthropicClient.messages.create({
        messages: this.messages,
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 8192,
        tools: this.tools,
        stream: true,
      });

      await this.processStream(stream, onMessage);
    } catch (error) {
      console.error('Error during message processing:', error);
      throw error;
    }
  }
} 