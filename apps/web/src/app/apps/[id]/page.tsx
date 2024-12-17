import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "@tremor/react";

interface AppDetailProps {
  params: {
    id: string;
  };
}

const mockChartData = [
  { date: "Jan", value: 2890 },
  { date: "Feb", value: 2756 },
  { date: "Mar", value: 3322 },
  { date: "Apr", value: 3470 },
  { date: "May", value: 3475 },
  { date: "Jun", value: 3129 },
];

export default function AppDetail({ params }: AppDetailProps) {
  const isConnected = false; // This will come from your app state management

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{params.id.charAt(0).toUpperCase() + params.id.slice(1)} Integration</h1>
        <p className="text-muted-foreground">
          {isConnected ? "View your analytics and insights" : "Connect your account to get started"}
        </p>
      </div>

      {isConnected ? (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
                <BarChart
                  data={mockChartData}
                  index="date"
                  categories={["value"]}
                  colors={["blue"]}
                  yAxisWidth={48}
                  height="h-72"
                />
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold">Detailed Analytics</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Integration Settings</h3>
              <p className="text-muted-foreground">Configure your integration settings here.</p>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Connect Your Account</h3>
          <div className="prose dark:prose-invert max-w-none">
            <h4>Getting Started</h4>
            <ol>
              <li>Go to your {params.id} account settings</li>
              <li>Generate an API key with the following permissions:
                <ul>
                  <li>Read access to repositories</li>
                  <li>Read access to user data</li>
                  <li>Read access to analytics</li>
                </ul>
              </li>
              <li>Copy the API key and paste it below</li>
            </ol>
          </div>
          {/* Add your connection form here */}
        </Card>
      )}
    </div>
  );
}
