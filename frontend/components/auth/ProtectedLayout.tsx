"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // La page de connexion est publique.
    if (pathname === "/login") {
      setCheckingAuth(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setCheckingAuth(false);
  }, [pathname, router]);

  /*
   * Pendant la vérification du token,
   * on n'affiche pas l'application.
   */
  if (checkingAuth && pathname !== "/login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />

          <p className="text-sm text-slate-500">
            Vérification de la connexion...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Login = page publique.
   * Aucun Sidebar ni Header.
   */
  if (pathname === "/login") {
    return <>{children}</>;
  }

  /*
   * Toutes les autres pages sont protégées.
   */
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}