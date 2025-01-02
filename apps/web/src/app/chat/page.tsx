'use client';

import { useChat } from 'ai/react';
import { useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CircleHelp } from 'lucide-react'
import { cn } from '@/lib/utils';

function ChatContent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [token] = useQueryState('token');
  const [aiKey, setAiKey] = useQueryState('ai_key');

  return (
    <>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input type="password" placeholder="Anthropic API key" value={aiKey ?? ''} onChange={(e) => setAiKey(e.target.value)} />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger><CircleHelp className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
            <TooltipContent>
              <p>Add your Anthropic API key here. The key is stored in your URL and used to authenticate requests to the Anthropic API. It is not stored remotely.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {messages.map(m => (
          <div key={m.id} className="whitespace-pre-wrap">
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.toolInvocations ? (
              <pre>{JSON.stringify(m.toolInvocations, null, 2)}</pre>
            ) : (
              <p>{m.content}</p>
            )}
          </div>
        ))}

        <form onSubmit={(e) => {
          handleSubmit(e, { headers: { token: token ?? '', ai_key: aiKey ?? '' } });
        }}>
          <input
            className={cn("fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl", !token || !aiKey && 'opacity-50 cursor-not-allowed')}
            value={input}
            placeholder={aiKey ? 'Ask about your data' : "Anthropic API key is required"}
            onChange={handleInputChange}
            disabled={!token || !aiKey}
          />
        </form>
      </div>
    </>
  );
}

export default function Chat() {
  return (
    <Suspense fallback={
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        <p>Loading chat...</p>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}