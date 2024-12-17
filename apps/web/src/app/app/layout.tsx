import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { TeamProvider } from "@/context/team-context";
import TeamSwitcher from "@/components/team-switcher";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeamProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link href="/app" className="text-2xl font-bold">
                TinyNest
              </Link>
              <TeamSwitcher />
              <nav className="flex items-center space-x-4">
                <Link href="/app" className="text-sm font-medium">
                  Apps
                </Link>
                <Link href="/app/teams" className="text-sm font-medium">
                  Teams
                </Link>
              </nav>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="container px-4 py-8">{children}</main>
      </div>
    </TeamProvider>
  );
}
