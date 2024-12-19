'use client';

import { useQueryState } from 'nuqs';
import React, { useEffect, useState } from 'react';
import { checkToolState } from '@/lib/tinybird';
import { TOOL_IMPORTS, type ToolId, TOOLS, type ToolState } from '@/lib/constants';

export default function AppPage({ params }: { params: Promise<{ id: string }> }) {
  const [token, setToken] = useQueryState('token');
  const [toolState, setToolState] = useState<ToolState>('available');
  const { id } = React.use(params) as { id: ToolId };

  useEffect(() => {
    async function checkInstallation() {
      if (!token) return;
      const state = await checkToolState(token, TOOLS[id].ds);
      setToolState(state);
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

  // Only show Dashboard if tool is configured or installed
  const Component = toolState === 'available' ? tool_comps.Readme : tool_comps.Dashboard;

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{TOOLS[id].name}</h1>
          <span className="text-sm text-muted-foreground">({toolState})</span>
        </div>
        <Component />
      </div>
    </div>
  );
}
