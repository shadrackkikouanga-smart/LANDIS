"use client";

import { usePathname } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  // La page de connexion n'affiche
  // ni Sidebar ni Header.
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Toutes les autres pages utilisent
  // l'interface principale LANDIS.
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Zone principale */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}