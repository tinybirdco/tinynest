"use client";

import { useQueryState } from 'nuqs';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { checkToolState, InvalidTokenError } from '@/lib/tinybird';
import { TOOLS, type AppGridItem, type ToolState } from '@/lib/constants';
import TokenPrompt from '@/components/token-prompt';
import { SectionHeader } from '@/components/section-header';
import { Suspense } from 'react';

export default function Home() {
  <Suspense>
    <Page />
  </Suspense>
}

function Page() {
  const [token, setToken] = useQueryState('token');
  const [toolStates, setToolStates] = useState<Record<string, ToolState>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    async function fetchToolStates() {
      if (!token) {
        setIsValidToken(false);
        return;
      }
      setIsLoading(true);
      setError(undefined);
      try {
        const states = await Promise.all(
          Object.values(TOOLS).map(async (app) => {
            const state = await checkToolState(token, app.ds);
            return [app.id, state] as const;
          })
        );
        setToolStates(Object.fromEntries(states));
        setIsValidToken(true);
      } catch (error) {
        if (error instanceof InvalidTokenError) {
          setError('Invalid token');
          setToken(null);
          setIsValidToken(false);
        } else {
          console.error('Failed to fetch tool states:', error);
          setError('Failed to fetch tool states');
          setIsValidToken(false);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchToolStates();
  }, [token, setToken]);

  if (!token || !isValidToken) {
    return (
      <div className="container py-6">
        <TokenPrompt error={error} />
      </div>
    );
  }

  return (
    <div className="container py-6">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Configured Apps */}
          {Object.values(TOOLS).some(app => toolStates[app.id] === 'configured') && (
            <div className="space-y-4">
              <SectionHeader
                title="Configured Apps"
                tooltip="These apps are fully set up and have data. They're ready to use!"
              />
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
              <SectionHeader
                title="Installed Apps"
                tooltip="Your Tinybird Workspace has the Data Sources installed, but you're not receiving data. Click an app to learn how to add data."
              />
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
            <SectionHeader
              title="Available Apps"
              tooltip="Your Tinybird Workspace doesn't have the Data Sources installed yet. Click an app to learn how to install it."
            />
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
