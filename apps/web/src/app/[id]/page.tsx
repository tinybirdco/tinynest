'use client';

import { useQueryState } from 'nuqs';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { listDataSources, query } from '@/lib/tinybird';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

const MOCK_DATA = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 700 }
];

const INSTALLATION_GUIDES = {
  clerk: `# Installing Clerk Integration

1. Sign up for a Clerk account
2. Create a new application
3. Configure your endpoints
4. Add the following to your Tinybird pipes...`,

  resend: `# Installing Resend Integration

1. Create a Resend account
2. Generate an API key
3. Set up your email domain
4. Configure the data source...`,

  auth0: `# Installing Auth0 Integration

1. Set up an Auth0 account
2. Create a new application
3. Configure your callbacks
4. Set up the event tracking...`
};

export default function AppPage({ params }: { params: Promise<{ id: string }> }) {
  const [token, setToken] = useQueryState('token');
  const [isInstalled, setIsInstalled] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const { id } = React.use(params);

  useEffect(() => {
    async function checkInstallation() {
      if (!token) return;

      try {
        const sources = await listDataSources(token);
        setIsInstalled(sources.some(s => s.name === id));

        if (sources.some(s => s.name === id)) {
          const result = await query(token, `select count() as total from ${id} format json`);
          setTotalCount(result.data[0]?.total || 0);
        }
      } catch (error) {
        console.error('Failed to check installation:', error);
      }
    }

    checkInstallation();
  }, [token, id]);

  if (!isInstalled) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Analytics for {id}</h1>
        <Link
          href={token ? `/?token=${token}` : '/'}
          className="text-sm text-gray-500 hover:text-gray-700 mb-8 inline-block"
        >
          ← Back to Apps
        </Link>
        <Card className="p-6">
          <div className="prose">
            <pre className="p-4 bg-gray-100 rounded">
              {INSTALLATION_GUIDES[id as keyof typeof INSTALLATION_GUIDES] || 'Installation guide coming soon...'}
            </pre>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Analytics for {id}</h1>
      <Link
        href={token ? `/?token=${token}` : '/'}
        className="text-sm text-gray-500 hover:text-gray-700 mb-8 inline-block"
      >
        ← Back to Apps
      </Link>
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Total Records</h2>
          <p className="text-4xl font-bold">{totalCount?.toLocaleString() || '...'}</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Over Time</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
