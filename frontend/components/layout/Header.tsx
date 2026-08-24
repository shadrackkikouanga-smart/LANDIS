
"use client";

import {
  Bell,
  Search,
  UserCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  getCurrentUser,
  type CurrentUser,
} from "@/services/auth";

function formatRole(
  role: CurrentUser["role"],
) {
  switch (role) {
    case "DIRECTEUR":
      return "Directeur";

    case "CHEF_PROJET":
      return "Chef de projet";

    case "COMMERCIAL":
      return "Commercial";

    case "GEOMETRE":
      return "Géomètre";

    default:
      return role;
  }
}

export default function Header() {
  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadUser() {
      const currentUser =
        await getCurrentUser();

      console.log(
        "UTILISATEUR HEADER :",
        currentUser,
      );

      setUser(currentUser);
      setLoading(false);
    }

    loadUser();
  }, []);

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-20
        items-center
        justify-between
        border-b
        border-slate-200
        bg-white/95
        px-6
        backdrop-blur
        lg:px-8
      "
    >
      {/* Partie gauche */}

      <div>
        <p
          className="
            text-sm
            text-slate-500
          "
        >
          Plateforme de gestion foncière
        </p>

        <h2
          className="
            text-lg
            font-semibold
            text-slate-900
          "
        >
          LANDIS
        </h2>
      </div>

      {/* Partie droite */}

      <div
        className="
          flex
          items-center
          gap-4
        "
      >
        {/* Recherche */}

        <div
          className="
            hidden
            items-center
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            px-3
            py-2
            md:flex
          "
        >
          <Search
            size={17}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Rechercher..."
            className="
              ml-2
              w-40
              bg-transparent
              text-sm
              text-slate-700
              outline-none
              placeholder:text-slate-400
            "
          />
        </div>

        {/* Notifications */}

        <button
          type="button"
          className="
            relative
            rounded-lg
            p-2.5
            text-slate-500
            transition-colors
            hover:bg-slate-100
            hover:text-slate-900
          "
          aria-label="Notifications"
        >
          <Bell size={19} />

          <span
            className="
              absolute
              right-2
              top-2
              h-2
              w-2
              rounded-full
              bg-red-500
            "
          />
        </button>

        {/* Utilisateur */}

        <div
          className="
            flex
            items-center
            gap-3
            border-l
            border-slate-200
            pl-4
          "
        >
          <UserCircle
            size={34}
            strokeWidth={1.5}
            className="text-slate-500"
          />

          <div className="hidden sm:block">
            {loading ? (
              <>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Chargement...
                </p>

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  LANDIS
                </p>
              </>
            ) : user ? (
              <>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  {user.email}
                </p>

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  {formatRole(user.role)}
                </p>
              </>
            ) : (
              <>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Utilisateur
                </p>

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  LANDIS
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

