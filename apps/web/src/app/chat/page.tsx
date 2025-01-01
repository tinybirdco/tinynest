'use client';

import { useChat } from 'ai/react';
import { useQueryState } from 'nuqs';
import { Suspense } from 'react';

function ChatContent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [token] = useQueryState('token');
  const [aiKey, setAiKey] = useQueryState('ai_key');

  return (
    <>
      <div className="fixed top-0 w-full max-w-md p-4 bg-white">
        <span className="inline-block w-24">Token:</span>
        <input
          type="password"
          className="inline-block w-full p-2 border border-gray-300 rounded"
          value={aiKey || ''}
          onChange={(e) => setAiKey(e.target.value)}
          placeholder="Enter your OpenAI/Anthropic API key..."
        />
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
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
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