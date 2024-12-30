import { Anthropic, APIError } from '@anthropic-ai/sdk';
import {
  ListToolsResultSchema,
  CallToolResultSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
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
  private static instance: MCPClient | null = null;
  private connecting: boolean = false;
  private anthropicClient: Anthropic;
  private messages: Message[] = [];
  private mcpClient: Client;
  private transport: SSEClientTransport;
  private tools: Tool[] = [];
  private isConnected = false;
  private firstMessage = true;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private eventSource: EventSource | null = null;
  private messageHandlers: Set<(data: any) => void> = new Set();

  constructor() {
    if (MCPClient.instance) {
      return MCPClient.instance;
    }
    
    this.anthropicClient = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });
    
    MCPClient.instance = this;
  }

  async start() {
    if (this.isConnected || this.connecting) {
      console.log('Already connected or connecting...');
      return;
    }

    try {
      this.connecting = true;
      console.log('Connecting to MCP server...')
      const sseUrl = 'http://localhost:3000/events'
      console.log('Attempting to connect to:', sseUrl)
      
      this.transport = new SSEClientTransport(
        new URL(sseUrl)
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
        }
      )

      console.log('Connecting MCP client...')
      await this.mcpClient.connect(this.transport);
      
      this.firstMessage = true;
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Connected to MCP server')
      
      console.log('Starting tools initialization...')
      await this.initMCPTools()
      console.log('Tools initialization complete')
    } catch (error) {
      console.error('Failed to connect to MCP server:', error)
      this.isConnected = false;
      await this.handleDisconnect();
      throw error;
    } finally {
      this.connecting = false;
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
      console.log('Requesting tools list...');
      const toolsResults = await this.mcpClient.request(
        { method: 'tools/list' },
        ListToolsResultSchema,
        { timeout: 120000 }  // 2 minutes timeout
      );
      console.log('Received tools:', toolsResults);
      
      this.tools = toolsResults.tools.map(({ inputSchema, ...tool }) => ({
        ...tool,
        input_schema: inputSchema,
      }));
      console.log('Tools initialized:', this.tools.length);
    } catch (error) {
      console.error('Failed to initialize tools:', error);
      throw error;
    }
  }

  private async processStream(
    stream: Stream<Anthropic.Messages.RawMessageStreamEvent>,
    onMessage: MessageCallback,
    depth: number = 0  // Track recursion depth
  ): Promise<void> {
    // Prevent too deep recursion
    if (depth > 4) {
        onMessage({
            role: 'assistant',
            content: 'Request too complex. Start a new chat with a more specific question.'
        });
        return;
    }

    let currentMessage = '';
    let currentToolName = '';
    let currentToolInputString = '';

    try {
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
                        let toolArgs = {};  
                        try {
                            toolArgs = currentToolInputString
                                ? JSON.parse(currentToolInputString)
                                : {};
                        } catch (error) {
                            console.error('Failed to parse tool arguments:', error, currentToolInputString);
                            toolArgs = {};
                        }

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

                        if (toolResult.content.some(c => c.text.includes('[Error]'))) {
                            this.messages.push({
                                role: 'user',
                                content: `Error executing query. Please fix the query and try again. Error: ${toolResult.content.map(c => c.text).join('\n')}`
                            });
                        } else {
                            const formattedResult = JSON.stringify(toolResult.content.flatMap((c) => c.text));
                            this.messages.push({
                                role: 'user',
                                content: formattedResult,
                            });
                        }

                        try {
                            const nextStream = await this.anthropicClient.messages.create({
                                messages: this.messages,
                                model: 'claude-3-5-sonnet-latest',
                                max_tokens: 8192,
                                tools: this.tools,
                                stream: true,
                            }).catch(async (err) => {
                                if (err instanceof Anthropic.APIError) {
                                    console.log('Anthropic API Error in tool use:', err.status, err.name);
                                    if (err.status === 429) {
                                        onMessage({
                                            role: 'assistant',
                                            content: 'Rate limit exceeded. Please wait a moment before sending more messages.'
                                        });
                                        return null;
                                    }
                                }
                                throw err;
                            });

                            if (nextStream) {
                                await this.processStream(nextStream, onMessage, depth + 1);
                            }
                        } catch (error: any) {
                            // Handle rate limits in nested stream creation
                            if (error.status === 429 || error.message?.includes('rate limit')) {
                                onMessage({
                                    role: 'assistant',
                                    content: 'Rate limit exceeded. Please wait a moment before sending more messages.'
                                });
                                return;
                            }
                            throw error;
                        }
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
    } catch (error: any) {
        // Check for rate limit errors
        if (error.status === 429 || error.message?.includes('rate limit')) {
            onMessage({
                role: 'assistant',
                content: 'Rate limit exceeded. Please wait a moment before sending more messages.'
            });
            // Cancel the stream
            stream.controller.abort();
            return;
        }
        
        // Handle other errors
        console.error('Error in processStream:', error);
        onMessage({
            role: 'assistant',
            content: 'An error occurred while processing your request. Please try again.'
        });
        throw error;
    }
  }

  async sendMessage(message: string, onMessage: MessageCallback) {
    try {
        if (!this.isConnected) {
            await this.start();
        }
        if (this.firstMessage) {
            const prompt = "you MUST keep output tokens to minimal. Follow this process: 1. get sample data from auth0 data source 2. guess schema looking at the data and remember the nested attributes names 3. build a query to answer the question 4. if the query fails ask for confirmation before run-select-query again. RULES: DO NOT use semicolons for queries, DO NOT use JSONExtract instead use dots to access JSON nested attributes. cast JSON nested attributes to its corresponding type this event.data.attribute::String. keep it simple and concise. do not append-insights. answer the question in a single sentence."
            message = `${prompt}\n${message}`
            this.firstMessage = false;
        }
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
        }).catch(async (err) => {
            if (err instanceof Anthropic.APIError) {
                console.log('Anthropic API Error:', err.status, err.name);
                if (err.status === 429) {
                    onMessage({
                        role: 'assistant',
                        content: 'Rate limit exceeded. Please wait a moment before sending more messages.'
                    });
                    return null;
                }
            }
            throw err;
        });

        if (stream) {
            await this.processStream(stream, onMessage, 0);
        }
    } catch (error) {
        console.error('Error during message processing:', error);
        if (error instanceof Anthropic.APIError) {
            if (error.status === 429) {
                onMessage({
                    role: 'assistant',
                    content: 'Rate limit exceeded. Please wait a moment before sending more messages.'
                });
                return;
            }
        }
        throw error;
    }
  }
} 