import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import NavigationBar from "@/components/navigation-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationBar />
          <div className="flex items-center">
            <div className="w-1/6 p-6 border-zinc-100 dark:border-zinc-800/40 h-screen pt-60">
              <p className="text-xs uppercase tracking-wider font-medium text-zinc-400 dark:text-zinc-500 mb-6">
                Available Agents
              </p>
              <div className="flex flex-col space-y-4">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors">
                  Google Mail
                </p>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors">
                  Google Calendar
                </p>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors">
                  Google Tasks
                </p>
              </div>
            </div>
            <div className="w-5/6">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
