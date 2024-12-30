import WebSocketSingleton from '@/lib/websocket-server';

export async function GET() {
    await WebSocketSingleton.getInstance();
    return new Response('WebSocket server is running', { status: 200 });
} 