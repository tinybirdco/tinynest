'use client';

import { useQueryState } from 'nuqs';
import React, { useEffect, useState } from 'react';
import { listDataSources } from '@/lib/tinybird';
import { TOOL_IMPORTS, type ToolId, TOOLS } from '@/lib/constants';

export default function AppPage({ params }: { params: Promise<{ id: string }> }) {
  const [token, setToken] = useQueryState('token');
  const [isInstalled, setIsInstalled] = useState(false);
  const { id } = React.use(params) as { id: ToolId };

  useEffect(() => {
    async function checkInstallation() {
      if (!token) return;
      const sources = await listDataSources(token);
      setIsInstalled(sources.some(source => source.name === TOOLS[id].ds));
    }
    checkInstallation();
  }, [token, id]);

  if (!(id in TOOLS)) {
    return <div>Tool not found</div>;
  }
  const tool_comps = TOOL_IMPORTS[id];
  if (!tool_comps) {
    return <div>Tool not implemented</div>;
  }

  const Component = isInstalled ? tool_comps.Dashboard : tool_comps.Readme;

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">{TOOLS[id].name}</h1>
        <Component />
      </div>
    </div>
  );
}
