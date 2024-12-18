'use client';

import { useQueryState } from 'nuqs';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { listDataSources } from '@/lib/tinybird';
import dynamic from 'next/dynamic';

const TOOLS = {
  clerk: {
    name: 'Clerk',
    Dashboard: dynamic(() => import('@/components/tools/clerk/dashboard')),
    Readme: dynamic(() => import('@/components/tools/clerk/readme')),
  },
  resend: {
    name: 'Resend',
    Dashboard: dynamic(() => import('@/components/tools/resend/dashboard')),
    Readme: dynamic(() => import('@/components/tools/resend/readme')),
  },
  auth0: {
    name: 'Auth0',
    Dashboard: dynamic(() => import('@/components/tools/auth0/dashboard')),
    Readme: dynamic(() => import('@/components/tools/auth0/readme')),
  },
} as const;

type ToolId = keyof typeof TOOLS;

export default function AppPage({ params }: { params: Promise<{ id: string }> }) {
  const [token, setToken] = useQueryState('token');
  const [isInstalled, setIsInstalled] = useState(false);
  const { id } = React.use(params) as { id: ToolId };

  useEffect(() => {
    async function checkInstallation() {
      if (!token) return;
      const sources = await listDataSources(token);
      setIsInstalled(sources.some(source => source.name.startsWith(id)));
    }
    checkInstallation();
  }, [token, id]);

  const tool = TOOLS[id];
  if (!tool) {
    return <div>Tool not found</div>;
  }

  const Component = isInstalled ? tool.Dashboard : tool.Readme;
  
  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">{tool.name}</h1>
        <Component />
      </div>
    </div>
  );
}
