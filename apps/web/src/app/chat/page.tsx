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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { CircleHelp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils';

function ChatContent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [token] = useQueryState('token');
  const [aiKey, setAiKey] = useQueryState('ai_key');

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="flex items-center space-x-2 p-4">
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

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={cn(
            "flex",
            m.role === 'user' ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "max-w-[80%] rounded-lg px-4 py-2 whitespace-pre-wrap",
              m.role === 'user' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            )}>
              {m.toolInvocations ? (
                <>
                  <p className="mb-2">{m.content}</p>
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                      <ChevronDown className="h-4 w-4" />
                      <span>View Tool Invocations</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <pre className="mt-2 p-2 text-sm bg-background rounded">{JSON.stringify(m.toolInvocations, null, 2)}</pre>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              ) : (
                <p>{m.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 p-4 bg-background border-t">
        <form onSubmit={(e) => {
          handleSubmit(e, { headers: { token: token ?? '', ai_key: aiKey ?? '' } });
        }}>
          <input
            className={cn(
              "w-full p-2 rounded-md border shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary",
              !token || !aiKey && "opacity-50 cursor-not-allowed"
            )}
            value={input}
            placeholder={aiKey ? 'Ask about your data' : "Anthropic API key is required"}
            onChange={handleInputChange}
            disabled={!token || !aiKey}
          />
        </form>
      </div>
    </div>
  );
}

export default function Chat() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <p>Loading chat...</p>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}