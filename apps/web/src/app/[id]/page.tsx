'use client';

import { useQueryState } from 'nuqs';
import React, { useEffect, useState } from 'react';
import { checkToolState, InvalidTokenError } from '@/lib/tinybird';
import { TOOL_IMPORTS, type ToolId, TOOLS, type ToolState } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import TokenPrompt from '@/components/token-prompt';

export default function AppPage({ params }: { params: Promise<{ id: string }> }) {
  const [token, setToken] = useQueryState('token');
  const [toolState, setToolState] = useState<ToolState>('available');
  const [error, setError] = useState<string>();
  const [isValidToken, setIsValidToken] = useState(false);
  const { id } = React.use(params) as { id: ToolId };
  const router = useRouter();

  useEffect(() => {
    async function checkInstallation() {
      if (!token) {
        setIsValidToken(false);
        return;
      }
      setError(undefined);
      try {
        const state = await checkToolState(token, TOOLS[id].ds);
        console.log(id);
        console.log(state);
        console.log(state[id]);
        setToolState(state[id]);
        setIsValidToken(true);
      } catch (error) {
        if (error instanceof InvalidTokenError) {
          setError('Invalid token');
          setToken(null);
          setIsValidToken(false);
          router.push('/');
        } else {
          console.error('Failed to check tool state:', error);
          setError('Failed to check tool state');
          setIsValidToken(false);
        }
      }
    }
    checkInstallation();
  }, [token, id, setToken, router]);

  if (!(id in TOOLS)) {
    return <div>Tool not found</div>;
  }
  const tool_comps = TOOL_IMPORTS[id];
  if (!tool_comps) {
    return <div>Tool not implemented</div>;
  }

  // Only show Dashboard if tool is configured or installed
  const Component = toolState === 'configured' ? tool_comps.Dashboard : tool_comps.Readme;

  return (
    <div className="py-6 mb-6 pb-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{TOOLS[id].name}</h1>
          <span className="text-sm text-muted-foreground">({toolState})</span>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {!token || !isValidToken && (
          <TokenPrompt />
        )}
        <Component />
      </div>
    </div>
  );
}
