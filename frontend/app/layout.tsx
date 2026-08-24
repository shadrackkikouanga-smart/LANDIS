import type { Metadata } from "next";
import "./globals.css";

import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

import AppShell from "@/components/layout/AppShell";
import ThemeProvider from "@/components/providers/ThemeProvider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LANDIS",
  description:
    "Plateforme de gestion de lotissement LANDIS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn(
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <ThemeProvider>
          <AppShell>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}