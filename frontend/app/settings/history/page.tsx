"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  History,
  Search,
  User,
  Calendar,
  Activity,
  RefreshCw,
} from "lucide-react";

import {
  getHistory,
  HistoryItem,
} from "@/services/settings";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const data = await getHistory();

      setHistory(data);
    } catch (err) {
      console.error(
        "Erreur lors du chargement de l'historique :",
        err,
      );

      setError(
        "Impossible de charger l'historique.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        !searchValue ||
        item.action
          .toLowerCase()
          .includes(searchValue) ||
        item.module
          .toLowerCase()
          .includes(searchValue) ||
        item.description
          .toLowerCase()
          .includes(searchValue) ||
        item.User?.name
          ?.toLowerCase()
          .includes(searchValue);

      const matchesAction =
        !actionFilter ||
        item.action.toLowerCase() ===
          actionFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesAction
      );
    });
  }, [
    history,
    search,
    actionFilter,
  ]);

  function formatDate(
    date: string,
  ) {
    return new Date(date).toLocaleString(
      "fr-FR",
      {
        dateStyle: "short",
        timeStyle: "short",
      },
    );
  }

  function formatAction(
    action: string,
  ) {
    return action
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /^\w/,
        (letter) =>
          letter.toUpperCase(),
      );
  }

  return (
    <div className="space-y-8">

      {/* En-tête */}
      <div>
        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-lg
              bg-slate-900
              text-white
            "
          >
            <History size={22} />
          </div>

          <div>

            <h1
              className="
                text-3xl
                font-bold
                text-slate-900
              "
            >
              Historique
            </h1>

            <p
              className="
                mt-1
                text-slate-500
              "
            >
              Consultez les actions
              effectuées dans NIANI'S IMO.
            </p>

          </div>

        </div>
      </div>

      {/* Recherche et filtres */}
      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
        "
      >

        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          {/* Recherche */}
          <div
            className="
              relative
              w-full
              lg:max-w-md
            "
          >

            <Search
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
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
              placeholder="Rechercher dans l'historique..."
              className="
                w-full
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                py-2.5
                pl-10
                pr-4
                text-sm
                outline-none
                transition
                focus:border-slate-400
                focus:bg-white
              "
            />

          </div>

          {/* Filtres */}
          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >

            <select
              value={actionFilter}
              onChange={(event) =>
                setActionFilter(
                  event.target.value,
                )
              }
              className="
                rounded-lg
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                text-slate-700
                outline-none
              "
            >

              <option value="">
                Toutes les actions
              </option>

              {Array.from(
                new Set(
                  history.map(
                    (item) =>
                      item.action,
                  ),
                ),
              ).map((action) => (
                <option
                  key={action}
                  value={action}
                >
                  {formatAction(action)}
                </option>
              ))}

            </select>

            <button
              type="button"
              onClick={loadHistory}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-700
                hover:bg-slate-50
              "
            >

              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Actualiser

            </button>

          </div>

        </div>

      </div>

      {/* Historique */}
      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        <div
          className="
            border-b
            border-slate-200
            px-6
            py-4
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <Activity
                size={19}
                className="text-slate-600"
              />

              <h2
                className="
                  text-lg
                  font-semibold
                  text-slate-900
                "
              >
                Activité récente
              </h2>

            </div>

            <span
              className="
                text-sm
                text-slate-500
              "
            >
              {filteredHistory.length} action
              {filteredHistory.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

        </div>

        {/* Erreur */}
        {error && (
          <div
            className="
              px-6
              py-5
              text-sm
              text-red-600
            "
          >
            {error}
          </div>
        )}

        {/* Chargement */}
        {loading && (
          <div
            className="
              px-6
              py-10
              text-center
              text-sm
              text-slate-500
            "
          >
            Chargement de l'historique...
          </div>
        )}

        {/* Aucun résultat */}
        {!loading &&
          !error &&
          filteredHistory.length === 0 && (
            <div
              className="
                px-6
                py-12
                text-center
              "
            >

              <History
                size={36}
                className="
                  mx-auto
                  text-slate-300
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  text-slate-500
                "
              >
                Aucune activité trouvée.
              </p>

            </div>
          )}

        {/* Liste */}
        {!loading &&
          filteredHistory.length > 0 && (
            <div
              className="
                divide-y
                divide-slate-100
              "
            >

              {filteredHistory.map(
                (item) => (

                  <div
                    key={item.id}
                    className="
                      px-6
                      py-5
                      transition
                      hover:bg-slate-50
                    "
                  >

                    <div
                      className="
                        flex
                        flex-col
                        gap-4
                        md:flex-row
                        md:items-center
                        md:justify-between
                      "
                    >

                      {/* Action */}
                      <div
                        className="
                          flex
                          items-start
                          gap-4
                        "
                      >

                        <div
                          className="
                            mt-1
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-slate-100
                            text-slate-600
                          "
                        >
                          <Activity
                            size={17}
                          />
                        </div>

                        <div>

                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >

                            <p
                              className="
                                font-semibold
                                text-slate-900
                              "
                            >
                              {formatAction(
                                item.action,
                              )}
                            </p>

                            <span
                              className="
                                rounded-full
                                bg-slate-100
                                px-2.5
                                py-1
                                text-xs
                                font-medium
                                text-slate-600
                              "
                            >
                              {item.module}
                            </span>

                          </div>

                          <p
                            className="
                              mt-1
                              text-sm
                              text-slate-500
                            "
                          >
                            {item.description}
                          </p>

                        </div>

                      </div>

                      {/* Informations */}
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-4
                          text-sm
                          text-slate-500
                          md:justify-end
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                          "
                        >

                          <User size={15} />

                          {item.User?.name ??
                            "Système"}

                        </div>

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                          "
                        >

                          <Calendar
                            size={15}
                          />

                          {formatDate(
                            item.createdAt,
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                ),
              )}

            </div>
          )}

      </div>

    </div>
  );
}