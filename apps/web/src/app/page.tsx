"use client";

import { useQueryState } from 'nuqs';
import { Suspense } from 'react';
import TokenPrompt from '@/components/token-prompt';
import Link from 'next/link';
import { SquareArrowOutUpRight } from 'lucide-react';

function HomeContent() {
  const [token] = useQueryState('token');

  return (
    <div className="py-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Welcome to Tinynest</h1>
        {token && (
          <>
            <p className="text-muted-foreground">
              Select an app from the sidebar to get started. Apps are organized by their status:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Configured Apps</strong> - These apps are fully set up and have data. They&apos;re ready to use!</li>
              <li><strong>Installed Apps</strong> - Your Tinybird Workspace has the Data Sources installed, but you&apos;re not receiving data.</li>
              <li><strong>Available Apps</strong> - Your Tinybird Workspace doesn&apos;t have the Data Sources installed yet.</li>
            </ul>
          </>
        )}
        {!token && (
          <div className="prose">
            <p>Tinynest lets you see what&apos;s going on in your SaaS stack.</p>
            <p>Modern products use a nest of SaaS tools as building blocks, like Tinybird for Analytics, Clerk for Auth, Stripe for Payments, and more.</p>
            <p>This lets you focus on building your product and delighting your users.</p>
            <p>But it can also make it hard to see the complete picture of how your users are interacting with your product.</p>
            <p>Tinynest helps you to bring that data together in one place.</p>
            <TokenPrompt />

            <h2>New here? Deploy now</h2>
            <p>
              Deploy a new project to Tinybird to get started
            </p>
            <Link
              href="https://app.tinybird.co/?starter_kit=https://github.com/tinybirdco/tinynest/tinybird"
              target="_blank"
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
            >
              Deploy to Tinybird
              <SquareArrowOutUpRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div >
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
