import Link from "next/link";
import { Card } from "@/components/ui/card";

const apps = [
  {
    id: "github",
    name: "GitHub",
    description: "Track repository analytics and developer activity",
    icon: "🚀",
    status: "not_connected",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Analyze team communication and engagement",
    icon: "💬",
    status: "not_connected",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Monitor project velocity and team performance",
    icon: "📊",
    status: "not_connected",
  },
];

export default function AppsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Your Apps</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <Link key={app.id} href={`/app/${app.id}`}>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-4xl mb-4">{app.icon}</div>
                  <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {app.description}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {app.status === "connected" ? "Connected" : "Not Connected"}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
