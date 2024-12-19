"use client";

import { useQueryState } from 'nuqs';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { checkToolState } from '@/lib/tinybird';
import { TOOLS, type AppGridItem, type ToolState } from '@/lib/constants';
import TokenPrompt from '@/components/token-prompt';

export default function Home() {
  const [token] = useQueryState('token');
  const [toolStates, setToolStates] = useState<Record<string, ToolState>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchToolStates() {
      if (!token) return;
      setIsLoading(true);
      try {
        const states = await Promise.all(
          Object.values(TOOLS).map(async (app) => {
            const state = await checkToolState(token, app.ds);
            return [app.id, state] as const;
          })
        );
        setToolStates(Object.fromEntries(states));
      } catch (error) {
        console.error('Failed to fetch tool states:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchToolStates();
  }, [token]);

  return (
    <div className="container py-6">
      <TokenPrompt />
      {token && isLoading && (
        <div className="flex items-center justify-center">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      )}
      {token && !isLoading && (
        <div className="space-y-8">
          {/* Configured Apps */}
          {Object.values(TOOLS).some(app => toolStates[app.id] === 'configured') && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Configured Apps</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.values(TOOLS)
                  .filter(app => toolStates[app.id] === 'configured')
                  .map(app => (
                    <AppCard
                      key={app.id}
                      app={app}
                      state={toolStates[app.id]}
                      token={token}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Installed Apps */}
          {Object.values(TOOLS).some(app => toolStates[app.id] === 'installed') && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Installed Apps</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.values(TOOLS)
                  .filter(app => toolStates[app.id] === 'installed')
                  .map(app => (
                    <AppCard
                      key={app.id}
                      app={app}
                      state={toolStates[app.id]}
                      token={token}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Available Apps */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Available Apps</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.values(TOOLS)
                .filter(app => !toolStates[app.id] || toolStates[app.id] === 'available')
                .map(app => (
                  <AppCard
                    key={app.id}
                    app={app}
                    state={toolStates[app.id] || 'available'}
                    token={token}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppCard({ 
  app, 
  state, 
  token 
}: { 
  app: AppGridItem; 
  state: ToolState;
  token?: string;
}) {
  const stateColors = {
    configured: 'border-green-500',
    installed: 'border-blue-500',
    available: ''
  };

  return (
    <Link
      key={app.id}
      href={`/${app.id}${token ? `?token=${token}` : ''}`}
    >
      <Card className={`p-4 hover:bg-accent ${stateColors[state]}`}>
        <div className="flex items-center gap-4">
          <div className="text-2xl">{app.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{app.name}</h3>
              <span className="text-xs text-muted-foreground">({state})</span>
            </div>
            <p className="text-sm text-muted-foreground">{app.description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
