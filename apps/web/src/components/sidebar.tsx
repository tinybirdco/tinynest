'use client';

import { useQueryState } from 'nuqs';
import { useState, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { checkToolState, InvalidTokenError } from '@/lib/tinybird';
import { TOOLS, type AppGridItem, type ToolState } from '@/lib/constants';
import { SectionHeader } from '@/components/section-header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare } from 'lucide-react';
import Image from 'next/image';

function AppCard({
  app,
  state,
  token,
  isActive,
}: {
  app: AppGridItem;
  state: ToolState;
  token?: string;
  isActive: boolean;
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
      <Card className={`p-3 hover:bg-accent mb-2 ${stateColors[state]} ${isActive ? 'bg-accent' : ''}`}>
        <div className="flex items-center gap-3">
          {/* <div className="text-xl">{app.icon}</div> */}
          {app.icon_url && <Image src={app.icon_url} width={16} height={16} alt={app.name} />}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{app.name}</h3>
              <span className="text-xs text-muted-foreground">({state})</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function Sidebar({ activeAppId }: { activeAppId?: string }) {
  return (
    <Suspense fallback={
      <div className="w-64 border-r h-screen">
        <div className="p-4 border-b">
          <div className="text-xl font-bold">tinynest</div>
        </div>
        <div className="h-[calc(100vh-65px)] px-4 py-6">
          <div className="flex items-center justify-center">
            <p className="text-sm font-semibold">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SidebarContent activeAppId={activeAppId} />
    </Suspense>
  );
}

function SidebarContent({ activeAppId }: { activeAppId?: string }) {
  const [token, setToken] = useQueryState('token');
  const [toolStates, setToolStates] = useState<Record<string, ToolState>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function fetchToolStates() {
      if (!token) return;

      setIsLoading(true);
      setError(undefined);
      try {
        const allStates = await checkToolState(token);
        const states = Object.values(TOOLS).map((app) => {
          return [app.id, allStates[app.ds]] as const;
        });
        setToolStates(Object.fromEntries(states));
      } catch (error) {
        if (error instanceof InvalidTokenError) {
          setError('Invalid token');
          setToken(null);
        } else {
          console.error('Failed to fetch tool states:', error);
          setError('Failed to fetch tool states');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchToolStates();
  }, [token, setToken]);

  if (!token || error) return null;

  return (
    <div className="w-64 border-r h-screen">
      <div className="p-4 border-b">
        <Link
          href={token ? `/?token=${token}` : '/'}
          className="text-xl font-bold hover:text-primary transition-colors"
        >
          tinynest
        </Link>
      </div>

      <ScrollArea className="h-[calc(100vh-65px)] px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <p className="text-sm font-semibold">Loading...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Link
              href={token ? `/chat?token=${token}` : '/chat'}
              className="block"
            >
              <Card className={`p-3 hover:bg-accent mb-2 ${activeAppId === 'chat' ? 'bg-accent' : ''}`}>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  <div>
                    <h3 className="font-semibold text-sm">Chat</h3>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Configured Apps */}
            {Object.values(TOOLS).some(app => toolStates[app.id] === 'configured') && (
              <div className="space-y-2">
                <SectionHeader
                  title="Configured Apps"
                  tooltip="These apps are fully set up and have data. They're ready to use!"
                />
                <div className="space-y-2">
                  {Object.values(TOOLS)
                    .filter(app => toolStates[app.id] === 'configured')
                    .map(app => (
                      <AppCard
                        key={app.id}
                        app={app}
                        state={toolStates[app.id]}
                        token={token}
                        isActive={app.id === activeAppId}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Installed Apps */}
            {Object.values(TOOLS).some(app => toolStates[app.id] === 'installed') && (
              <div className="space-y-2">
                <SectionHeader
                  title="Installed Apps"
                  tooltip="Your Tinybird Workspace has the Data Sources installed, but you're not receiving data. Click an app to learn how to add data."
                />
                <div className="space-y-2">
                  {Object.values(TOOLS)
                    .filter(app => toolStates[app.id] === 'installed')
                    .map(app => (
                      <AppCard
                        key={app.id}
                        app={app}
                        state={toolStates[app.id]}
                        token={token}
                        isActive={app.id === activeAppId}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Available Apps */}
            <div className="space-y-2">
              <SectionHeader
                title="Available Apps"
                tooltip="Your Tinybird Workspace doesn't have the Data Sources installed yet. Click an app to learn how to install it."
              />
              <div className="space-y-2">
                {Object.values(TOOLS)
                  .filter(app => !toolStates[app.id] || toolStates[app.id] === 'available')
                  .map(app => (
                    <AppCard
                      key={app.id}
                      app={app}
                      state={toolStates[app.id] || 'available'}
                      token={token}
                      isActive={app.id === activeAppId}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
