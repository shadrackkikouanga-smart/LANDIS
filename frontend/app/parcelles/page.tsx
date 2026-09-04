"use client";

import { useEffect, useState } from "react";
import {
  LandPlot,
  RefreshCw,
  Plus,
  Eye,
  Pencil,
  Trash2,
  UserRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

import {
  getParcelles,
  deleteParcelle,
  Parcelle,
} from "@/services/parcelles";

import ParcelleForm from "@/components/parcelles/ParcelleForm";
import ParcelleAttributionForm from "@/components/parcelles/ParcelleAttributionForm";

const PARCELLES_PAR_PAGE = 20;

export default function ParcellesPage() {
  const [parcelles, setParcelles] =
    useState<Parcelle[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [
    parcelleAttribution,
    setParcelleAttribution,
  ] = useState<Parcelle | null>(null);

  const [page, setPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  async function loadParcelles(
    requestedPage = page,
  ) {
    try {
      setLoading(true);
      setError("");

      const response =
        await getParcelles(
          requestedPage,
          PARCELLES_PAR_PAGE,
        );

      setParcelles(response.data);
      setTotal(response.meta.total);
      setTotalPages(
        response.meta.totalPages,
      );
      setPage(response.meta.page);
    } catch (error) {
      console.error(
        "Erreur chargement parcelles :",
        error,
      );

      setError(
        "Impossible de charger les parcelles.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadParcelles(1);
  }, []);

  async function handleDelete(
    parcelle: Parcelle,
  ) {
    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer la parcelle "${parcelle.reference}" ?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteParcelle(
        parcelle.id,
      );

      /*
       * Si l'on supprime la dernière parcelle
       * de la page courante, on revient
       * automatiquement à la page précédente.
       */
      const pageApresSuppression =
        parcelles.length === 1 &&
        page > 1
          ? page - 1
          : page;

      await loadParcelles(
        pageApresSuppression,
      );
    } catch (error) {
      console.error(
        "Erreur suppression parcelle :",
        error,
      );

      setError(
        "Impossible de supprimer la parcelle. Une parcelle attribuée ne peut pas être supprimée.",
      );
    }
  }

  function getStatusLabel(
    statut: string,
  ) {
    switch (statut) {
      case "ATTRIBUEE":
        return "Attribuée";

      case "DISPONIBLE":
        return "Disponible";

      default:
        return statut;
    }
  }

  function getStatusStyle(
    statut: string,
  ) {
    switch (statut) {
      case "ATTRIBUEE":
        return "bg-blue-50 text-blue-700";

      case "DISPONIBLE":
        return "bg-green-50 text-green-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  function goToPage(
    nouvellePage: number,
  ) {
    if (
      nouvellePage < 1 ||
      nouvellePage > totalPages ||
      nouvellePage === page
    ) {
      return;
    }

    loadParcelles(
      nouvellePage,
    );
  }

  function getPages() {
    if (totalPages <= 7) {
      return Array.from(
        {
          length: totalPages,
        },
        (_, index) =>
          index + 1,
      );
    }

    if (page <= 4) {
      return [
        1,
        2,
        3,
        4,
        5,
        "...",
        totalPages,
      ];
    }

    if (page >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      page - 1,
      page,
      page + 1,
      "...",
      totalPages,
    ];
  }

  const premierElement =
    total === 0
      ? 0
      : (page - 1) *
          PARCELLES_PAR_PAGE +
        1;

  const dernierElement =
    Math.min(
      page *
        PARCELLES_PAR_PAGE,
      total,
    );

  return (
    <div className="space-y-8">
      {/* EN-TÊTE */}

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
        <div className="flex items-center gap-3">
          <div
            className="
              rounded-xl
              bg-slate-900
              p-3
              text-white
            "
          >
            <LandPlot size={24} />
          </div>

          <div>
            <h1
              className="
                text-3xl
                font-bold
                text-slate-900
              "
            >
              Parcelles
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Gestion des parcelles de
              lotissement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              loadParcelles(page)
            }
            disabled={loading}
            className="
              flex
              items-center
              gap-2
              rounded-lg
              border
              border-slate-300
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-700
              hover:bg-slate-50
              disabled:opacity-50
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

          <button
            type="button"
            onClick={() =>
              setShowForm(true)
            }
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-slate-900
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              shadow-sm
              hover:bg-slate-800
            "
          >
            <Plus size={18} />

            Nouvelle parcelle
          </button>
        </div>
      </div>

      {/* ERREUR */}

      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-5
            py-4
            text-sm
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* COMPTEUR */}

      {!loading && (
        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            px-5
            py-4
            shadow-sm
          "
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Nombre total de parcelles
              </p>

              <p
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-slate-900
                "
              >
                {total.toLocaleString(
                  "fr-FR",
                )}
              </p>
            </div>

            {total > 0 && (
              <p className="text-sm text-slate-500">
                Affichage de{" "}
                <span className="font-semibold text-slate-700">
                  {premierElement.toLocaleString(
                    "fr-FR",
                  )}
                </span>{" "}
                à{" "}
                <span className="font-semibold text-slate-700">
                  {dernierElement.toLocaleString(
                    "fr-FR",
                  )}
                </span>{" "}
                sur{" "}
                <span className="font-semibold text-slate-700">
                  {total.toLocaleString(
                    "fr-FR",
                  )}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* CHARGEMENT */}

      {loading && (
        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="
                  h-80
                  animate-pulse
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                "
              />
            ),
          )}
        </div>
      )}

      {/* AUCUNE PARCELLE */}

      {!loading &&
        total === 0 && (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-white
              px-6
              py-16
              text-center
            "
          >
            <LandPlot
              size={40}
              className="
                mx-auto
                text-slate-400
              "
            />

            <h2
              className="
                mt-5
                text-lg
                font-semibold
                text-slate-900
              "
            >
              Aucune parcelle
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              Commencez par créer votre
              première parcelle.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowForm(true)
              }
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-slate-900
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                hover:bg-slate-800
              "
            >
              <Plus size={18} />

              Créer une parcelle
            </button>
          </div>
        )}

      {/* LISTE */}

      {!loading &&
        parcelles.length > 0 && (
          <>
            <div
              className="
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {parcelles.map(
                (parcelle) => (
                  <div
                    key={parcelle.id}
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      shadow-sm
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-slate-100
                        px-5
                        py-4
                      "
                    >
                      <div>
                        <p
                          className="
                            text-xs
                            text-slate-400
                          "
                        >
                          Référence
                        </p>

                        <p
                          className="
                            text-sm
                            font-semibold
                            text-slate-800
                          "
                        >
                          {parcelle.reference}
                        </p>
                      </div>

                      <span
                        className={`
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-medium
                          ${getStatusStyle(
                            parcelle.statut,
                          )}
                        `}
                      >
                        {getStatusLabel(
                          parcelle.statut,
                        )}
                      </span>
                    </div>

                    <div className="p-5">
                      <h2
                        className="
                          text-xl
                          font-bold
                          text-slate-900
                        "
                      >
                        Parcelle{" "}
                        {parcelle.numero}
                      </h2>

                      <div
                        className="
                          mt-5
                          space-y-3
                        "
                      >
                        <div className="text-sm text-slate-600">
                          <span className="text-slate-400">
                            Superficie :
                          </span>{" "}
                          {parcelle.superficie.toLocaleString(
                            "fr-FR",
                          )}{" "}
                          m²
                        </div>

                        <div className="text-sm text-slate-600">
                          <span className="text-slate-400">
                            Bloc :
                          </span>{" "}
                          {parcelle.bloc
                            ?.reference ||
                            `Bloc #${parcelle.blocId}`}
                        </div>
                      </div>

                      <div
                        className="
                          mt-5
                          rounded-lg
                          bg-slate-50
                          px-4
                          py-3
                        "
                      >
                        <p
                          className="
                            text-xs
                            text-slate-400
                          "
                        >
                          Propriétaire
                        </p>

                        {parcelle.proprietaire ? (
                          <p
                            className="
                              mt-1
                              flex
                              items-center
                              gap-2
                              text-sm
                              font-medium
                              text-slate-700
                            "
                          >
                            <UserRound
                              size={15}
                            />

                            {
                              parcelle
                                .proprietaire
                                .nom
                            }{" "}
                            {
                              parcelle
                                .proprietaire
                                .prenom
                            }
                          </p>
                        ) : (
                          <p
                            className="
                              mt-1
                              text-sm
                              text-slate-500
                            "
                          >
                            Aucun propriétaire
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className="
                        flex
                        gap-2
                        border-t
                        border-slate-100
                        bg-slate-50
                        px-5
                        py-4
                      "
                    >
                      <Link
                        href={`/parcelles/${parcelle.id}`}
                        className="
                          inline-flex
                          flex-1
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          border
                          border-slate-300
                          bg-white
                          px-3
                          py-2.5
                          text-sm
                          font-medium
                          text-slate-700
                          hover:bg-slate-100
                        "
                      >
                        <Eye size={16} />

                        Voir
                      </Link>

                      <Link
                        href={`/parcelles/${parcelle.id}/edit`}
                        className="
                          inline-flex
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-slate-300
                          bg-white
                          px-3
                          py-2.5
                          text-slate-700
                          hover:bg-slate-100
                        "
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </Link>

                      {parcelle.statut !==
                        "ATTRIBUEE" && (
                        <button
                          type="button"
                          onClick={() =>
                            setParcelleAttribution(
                              parcelle,
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-blue-200
                            bg-white
                            px-3
                            py-2.5
                            text-blue-600
                            hover:bg-blue-50
                          "
                          title="Attribuer"
                        >
                          <UserRound
                            size={16}
                          />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            parcelle,
                          )
                        }
                        className="
                          inline-flex
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-red-200
                          bg-white
                          px-3
                          py-2.5
                          text-red-600
                          hover:bg-red-50
                        "
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* PAGINATION */}

            {totalPages > 1 && (
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-sm
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p className="text-sm text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-800">
                    {page}
                  </span>{" "}
                  sur{" "}
                  <span className="font-semibold text-slate-800">
                    {totalPages}
                  </span>
                </p>

                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      goToPage(page - 1)
                    }
                    disabled={
                      page === 1 ||
                      loading
                    }
                    className="
                      inline-flex
                      h-9
                      items-center
                      gap-1
                      rounded-lg
                      border
                      border-slate-300
                      bg-white
                      px-3
                      text-sm
                      font-medium
                      text-slate-700
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <ChevronLeft
                      size={16}
                    />

                    <span className="hidden sm:inline">
                      Précédent
                    </span>
                  </button>

                  {getPages().map(
                    (pageNumber, index) =>
                      pageNumber ===
                      "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            text-sm
                            text-slate-400
                          "
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() =>
                            goToPage(
                              pageNumber as number,
                            )
                          }
                          disabled={loading}
                          className={`
                            h-9
                            min-w-9
                            rounded-lg
                            px-2
                            text-sm
                            font-medium
                            transition
                            ${
                              pageNumber ===
                              page
                                ? "bg-slate-900 text-white"
                                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            }
                          `}
                        >
                          {pageNumber}
                        </button>
                      ),
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      goToPage(page + 1)
                    }
                    disabled={
                      page ===
                        totalPages ||
                      loading
                    }
                    className="
                      inline-flex
                      h-9
                      items-center
                      gap-1
                      rounded-lg
                      border
                      border-slate-300
                      bg-white
                      px-3
                      text-sm
                      font-medium
                      text-slate-700
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <span className="hidden sm:inline">
                      Suivant
                    </span>

                    <ChevronRight
                      size={16}
                    />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      {/* FORMULAIRE CREATION */}

      {showForm && (
        <ParcelleForm
          onSuccess={() => {
            setShowForm(false);
            loadParcelles(1);
          }}
          onCancel={() =>
            setShowForm(false)
          }
        />
      )}

      {/* FORMULAIRE ATTRIBUTION */}

      {parcelleAttribution && (
        <ParcelleAttributionForm
          parcelle={
            parcelleAttribution
          }
          onSuccess={() => {
            setParcelleAttribution(
              null,
            );

            loadParcelles(page);
          }}
          onCancel={() =>
            setParcelleAttribution(
              null,
            )
          }
        />
      )}
    </div>
  );
}