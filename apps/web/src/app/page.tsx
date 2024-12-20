"use client";

import { useQueryState } from 'nuqs';
import { Suspense } from 'react';
import TokenPrompt from '@/components/token-prompt';

function HomeContent() {
  const [token] = useQueryState('token');

  if (!token) {
    return <TokenPrompt />;
  }

  return (
    <div className="py-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Welcome to Tinynest</h1>
        <p className="text-muted-foreground">
          Select an app from the sidebar to get started. Apps are organized by their status:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Configured Apps</strong> - These apps are fully set up and have data. They&apos;re ready to use!</li>
          <li><strong>Installed Apps</strong> - Your Tinybird Workspace has the Data Sources installed, but you&apos;re not receiving data.</li>
          <li><strong>Available Apps</strong> - Your Tinybird Workspace doesn&apos;t have the Data Sources installed yet.</li>
        </ul>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
