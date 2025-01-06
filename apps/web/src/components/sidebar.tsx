'use client';

import { useQueryState } from 'nuqs';
import { useState, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { checkToolState, InvalidTokenError } from '@/lib/tinybird';
import { TOOLS, type AppGridItem, type ToolState } from '@/lib/constants';
import { SectionHeader } from '@/components/section-header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, HardDriveDownload, Settings, ChevronRight, ChevronLeft, Menu, LayoutDashboard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import Image from 'next/image';

function AppCard({
  app,
  state,
  token,
  isActive,
  isCollapsed
}: {
  app: AppGridItem;
  state: ToolState;
  token?: string | null;
  isActive: boolean;
  isCollapsed?: boolean;
}) {
  const stateColors = {
    configured: '',
    installed: '',
    available: ''
  };

  return (
    <Link
      className="block"
      href={`/${app.id}${token ? `?token=${token}` : ''}`}
    >
      <Card className={`h-[42px] hover:bg-accent mb-2 ${stateColors[state]} ${isActive ? 'bg-accent' : ''} ${isCollapsed ? 'w-10' : ''}`}>
        <div className={`flex items-center justify-between h-full ${isCollapsed ? 'px-2' : 'px-3'} w-full`}>
          <div className={`flex items-center gap-3 min-w-0 ${isCollapsed && 'mx-auto'}`}>
            {app.icon_url && <Image src={app.icon_url} width={16} height={16} alt={app.name} className="flex-shrink-0" />}
            {!isCollapsed && <span className="font-medium truncate">{app.name}</span>}
          </div>
          {!isCollapsed && (
            <div>
              {state === 'available' && <HardDriveDownload className="w-4 h-4 text-muted-foreground" />}
              {state === 'installed' && <Settings className="w-4 h-4 text-muted-foreground" />}
            </div>
          )}
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    async function fetchToolStates() {
      if (!token) {
        const states = Object.values(TOOLS).map((app) => {
          return [app.id, 'available'] as const;
        });
        setToolStates(Object.fromEntries(states));
      } else {
        setIsLoading(true);
        try {
          const allStates = await checkToolState(token);
          const states = Object.values(TOOLS).map((app) => {
            return [app.id, allStates[app.ds] ?? 'available'] as const;
          });
          setToolStates(Object.fromEntries(states));
        } catch (error) {
          if (error instanceof InvalidTokenError) {
            setToken(null);
          } else {
            console.error('Failed to fetch tool states:', error);
          }
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchToolStates();
  }, [token, setToken]);

  return (
    <>
      {/* Mobile Menu Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarInner 
            token={token}
            activeAppId={activeAppId}
            toolStates={toolStates}
            isLoading={isLoading}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={`border-r h-screen hidden md:block relative ${isCollapsed ? 'w-auto' : 'w-64'} transition-all duration-300`}>
        <SidebarInner 
          token={token}
          activeAppId={activeAppId}
          toolStates={toolStates}
          isLoading={isLoading}
          isCollapsed={isCollapsed}
        />
        
        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute ${isCollapsed ? '-right-4' : '-right-3'} bottom-4 rounded-full border shadow-md bg-background`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </>
  );
}

// New component for the inner content of the sidebar
function SidebarInner({ 
  token, 
  activeAppId, 
  toolStates, 
  isLoading,
  isCollapsed 
}: { 
  token: string | null | undefined;
  activeAppId?: string;
  toolStates: Record<string, ToolState>;
  isLoading: boolean;
  isCollapsed?: boolean;
}) {
  return (
    <>
      <div className="p-4 border-b">
        <Link
          href={token ? `/?token=${token}` : '/'}
          className={`font-bold hover:text-primary transition-colors ${isCollapsed ? 'text-lg' : 'text-xl'}`}
        >
          {isCollapsed ? 'tn' : 'tinynest'}
        </Link>
      </div>

      <ScrollArea className={`h-[calc(100vh-65px)] py-6 ${isCollapsed ? 'px-1' : 'px-4'}`}>
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
              <Card className={`h-[42px] hover:bg-accent mb-2 ${activeAppId === 'chat' ? 'bg-accent' : ''} ${isCollapsed ? 'w-10' : ''}`}>
                <div className={`flex items-center h-full ${isCollapsed ? 'px-2' : 'px-3'} w-full`}>
                  <div className={`flex items-center gap-3 min-w-0 ${isCollapsed && 'mx-auto'}`}>
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <div>
                        <h3 className="font-medium text-sm">Chat</h3>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>

            {/* Configured Apps */}
            {Object.values(TOOLS).some(app => toolStates[app.id] === 'configured') && (
              <div className="space-y-2">
                {isCollapsed ? (
                  <div className="h-[24px] flex items-center justify-center mb-2 w-10">
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                  </div>
                ) : (
                  <SectionHeader
                    title="Dashboards"
                    tooltip="These apps are fully set up and have data. They're ready to use!"
                  />
                )}
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
                        isCollapsed={isCollapsed}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Installed Apps */}
            {Object.values(TOOLS).some(app => toolStates[app.id] === 'installed') && (
              <div className="space-y-2">
                {isCollapsed ? (
                  <div className="h-[24px] flex items-center justify-center mb-2 w-10">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                  </div>
                ) : (
                  <SectionHeader
                    title="Installed"
                    tooltip="Your Tinybird Workspace has the Data Sources installed, but you're not receiving data. Click an app to learn how to add data."
                  />
                )}
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
                        isCollapsed={isCollapsed}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Available Apps */}
            {Object.values(TOOLS).some(app => toolStates[app.id] === 'available') && (
              <div className="space-y-2">
                {isCollapsed ? (
                  <div className="h-[24px] flex items-center justify-center mb-2 w-10">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                ) : (
                  <SectionHeader
                    title="Available"
                    tooltip="Your Tinybird Workspace doesn't have the Data Sources installed yet. Click an app to learn how to install it."
                  />
                )}
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
                        isCollapsed={isCollapsed}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </>
  );
}
