"use client";

import { useQueryState } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { listDataSources } from '@/lib/tinybird';
import { TOOLS, type AppGridItem } from '@/lib/constants';
import TokenPrompt from '@/components/token-prompt';

function AppCard({ app, isInstalled, token }: { app: AppGridItem; isInstalled: boolean; token?: string }) {
  return (
    <Link
      key={app.id}
      href={`/${app.id}${token ? `?token=${token}` : ''}`}
    >
      <Card className={`p-4 hover:bg-accent ${isInstalled ? 'border-primary' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="text-2xl">{app.icon}</div>
          <div>
            <h3 className="font-semibold">{app.name}</h3>
            <p className="text-sm text-muted-foreground">{app.description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function Home() {
  const [token] = useQueryState('token');
  const [installedApps, setInstalledApps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchDataSources() {
      if (!token) return;
      setIsLoading(true);
      try {
        const sources = await listDataSources(token);
        setInstalledApps(sources.map(source => source.name));
      } catch (error) {
        console.error('Failed to fetch data sources:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDataSources();
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
          {installedApps.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Installed Apps</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.values(TOOLS)
                  .filter(app => installedApps.includes(app.ds))
                  .map(app => (
                    <AppCard
                      key={app.id}
                      app={app}
                      isInstalled={true}
                      token={token}
                    />
                  ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Available Apps</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.values(TOOLS)
                .filter(app => !installedApps.includes(app.ds))
                .map(app => (
                  <AppCard
                    key={app.id}
                    app={app}
                    isInstalled={false}
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
