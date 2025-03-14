import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationBar from "@/components/navigation-bar";
import { AGENTS } from "@/const/agents";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MLT-Agents",
  description: "Personal AI Agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <NavigationBar />
          <div className="flex items-center">
            <aside className="w-1/6 p-6 border-zinc-100 dark:border-zinc-800/40 h-screen pt-52">
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-wider font-medium text-zinc-500 dark:text-zinc-500 mb-3">
                  Available Agents
                </h3>
                {AGENTS.map((agent) => (
                  <button key={agent.prefix} className="w-full text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors p-2 rounded-md">
                    {agent.name} <span className="text-xs text-zinc-500 dark:text-zinc-600">{agent.prefix}</span>
                  </button>
                ))}
              </div>
            </aside>
            <div className="w-5/6">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
