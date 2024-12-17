import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TinyNest - Your Integration Platform",
  description: "Build and manage your integrations with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className={cn(inter.className, "h-full")}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
