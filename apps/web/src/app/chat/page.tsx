import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Chat</h1>
        <p className="text-muted-foreground">
          Ask questions about your data using natural language
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Connected Data Sources</h2>
            <div className="space-y-2">
              {/* This will be dynamically populated */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>GitHub</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Slack</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Linear</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="font-semibold mb-2">Example Questions</h2>
            <div className="space-y-2 text-sm">
              <p className="cursor-pointer hover:text-blue-500">
                "Show me GitHub activity from last week"
              </p>
              <p className="cursor-pointer hover:text-blue-500">
                "What are the most active Slack channels?"
              </p>
              <p className="cursor-pointer hover:text-blue-500">
                "Compare PR review times across teams"
              </p>
            </div>
          </Card>
        </div>

        <Card className="p-4 flex flex-col h-[600px]">
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-4">
              {/* Chat messages will be rendered here */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">
                  Hi! I can help you analyze data from your connected tools. Try asking
                  me a question about your GitHub activity, Slack usage, or project
                  metrics.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about your data..."
              className="flex-1"
            />
            <Button>Send</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
