import { notFound } from "next/navigation";

const apps = {
  github: {
    name: "GitHub",
    description: "Track repository analytics and developer activity",
    icon: "🚀",
  },
  slack: {
    name: "Slack",
    description: "Analyze team communication and engagement",
    icon: "💬",
  },
  linear: {
    name: "Linear",
    description: "Monitor project velocity and team performance",
    icon: "📊",
  },
} as const;

type AppId = keyof typeof apps;

export default function AppPage({ params }: { params: { appId: string } }) {
  const appId = params.appId as AppId;
  const app = apps[appId];

  if (!app) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="text-4xl">{app.icon}</div>
        <div>
          <h1 className="text-2xl font-semibold">{app.name}</h1>
          <p className="text-muted-foreground">{app.description}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Configuration</h2>
          <p className="text-muted-foreground">
            Connect your {app.name} account to start tracking analytics.
          </p>
          {/* Add configuration form here */}
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Analytics</h2>
          <p className="text-muted-foreground">
            No data available yet. Connect your account to see analytics.
          </p>
          {/* Add analytics dashboard here */}
        </div>
      </div>
    </div>
  );
}
