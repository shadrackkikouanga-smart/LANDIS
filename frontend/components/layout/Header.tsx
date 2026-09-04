"use client";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  FileSearch,
  LandPlot,
  Map,
  Search,
  UserCircle,
  Users,
  XCircle,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getCurrentUser,
  type CurrentUser,
} from "@/services/auth";

import {
  getComparaisonsRecensements,
  type ComparaisonRecensement,
} from "@/services/comparaison-recensement.service";

import {
  rechercher,
  type RechercheResultat,
  type TypeRecherche,
} from "@/services/recherche.service";

/* ============================================================
   UTILISATEUR
============================================================ */

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

/* ============================================================
   RÉSULTAT DE RECHERCHE POUR L'AFFICHAGE
============================================================ */

type SearchResult = {
  id: number;
  title: string;
  subtitle: string;
  type: string;
  href: string;
  icon:
    | "parcelle"
    | "terrain"
    | "bloc"
    | "section"
    | "famille"
    | "person";
};

/* ============================================================
   NOTIFICATIONS
============================================================ */

type Notification = {
  id: string;
  type:
    | "ANOMALIE"
    | "AVERTISSEMENT";
  title: string;
  message: string;
  href: string;
};

/* ============================================================
   NORMALISATION
============================================================ */

function normalizeSearch(
  value: string,
) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .trim();
}

/* ============================================================
   ICÔNES DE RECHERCHE
============================================================ */

function getSearchIcon(
  type: SearchResult["icon"],
) {
  switch (type) {
    case "parcelle":
      return (
        <LandPlot size={16} />
      );

    case "terrain":
      return (
        <Map size={16} />
      );

    case "bloc":
      return (
        <LandPlot size={16} />
      );

    case "section":
      return (
        <Map size={16} />
      );

    case "famille":
      return (
        <Users size={16} />
      );

    case "person":
      return (
        <UserCircle size={16} />
      );

    default:
      return (
        <Search size={16} />
      );
  }
}

/* ============================================================
   ICÔNE SELON LE TYPE BACKEND
============================================================ */

function getSearchResultIcon(
  type: TypeRecherche,
): SearchResult["icon"] {
  switch (type) {
    case "PARCELLE":
      return "parcelle";

    case "TERRAIN":
      return "terrain";

    case "BLOC":
      return "bloc";

    case "SECTION":
      return "section";

    case "FAMILLE_FONCIERE":
      return "famille";

    case "ACQUEREUR":
    case "PROPRIETAIRE":
      return "person";

    default:
      return "person";
  }
}

/* ============================================================
   LIBELLÉ DU TYPE
============================================================ */

function getSearchResultType(
  type: TypeRecherche,
): string {
  switch (type) {
    case "PARCELLE":
      return "Parcelle";

    case "TERRAIN":
      return "Terrain";

    case "BLOC":
      return "Bloc";

    case "SECTION":
      return "Section";

    case "FAMILLE_FONCIERE":
      return "Famille foncière";

    case "ACQUEREUR":
      return "Acquéreur";

    case "PROPRIETAIRE":
      return "Propriétaire";

    default:
      return "Résultat";
  }
}

/* ============================================================
   TRANSFORMATION DES RÉSULTATS BACKEND
============================================================ */

function mapSearchResults(
  results: RechercheResultat[],
): SearchResult[] {
  return results
    .slice(0, 20)
    .map((result) => ({
      id: result.id,

      title:
        result.titre,

      subtitle:
        result.sousTitre ||
        result.description ||
        "",

      type:
        getSearchResultType(
          result.type,
        ),

      href:
        result.url,

      icon:
        getSearchResultIcon(
          result.type,
        ),
    }));
}

/* ============================================================
   NOTIFICATIONS DE COMPARAISON
============================================================ */

function getComparisonNotifications(
  comparaisons: ComparaisonRecensement[],
): Notification[] {
  const notifications: Notification[] = [];

  for (const item of comparaisons) {
    const reference =
      item.landis?.parcelle?.reference ||
      `Parcelle #${
        item.landis?.parcelle?.id ??
        item.recensement.id
      }`;

    const recensementId =
      item.recensement.id;

    for (
      const [
        index,
        anomaly,
      ] of (
        item.comparaison
          ?.anomalies || []
      ).entries()
    ) {
      notifications.push({
        id:
          `anomalie-${recensementId}-${index}`,

        type:
          "ANOMALIE",

        title:
          `Anomalie — ${reference}`,

        message:
          anomaly,

        href:
          `/recensements/${recensementId}`,
      });
    }

    for (
      const [
        index,
        warning,
      ] of (
        item.comparaison
          ?.avertissements || []
      ).entries()
    ) {
      notifications.push({
        id:
          `avertissement-${recensementId}-${index}`,

        type:
          "AVERTISSEMENT",

        title:
          `À vérifier — ${reference}`,

        message:
          warning,

        href:
          `/recensements/${recensementId}`,
      });
    }
  }

  return notifications;
}

/* ============================================================
   HEADER
============================================================ */

export default function Header() {
  const [user, setUser] =
    useState<CurrentUser | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [
    searchResults,
    setSearchResults,
  ] = useState<SearchResult[]>(
    [],
  );

  const [
    searchLoading,
    setSearchLoading,
  ] = useState(false);

  const [
    searchError,
    setSearchError,
  ] = useState("");

  const [
    showSearchResults,
    setShowSearchResults,
  ] = useState(false);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>(
    [],
  );

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(false);

  const [
    notificationsLoaded,
    setNotificationsLoaded,
  ] = useState(false);

  const headerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  /* ==========================================================
     CHARGEMENT UTILISATEUR
  ========================================================== */

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser =
          await getCurrentUser();

        console.log(
          "UTILISATEUR HEADER :",
          currentUser,
        );

        setUser(
          currentUser,
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  /* ==========================================================
     FERMETURE DES MENUS À L'EXTÉRIEUR
  ========================================================== */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        headerRef.current &&
        !headerRef.current.contains(
          event.target as Node,
        )
      ) {
        setShowSearchResults(
          false,
        );

        setShowNotifications(
          false,
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /* ==========================================================
     RECHERCHE GLOBALE BACKEND
  ========================================================== */

  useEffect(() => {
    const query =
      normalizeSearch(search);

    if (!query) {
      setSearchResults(
        [],
      );

      setShowSearchResults(
        false,
      );

      setSearchError("");

      return;
    }

    if (query.length < 2) {
      setSearchResults(
        [],
      );

      setSearchError("");

      setShowSearchResults(
        true,
      );

      return;
    }

    let cancelled =
      false;

    async function performSearch() {
      try {
        setSearchLoading(
          true,
        );

        setSearchError("");

        setShowSearchResults(
          true,
        );

        const results =
          await rechercher(
            query,
          );

        if (cancelled) {
          return;
        }

        setSearchResults(
          mapSearchResults(
            results,
          ),
        );
      } catch (error) {
        console.error(
          "Erreur recherche globale NIANI'S IMO :",
          error,
        );

        if (!cancelled) {
          setSearchResults(
            [],
          );

          setSearchError(
            "Impossible d'effectuer la recherche.",
          );
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(
            false,
          );
        }
      }
    }

    const timeout =
      window.setTimeout(
        performSearch,
        300,
      );

    return () => {
      cancelled = true;

      window.clearTimeout(
        timeout,
      );
    };
  }, [search]);

  /* ==========================================================
     NOTIFICATIONS
  ========================================================== */

  async function loadNotifications() {
    try {
      setNotificationsLoading(
        true,
      );

      const comparaisons =
        await getComparaisonsRecensements();

      const nextNotifications =
        getComparisonNotifications(
          comparaisons,
        );

      setNotifications(
        nextNotifications.slice(
          0,
          30,
        ),
      );

      setNotificationsLoaded(
        true,
      );
    } catch (error) {
      console.error(
        "Erreur chargement notifications :",
        error,
      );

      setNotifications(
        [],
      );

      setNotificationsLoaded(
        true,
      );
    } finally {
      setNotificationsLoading(
        false,
      );
    }
  }

  async function handleNotificationsClick() {
    const nextState =
      !showNotifications;

    setShowNotifications(
      nextState,
    );

    setShowSearchResults(
      false,
    );

    if (
      nextState &&
      !notificationsLoaded
    ) {
      await loadNotifications();
    }
  }

  /* ==========================================================
     FOCUS RECHERCHE
  ========================================================== */

  function handleSearchFocus() {
    if (search.trim()) {
      setShowSearchResults(
        true,
      );

      setShowNotifications(
        false,
      );
    }
  }

  /* ==========================================================
     EFFACER RECHERCHE
  ========================================================== */

  function clearSearch() {
    setSearch("");

    setSearchResults(
      [],
    );

    setShowSearchResults(
      false,
    );

    setSearchError("");
  }

  /* ==========================================================
     RENDU
  ========================================================== */

  return (
    <header
      ref={headerRef}
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
      {/* =====================================================
          PARTIE GAUCHE
      ====================================================== */}

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
          NIANI'S IMO
        </h2>
      </div>

      {/* =====================================================
          PARTIE DROITE
      ====================================================== */}

      <div
        className="
          flex
          items-center
          gap-4
        "
      >
        {/* ===================================================
            RECHERCHE
        ==================================================== */}

        <div className="relative block">
          <div
            className="
              flex
              items-center
              rounded-lg
              border
              border-slate-200
              bg-slate-50
              px-3
              py-2
              transition
              focus-within:border-slate-300
              focus-within:bg-white
              focus-within:ring-2
              focus-within:ring-slate-100
            "
          >
            <Search
              size={17}
              className="
                shrink-0
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              onFocus={
                handleSearchFocus
              }
              placeholder="Rechercher..."
              aria-label="Rechercher dans NIANI'S IMO"
              className="
                ml-2
                w-48
                lg:w-56
                bg-transparent
                text-sm
                text-slate-700
                outline-none
                placeholder:text-slate-400
              "
            />

            {search && (
              <button
                type="button"
                onClick={
                  clearSearch
                }
                className="
                  ml-2
                  rounded
                  p-1
                  text-slate-400
                  transition
                  hover:bg-slate-200
                  hover:text-slate-700
                "
                aria-label="Effacer la recherche"
              >
                <XCircle
                  size={15}
                />
              </button>
            )}
          </div>

          {/* =================================================
              RÉSULTATS DE RECHERCHE
          ================================================== */}

          {showSearchResults && (
            <div
              className="
                absolute
                right-0
                top-full
                mt-2
                w-[380px]
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-xl
              "
            >
              {searchLoading ? (
                <div
                  className="
                    px-4
                    py-5
                    text-center
                    text-sm
                    text-slate-500
                  "
                >
                  Recherche en cours...
                </div>
              ) : searchError ? (
                <div
                  className="
                    px-4
                    py-5
                    text-center
                    text-sm
                    text-red-600
                  "
                >
                  {searchError}
                </div>
              ) : searchResults.length ===
                0 ? (
                <div
                  className="
                    px-4
                    py-6
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      text-center
                    "
                  >
                    <Search
                      size={24}
                      className="
                        mb-2
                        text-slate-300
                      "
                    />

                    <p
                      className="
                        text-sm
                        font-medium
                        text-slate-700
                      "
                    >
                      Aucun résultat
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-400
                      "
                    >
                      Aucun élément NIANI'S IMO
                      ne correspond à
                      « {search} ».
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="
                      border-b
                      border-slate-100
                      px-4
                      py-3
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-400
                      "
                    >
                      Résultats
                    </p>
                  </div>

                  <div
                    className="
                      max-h-[420px]
                      overflow-y-auto
                    "
                  >
                    {searchResults.map(
                      (result) => (
                        <Link
                          key={`${result.type}-${result.id}`}
                          href={
                            result.href
                          }
                          onClick={
                            clearSearch
                          }
                          className="
                            flex
                            items-center
                            gap-3
                            border-b
                            border-slate-50
                            px-4
                            py-3
                            transition
                            last:border-b-0
                            hover:bg-slate-50
                          "
                        >
                          <div
                            className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              bg-slate-100
                              text-slate-500
                            "
                          >
                            {getSearchIcon(
                              result.icon,
                            )}
                          </div>

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >
                            <p
                              className="
                                truncate
                                text-sm
                                font-medium
                                text-slate-800
                              "
                            >
                              {result.title}
                            </p>

                            <p
                              className="
                                truncate
                                text-xs
                                text-slate-500
                              "
                            >
                              {result.type}
                              {" · "}
                              {result.subtitle}
                            </p>
                          </div>
                        </Link>
                      ),
                    )}
                  </div>

                  {searchResults.length >=
                    20 && (
                    <div
                      className="
                        border-t
                        border-slate-100
                        px-4
                        py-2
                        text-center
                        text-xs
                        text-slate-400
                      "
                    >
                      Les 20 premiers
                      résultats sont
                      affichés.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ===================================================
            NOTIFICATIONS
        ==================================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={
              handleNotificationsClick
            }
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
            aria-expanded={
              showNotifications
            }
          >
            <Bell size={19} />

            {notifications.length >
              0 && (
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
            )}
          </button>

          {showNotifications && (
            <div
              className="
                absolute
                right-0
                top-full
                mt-2
                w-[380px]
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-xl
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-100
                  px-4
                  py-3
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-900
                    "
                  >
                    Notifications
                  </p>

                  <p
                    className="
                      text-xs
                      text-slate-400
                    "
                  >
                    Recensement ↔ NIANI'S IMO
                  </p>
                </div>

                {notifications.length >
                  0 && (
                  <span
                    className="
                      rounded-full
                      bg-red-50
                      px-2
                      py-1
                      text-xs
                      font-medium
                      text-red-600
                    "
                  >
                    {
                      notifications.length
                    }
                  </span>
                )}
              </div>

              {notificationsLoading ? (
                <div
                  className="
                    px-4
                    py-6
                    text-center
                    text-sm
                    text-slate-500
                  "
                >
                  Chargement des
                  notifications...
                </div>
              ) : notifications.length ===
                0 ? (
                <div
                  className="
                    px-4
                    py-8
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      text-center
                    "
                  >
                    <CheckCircle2
                      size={28}
                      className="
                        mb-2
                        text-emerald-500
                      "
                    />

                    <p
                      className="
                        text-sm
                        font-medium
                        text-slate-700
                      "
                    >
                      Aucune notification
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-400
                      "
                    >
                      Aucun problème
                      détecté dans les
                      comparaisons actuelles.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="
                      max-h-[420px]
                      overflow-y-auto
                    "
                  >
                    {notifications.map(
                      (
                        notification,
                      ) => (
                        <Link
                          key={
                            notification.id
                          }
                          href={
                            notification.href
                          }
                          onClick={() =>
                            setShowNotifications(
                              false,
                            )
                          }
                          className="
                            flex
                            gap-3
                            border-b
                            border-slate-50
                            px-4
                            py-3
                            transition
                            last:border-b-0
                            hover:bg-slate-50
                          "
                        >
                          <div
                            className={`
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              ${
                                notification.type ===
                                "ANOMALIE"
                                  ? "bg-red-50 text-red-500"
                                  : "bg-amber-50 text-amber-500"
                              }
                            `}
                          >
                            <AlertTriangle
                              size={17}
                            />
                          </div>

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >
                            <p
                              className="
                                text-sm
                                font-medium
                                text-slate-800
                              "
                            >
                              {
                                notification.title
                              }
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                leading-5
                                text-slate-500
                              "
                            >
                              {
                                notification.message
                              }
                            </p>

                            <p
                              className="
                                mt-1
                                text-[11px]
                                font-medium
                                text-slate-400
                              "
                            >
                              Voir le
                              recensement →
                            </p>
                          </div>
                        </Link>
                      ),
                    )}
                  </div>

                  <Link
                    href="/recensements/comparaison"
                    onClick={() =>
                      setShowNotifications(
                        false,
                      )
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      border-t
                      border-slate-100
                      px-4
                      py-3
                      text-xs
                      font-medium
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      hover:text-slate-900
                    "
                  >
                    <FileSearch
                      size={14}
                    />

                    Voir toutes les
                    comparaisons
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* ===================================================
            UTILISATEUR
        ==================================================== */}

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
            className="
              text-slate-500
            "
          />

          <div
            className="
              hidden
              sm:block
            "
          >
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
                  NIANI'S IMO
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
                  {formatRole(
                    user.role,
                  )}
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
                  NIANI'S IMO
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}