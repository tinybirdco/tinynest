"use client";

import { useQueryState } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { listDataSources } from '@/lib/tinybird';

interface AppGridItem {
  id: string;
  ds: string;
  name: string;
  description: string;
  icon: string;
}

const KNOWN_APPS: AppGridItem[] = [
  {
    id: 'clerk',
    ds: 'clerk',
    name: 'Clerk',
    description: 'Authentication and user management',
    icon: '🔐'
  },
  {
    id: 'resend',
    ds: 'resend',
    name: 'Resend',
    description: 'Email delivery service',
    icon: '✉️'
  },
  {
    id: 'auth0',
    ds: 'auth0_logs',
    name: 'Auth0',
    description: 'Identity platform',
    icon: '🔑'
  },
  {
    id: 'vercel',
    ds: 'vercel_logs',
    name: 'Vercel Logs',
    description: 'Deployment and serverless logs',
    icon: '📊'
  },
  {
    id: 'gitlab',
    ds: 'gitlab',
    name: 'Gitlab',
    description: 'Source code management',
    icon: '🦊'
  },
  {
    id: 'orb',
    ds: 'orb',
    name: 'Orb',
    description: 'Usage-based billing',
    icon: '💰'
  }
];

function AppCard({ app, isInstalled, token }: { app: AppGridItem; isInstalled: boolean; token?: string }) {
  return (
    <Link 
      key={app.id} 
      href={`/${app.id}${token ? `?token=${token}` : ''}`}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{app.icon}</div>
          <div>
            <h2 className="text-xl font-semibold">{app.name}</h2>
            <p className="text-gray-500">{app.description}</p>
            <div className="mt-2">
              {isInstalled ? (
                <span className="text-green-500 text-sm">Installed</span>
              ) : (
                <span className="text-gray-400 text-sm">Not installed</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function Home() {
  const [token, setToken] = useQueryState('token');
  const [inputToken, setInputToken] = useState(token || '');
  const [installedApps, setInstalledApps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchDataSources() {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const sources = await listDataSources(token);
        const installed = sources.map(s => s.name);
        setInstalledApps(installed);
      } catch (error) {
        console.error('Failed to fetch data sources:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDataSources();
  }, [token]);

  const handleSaveToken = () => {
    setToken(inputToken);
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 space-y-4">
          <h1 className="text-2xl font-bold">Welcome to TinyNest</h1>
          <p className="text-gray-500">Please enter your Tinybird token to continue</p>
          <div className="flex gap-2">
            <Input
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Enter your Tinybird token"
            />
            <Button onClick={handleSaveToken}>Save</Button>
          </div>
        </Card>
      </div>
    );
  }

  const installedAppsList = KNOWN_APPS.filter(app => installedApps.includes(app.ds));
  const uninstalledAppsList = KNOWN_APPS.filter(app => !installedApps.includes(app.ds));

  return (
    <div className="space-y-8">
      {installedAppsList.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Installed Apps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {installedAppsList.map((app) => (
              <AppCard key={app.id} app={app} isInstalled={true} token={token} />
            ))}
          </div>
        </div>
      )}
      
      {uninstalledAppsList.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Available Apps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uninstalledAppsList.map((app) => (
              <AppCard key={app.id} app={app} isInstalled={false} token={token} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
