"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FolderKanban,
  Map,
  Blocks,
  LandPlot,
  Layers,
  Route,
  Users,
  UserRoundCheck,
  Handshake,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  UsersRound,
  ClipboardList,
} from "lucide-react";

const menuSections = [
  {
    title: "Vue générale",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "Lotissement",
    items: [
      {
        name: "Projets",
        href: "/projects",
        icon: FolderKanban,
      },
      {
        name: "Terrains",
        href: "/terrains",
        icon: Map,
      },
      {
        name: "Sections",
        href: "/sections",
        icon: Layers,
      },
      {
        name: "Familles foncières",
        href: "/familles-foncieres",
        icon: UsersRound,
      },
      {
        name: "Recensements",
        href: "/recensements",
        icon: ClipboardList,
      },
      {
        name: "Blocs",
        href: "/blocs",
        icon: Blocks,
      },
      {
        name: "Parcelles",
        href: "/parcelles",
        icon: LandPlot,
      },
      {
        name: "Voies",
        href: "/voies",
        icon: Route,
      },
      {
        name: "Carte",
        href: "/carte",
        icon: Map,
      },
    ],
  },

  {
    title: "Gestion commerciale",
    items: [
      {
        name: "Propriétaires",
        href: "/proprietaires",
        icon: Users,
      },
      {
        name: "Acquéreurs",
        href: "/acquereurs",
        icon: UserRoundCheck,
      },
      {
        name: "Transactions",
        href: "/transactions",
        icon: Handshake,
      },
      {
        name: "Paiements",
        href: "/paiements",
        icon: CreditCard,
      },
      {
        name: "Documents",
        href: "/documents",
        icon: FileText,
      },
    ],
  },

  {
    title: "Administration",
    items: [
      {
        name: "Paramètres",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <aside
      className="
        flex
        min-h-screen
        w-64
        shrink-0
        flex-col
        border-r
        border-slate-200
        bg-white
      "
    >
      {/* Logo */}

      <div
        className="
          flex
          h-20
          shrink-0
          items-center
          border-b
          border-slate-200
          px-6
        "
      >
        <div>
          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            NIANI'S IMO
          </h1>

          <p
            className="
              mt-0.5
              text-xs
              text-slate-500
            "
          >
            Gestion foncière
          </p>
        </div>
      </div>

      {/* Navigation */}

      <nav
        className="
          flex-1
          overflow-y-auto
          px-4
          py-6
        "
      >
        <div className="space-y-7">
          {menuSections.map((section) => (
            <div key={section.title}>
              <p
                className="
                  mb-2
                  px-3
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(
                      `${item.href}/`,
                    );

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex
                        items-center
                        gap-3
                        rounded-lg
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        transition-colors
                        ${
                          isActive
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }
                      `}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.9}
                      />

                      <span>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Déconnexion */}

      <div
        className="
          shrink-0
          border-t
          border-slate-200
          p-4
        "
      >
        <button
          type="button"
          onClick={handleLogout}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-3
            py-2.5
            text-sm
            font-medium
            text-slate-600
            transition-colors
            hover:bg-red-50
            hover:text-red-600
          "
        >
          <LogOut
            size={18}
            strokeWidth={1.9}
          />

          <span>
            Déconnexion
          </span>
        </button>
      </div>
    </aside>
  );
}