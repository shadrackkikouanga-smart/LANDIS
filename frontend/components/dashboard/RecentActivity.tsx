"use client";

import { useEffect, useState } from "react";

import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  LandPlot,
  Map,
  MoreHorizontal,
  Receipt,
  Users,
} from "lucide-react";

import {
  getRecentHistorique,
  Historique,
} from "@/services/historique.service";

function getModuleIcon(module: string) {
  const value = module.toUpperCase();

  if (
    value.includes("PARCELLE") ||
    value.includes("LOTISSEMENT")
  ) {
    return LandPlot;
  }

  if (
    value.includes("TERRAIN") ||
    value.includes("SECTION") ||
    value.includes("BLOC") ||
    value.includes("VOIE")
  ) {
    return Map;
  }

  if (
    value.includes("PROJET")
  ) {
    return FolderKanban;
  }

  if (
    value.includes("PAIEMENT") ||
    value.includes("TRANSACTION") ||
    value.includes("FINANCE")
  ) {
    return Receipt;
  }

  if (
    value.includes("USER") ||
    value.includes("UTILISATEUR") ||
    value.includes("PROPRIETAIRE") ||
    value.includes("ACQUEREUR") ||
    value.includes("FAMILLE")
  ) {
    return Users;
  }

  if (
    value.includes("DOCUMENT") ||
    value.includes("CONTRAT")
  ) {
    return FileText;
  }

  return Activity;
}

function getModuleStyle(module: string) {
  const value = module.toUpperCase();

  if (
    value.includes("PAIEMENT") ||
    value.includes("TRANSACTION") ||
    value.includes("FINANCE")
  ) {
    return {
      icon: "bg-emerald-50 text-emerald-600",
      badge: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    };
  }

  if (
    value.includes("RECENSEMENT")
  ) {
    return {
      icon: "bg-amber-50 text-amber-600",
      badge: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    };
  }

  if (
    value.includes("PARCELLE") ||
    value.includes("TERRAIN") ||
    value.includes("SECTION") ||
    value.includes("BLOC") ||
    value.includes("VOIE")
  ) {
    return {
      icon: "bg-blue-50 text-blue-600",
      badge: "bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    };
  }

  if (
    value.includes("PROJET")
  ) {
    return {
      icon: "bg-violet-50 text-violet-600",
      badge: "bg-violet-50 text-violet-700",
      dot: "bg-violet-500",
    };
  }

  if (
    value.includes("USER") ||
    value.includes("UTILISATEUR") ||
    value.includes("PROPRIETAIRE") ||
    value.includes("ACQUEREUR") ||
    value.includes("FAMILLE")
  ) {
    return {
      icon: "bg-indigo-50 text-indigo-600",
      badge: "bg-indigo-50 text-indigo-700",
      dot: "bg-indigo-500",
    };
  }

  return {
    icon: "bg-gray-100 text-gray-600",
    badge: "bg-gray-100 text-gray-700",
    dot: "bg-gray-500",
  };
}

function formatDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRelativeTime(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const difference =
    Date.now() - value.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60),
  );

  if (minutes < 1) {
    return "À l'instant";
  }

  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `Il y a ${hours} h`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days === 1) {
    return "Hier";
  }

  if (days < 7) {
    return `Il y a ${days} jours`;
  }

  return formatDate(date);
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<
    Historique[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    async function loadActivities() {
      try {
        setLoading(true);
        setError(false);

        const data =
          await getRecentHistorique(10);

        setActivities(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (err) {
        console.error(
          "Erreur chargement activités récentes :",
          err,
        );

        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-gray-200
        bg-white
        shadow-sm
      "
    >
      {/* En-tête */}
      <div
        className="
          flex
          flex-col
          gap-4
          border-b
          border-gray-100
          px-6
          py-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-gray-900
                text-white
              "
            >
              <Activity
                className="
                  h-5
                  w-5
                "
              />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  font-bold
                  tracking-tight
                  text-gray-900
                "
              >
                Activité récente
              </h2>

              <p
                className="
                  mt-0.5
                  text-sm
                  text-gray-500
                "
              >
                Les dernières opérations effectuées dans LANDIS
              </p>
            </div>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-gray-200
            bg-gray-50
            px-3
            py-1.5
            text-xs
            font-medium
            text-gray-600
          "
        >
          <span
            className="
              h-2
              w-2
              rounded-full
              bg-emerald-500
            "
          />

          Activité en temps réel
        </div>
      </div>

      {/* Contenu */}
      <div className="px-6 py-5">
        {loading && (
          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  flex
                  animate-pulse
                  gap-4
                "
              >
                <div
                  className="
                    h-11
                    w-11
                    shrink-0
                    rounded-xl
                    bg-gray-100
                  "
                />

                <div className="flex-1">
                  <div
                    className="
                      h-4
                      w-1/3
                      rounded
                      bg-gray-100
                    "
                  />

                  <div
                    className="
                      mt-2
                      h-3
                      w-2/3
                      rounded
                      bg-gray-100
                    "
                  />

                  <div
                    className="
                      mt-2
                      h-3
                      w-1/4
                      rounded
                      bg-gray-100
                    "
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            className="
              flex
              min-h-32
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-red-50
                text-red-500
              "
            >
              <Activity
                className="
                  h-5
                  w-5
                "
              />
            </div>

            <p
              className="
                mt-3
                text-sm
                font-medium
                text-gray-900
              "
            >
              Impossible de charger l'activité
            </p>

            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              Vérifiez la connexion au serveur.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          activities.length === 0 && (
            <div
              className="
                flex
                min-h-32
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                  text-gray-500
                "
              >
                <Clock
                  className="
                    h-5
                    w-5
                  "
                />
              </div>

              <p
                className="
                  mt-3
                  text-sm
                  font-medium
                  text-gray-900
                "
              >
                Aucune activité récente
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500
                "
              >
                Les nouvelles opérations apparaîtront ici.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          activities.length > 0 && (
            <div className="relative">
              {/* Ligne verticale de la timeline */}
              <div
                className="
                  absolute
                  bottom-6
                  left-5
                  top-6
                  w-px
                  bg-gray-200
                "
              />

              <div className="space-y-1">
                {activities.map(
                  (activity, index) => {
                    const Icon =
                      getModuleIcon(
                        activity.module,
                      );

                    const style =
                      getModuleStyle(
                        activity.module,
                      );

                    return (
                      <div
                        key={activity.id}
                        className="
                          group
                          relative
                          flex
                          gap-4
                          rounded-2xl
                          p-3
                          transition-all
                          duration-200
                          hover:bg-gray-50
                        "
                      >
                        {/* Icône */}
                        <div
                          className={`
                            relative
                            z-10
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${style.icon}
                            ring-4
                            ring-white
                            transition-transform
                            duration-200
                            group-hover:scale-105
                          `}
                        >
                          <Icon
                            className="
                              h-4
                              w-4
                            "
                          />
                        </div>

                        {/* Informations */}
                        <div
                          className="
                            min-w-0
                            flex-1
                            py-0.5
                          "
                        >
                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >
                            <h3
                              className="
                                text-sm
                                font-semibold
                                text-gray-900
                              "
                            >
                              {activity.action}
                            </h3>

                            <span
                              className={`
                                rounded-full
                                px-2
                                py-0.5
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-wide
                                ${style.badge}
                              `}
                            >
                              {activity.module}
                            </span>
                          </div>

                          <p
                            className="
                              mt-1
                              text-sm
                              leading-5
                              text-gray-600
                            "
                          >
                            {activity.description}
                          </p>

                          <div
                            className="
                              mt-2
                              flex
                              flex-wrap
                              items-center
                              gap-x-3
                              gap-y-1
                              text-xs
                              text-gray-400
                            "
                          >
                            <span
                              className="
                                flex
                                items-center
                                gap-1
                              "
                            >
                              <Clock
                                className="
                                  h-3
                                  w-3
                                "
                              />

                              {getRelativeTime(
                                activity.createdAt,
                              )}
                            </span>

                            {activity.User?.name && (
                              <>
                                <span>
                                  •
                                </span>

                                <span>
                                  {activity.User.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Indicateur de dernière activité */}
                        {index === 0 && (
                          <div
                            className="
                              hidden
                              shrink-0
                              items-center
                              gap-1
                              self-start
                              rounded-full
                              bg-emerald-50
                              px-2
                              py-1
                              text-[10px]
                              font-semibold
                              text-emerald-600
                              sm:flex
                            "
                          >
                            <CheckCircle2
                              className="
                                h-3
                                w-3
                              "
                            />

                            Récent
                          </div>
                        )}

                        {/* Flèche au survol */}
                        <ArrowUpRight
                          className="
                            absolute
                            bottom-3
                            right-3
                            hidden
                            h-4
                            w-4
                            text-gray-300
                            transition-all
                            duration-200
                            group-hover:text-gray-500
                            sm:block
                          "
                        />
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}
      </div>

      {/* Pied de carte */}
      {!loading &&
        !error &&
        activities.length > 0 && (
          <div
            className="
              flex
              items-center
              justify-between
              border-t
              border-gray-100
              bg-gray-50/70
              px-6
              py-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                text-gray-500
              "
            >
              <div
                className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  shadow-sm
                "
              >
                <MoreHorizontal
                  className="
                    h-3.5
                    w-3.5
                  "
                />
              </div>

              {activities.length}{" "}
              activités affichées
            </div>

            <span
              className="
                text-xs
                font-medium
                text-gray-400
              "
            >
              Historique LANDIS
            </span>
          </div>
        )}
    </section>
  );
}