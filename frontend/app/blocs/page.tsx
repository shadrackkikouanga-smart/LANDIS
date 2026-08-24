"use client";

import { useEffect, useState } from "react";

import {
  Blocks,
  RefreshCw,
  Plus,
  Eye,
  Pencil,
  Trash2,
  LandPlot,
  Ruler,
  Grid3X3,
} from "lucide-react";

import Link from "next/link";

import {
  getBlocs,
  deleteBloc,
  Bloc,
} from "@/services/blocs";

export default function BlocsPage() {
  const [blocs, setBlocs] =
    useState<Bloc[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadBlocs() {
    try {
      setLoading(true);
      setError("");

      const data = await getBlocs();

      setBlocs(data);
    } catch (error) {
      console.error(
        "Erreur chargement blocs :",
        error,
      );

      setError(
        "Impossible de charger les blocs.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlocs();
  }, []);

  async function handleDelete(
    bloc: Bloc,
  ) {
    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer le bloc "${bloc.reference}" ? Cette opération peut échouer si des données liées empêchent sa suppression.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBloc(bloc.id);

      await loadBlocs();
    } catch (error) {
      console.error(
        "Erreur suppression bloc :",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer le bloc.",
      );
    }
  }

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
            <Blocks size={24} />
          </div>

          <div>

            <h1
              className="
                text-3xl
                font-bold
                text-slate-900
              "
            >
              Blocs
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Gestion des blocs de lotissement
            </p>

          </div>

        </div>


        <div className="flex gap-3">

          <button
            type="button"
            onClick={loadBlocs}
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


          <Link
            href="/blocs/new"
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
              hover:bg-slate-800
            "
          >
            <Plus size={18} />

            Nouveau bloc
          </Link>

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


      {/* STATISTIQUES */}

      {!loading && (
        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-3
          "
        >

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
            <p className="text-sm text-slate-500">
              Nombre de blocs
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-bold
                text-slate-900
              "
            >
              {blocs.length}
            </p>
          </div>


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
            <p className="text-sm text-slate-500">
              Superficie totale
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-bold
                text-slate-900
              "
            >
              {blocs
                .reduce(
                  (total, bloc) =>
                    total +
                    Number(
                      bloc.superficie,
                    ),
                  0,
                )
                .toLocaleString("fr-FR")}{" "}
              m²
            </p>
          </div>


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
            <p className="text-sm text-slate-500">
              Parcelles déclarées
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-bold
                text-slate-900
              "
            >
              {blocs.reduce(
                (total, bloc) =>
                  total +
                  Number(
                    bloc.nombreParcelles,
                  ),
                0,
              )}
            </p>
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
                  h-72
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


      {/* VIDE */}

      {!loading &&
        blocs.length === 0 && (
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
            <Blocks
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
              Aucun bloc
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              Commencez par créer le premier bloc
              d'un terrain.
            </p>

            <Link
              href="/blocs/new"
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

              Créer un bloc
            </Link>
          </div>
        )}


      {/* LISTE */}

      {!loading &&
        blocs.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              gap-6
              md:grid-cols-2
              xl:grid-cols-3
            "
          >

            {blocs.map(
              (bloc) => (
                <div
                  key={bloc.id}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                  "
                >

                  {/* HEADER */}

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

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          rounded-lg
                          bg-slate-100
                          p-2.5
                        "
                      >
                        <Blocks
                          size={20}
                          className="text-slate-700"
                        />
                      </div>

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
                          {bloc.reference}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* CONTENU */}

                  <div className="p-5">

                    <div
                      className="
                        space-y-4
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          text-slate-600
                        "
                      >
                        <Ruler
                          size={17}
                          className="text-slate-400"
                        />

                        <span>
                          {Number(
                            bloc.superficie,
                          ).toLocaleString(
                            "fr-FR",
                          )}{" "}
                          m²
                        </span>
                      </div>


                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          text-slate-600
                        "
                      >
                        <Grid3X3
                          size={17}
                          className="text-slate-400"
                        />

                        <span>
                          {bloc.nombreParcelles}{" "}
                          parcelles
                        </span>
                      </div>


                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          text-slate-600
                        "
                      >
                        <LandPlot
                          size={17}
                          className="text-slate-400"
                        />

                        <span>
                          {bloc.terrain?.nom ||
                            "Terrain non renseigné"}
                        </span>
                      </div>

                    </div>

                  </div>


                  {/* ACTIONS */}

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
                      href={`/blocs/${bloc.id}`}
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
                      href={`/blocs/${bloc.id}/edit`}
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


                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(bloc)
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
        )}

    </div>
  );
}