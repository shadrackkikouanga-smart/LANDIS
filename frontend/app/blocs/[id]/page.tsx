"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Blocks,
  Ruler,
  Grid3X3,
  LandPlot,
  Pencil,
  Trash2,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import {
  getBloc,
  deleteBloc,
  ajouterParcelles,
  reduireParcelles,
  Bloc,
} from "@/services/blocs";

import { useParams, useRouter } from "next/navigation";

export default function BlocDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [bloc, setBloc] =
    useState<Bloc | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [nombre, setNombre] =
    useState("1");

  async function loadBloc() {
    try {
      setLoading(true);
      setError("");

      const data = await getBloc(id);

      setBloc(data);
    } catch (error) {
      console.error(
        "Erreur chargement bloc :",
        error,
      );

      setError(
        "Impossible de charger le bloc.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadBloc();
    }
  }, [id]);

  async function handleDelete() {
    if (!bloc) {
      return;
    }

    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer le bloc "${bloc.reference}" ?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await deleteBloc(bloc.id);

      router.push("/blocs");
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
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAjouter() {
    const valeur = Number(nombre);

    if (
      !Number.isInteger(valeur) ||
      valeur <= 0
    ) {
      setError(
        "Veuillez saisir un nombre entier supérieur à 0.",
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const data =
        await ajouterParcelles(
          id,
          valeur,
        );

      setBloc(data);
      setNombre("1");
    } catch (error) {
      console.error(
        "Erreur ajout parcelles :",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'ajouter les parcelles.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReduire() {
    const valeur = Number(nombre);

    if (
      !Number.isInteger(valeur) ||
      valeur <= 0
    ) {
      setError(
        "Veuillez saisir un nombre entier supérieur à 0.",
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const data =
        await reduireParcelles(
          id,
          valeur,
        );

      setBloc(data);
      setNombre("1");
    } catch (error) {
      console.error(
        "Erreur réduction parcelles :",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de réduire les parcelles.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="h-80 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (!bloc) {
    return (
      <div className="space-y-6">

        <Link
          href="/blocs"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-slate-600
            hover:text-slate-900
          "
        >
          <ArrowLeft size={17} />

          Retour aux blocs
        </Link>

        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-8
            text-sm
            text-red-700
          "
        >
          {error ||
            "Bloc introuvable."}
        </div>

      </div>
    );
  }

  const statistiques =
    bloc.statistiques;

  const parcelles =
    bloc.parcelles ?? [];

  return (
    <div className="space-y-8">

      {/* RETOUR */}

      <Link
        href="/blocs"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-medium
          text-slate-600
          hover:text-slate-900
        "
      >
        <ArrowLeft size={17} />

        Retour aux blocs
      </Link>


      {/* EN-TÊTE */}

      <div
        className="
          flex
          flex-col
          gap-5
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div className="flex items-center gap-4">

          <div
            className="
              rounded-xl
              bg-slate-900
              p-3
              text-white
            "
          >
            <Blocks size={26} />
          </div>

          <div>

            <div className="flex items-center gap-3">

              <h1
                className="
                  text-3xl
                  font-bold
                  text-slate-900
                "
              >
                {bloc.reference}
              </h1>

              {statistiques && (
                <span
                  className={`
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-medium
                    ${
                      statistiques.etatBloc ===
                      "COMPLET"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }
                  `}
                >
                  {statistiques.etatBloc}
                </span>
              )}

            </div>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Terrain :{" "}
              {bloc.terrain?.nom ||
                "Non renseigné"}
            </p>

          </div>

        </div>


        {/* ACTIONS */}

        <div className="flex gap-3">

          <Link
            href={`/blocs/${id}/edit`}
            className="
              inline-flex
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
            "
          >
            <Pencil size={17} />

            Modifier
          </Link>


          <button
            type="button"
            onClick={handleDelete}
            disabled={actionLoading}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              border
              border-red-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-red-600
              hover:bg-red-50
              disabled:opacity-50
            "
          >
            <Trash2 size={17} />

            Supprimer
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


      {/* INFORMATIONS */}

      <div
        className="
          grid
          grid-cols-1
          gap-6
          lg:grid-cols-3
        "
      >

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <div className="flex items-center gap-3">

            <Ruler
              size={20}
              className="text-slate-400"
            />

            <div>
              <p className="text-xs text-slate-400">
                Superficie
              </p>

              <p className="text-lg font-semibold text-slate-900">
                {Number(
                  bloc.superficie,
                ).toLocaleString(
                  "fr-FR",
                )}{" "}
                m²
              </p>
            </div>

          </div>
        </div>


        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <div className="flex items-center gap-3">

            <Grid3X3
              size={20}
              className="text-slate-400"
            />

            <div>
              <p className="text-xs text-slate-400">
                Parcelles
              </p>

              <p className="text-lg font-semibold text-slate-900">
                {statistiques
                  ?.nombreParcellesReelles ??
                  parcelles.length}
              </p>
            </div>

          </div>
        </div>


        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <div className="flex items-center gap-3">

            <LandPlot
              size={20}
              className="text-slate-400"
            />

            <div>
              <p className="text-xs text-slate-400">
                Terrain
              </p>

              <p className="text-sm font-semibold text-slate-900">
                {bloc.terrain?.reference ||
                  "Non renseigné"}
              </p>
            </div>

          </div>
        </div>

      </div>


      {/* STATISTIQUES */}

      {statistiques && (
        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >

          <div className="flex items-center gap-3">

            {statistiques.etatBloc ===
            "COMPLET" ? (
              <CheckCircle2
                size={22}
                className="text-green-600"
              />
            ) : (
              <AlertTriangle
                size={22}
                className="text-amber-600"
              />
            )}

            <h2
              className="
                text-lg
                font-semibold
                text-slate-900
              "
            >
              Statistiques du bloc
            </h2>

          </div>


          <div
            className="
              mt-6
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              xl:grid-cols-4
            "
          >

            <StatCard
              label="Parcelles déclarées"
              value={
                statistiques.nombreParcellesDeclarees
              }
            />

            <StatCard
              label="Parcelles réelles"
              value={
                statistiques.nombreParcellesReelles
              }
            />

            <StatCard
              label="Parcelles attribuées"
              value={
                statistiques.parcellesAttribuees
              }
            />

            <StatCard
              label="Parcelles disponibles"
              value={
                statistiques.parcellesDisponibles
              }
            />

            <StatCard
              label="Surface occupée"
              value={`${statistiques.surfaceOccupee.toLocaleString(
                "fr-FR",
              )} m²`}
            />

            <StatCard
              label="Surface disponible"
              value={`${statistiques.surfaceDisponible.toLocaleString(
                "fr-FR",
              )} m²`}
            />

            <StatCard
              label="Taux d'occupation"
              value={`${statistiques.tauxOccupation} %`}
            />

            <StatCard
              label="Écart parcelles"
              value={
                statistiques.ecartParcelles
              }
            />

          </div>

        </div>
      )}


      {/* GESTION DU NOMBRE DE PARCELLES */}

      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        <h2
          className="
            text-lg
            font-semibold
            text-slate-900
          "
        >
          Gestion des parcelles
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          Ajoutez ou réduisez le nombre de
          parcelles du bloc.
        </p>


        <div
          className="
            mt-6
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-end
          "
        >

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-700
              "
            >
              Nombre
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={nombre}
              onChange={(event) =>
                setNombre(
                  event.target.value,
                )
              }
              className="
                w-32
                rounded-lg
                border
                border-slate-300
                px-3
                py-2.5
                text-sm
                outline-none
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
            />
          </div>


          <button
            type="button"
            onClick={handleAjouter}
            disabled={actionLoading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-slate-900
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              hover:bg-slate-800
              disabled:opacity-50
            "
          >
            <Plus size={17} />

            Ajouter
          </button>


          <button
            type="button"
            onClick={handleReduire}
            disabled={actionLoading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-red-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-red-600
              hover:bg-red-50
              disabled:opacity-50
            "
          >
            <Minus size={17} />

            Réduire
          </button>


          <button
            type="button"
            onClick={loadBloc}
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
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
            <RefreshCw size={17} />

            Actualiser
          </button>

        </div>

      </div>


      {/* PARCELLES */}

      <div
        className="
          rounded-2xl
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
            py-5
          "
        >

          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Parcelles du bloc
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            {parcelles.length} parcelle(s)
            enregistrée(s).
          </p>

        </div>


        {parcelles.length === 0 ? (
          <div
            className="
              px-6
              py-12
              text-center
              text-sm
              text-slate-500
            "
          >
            Aucune parcelle enregistrée.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead
                className="
                  bg-slate-50
                "
              >
                <tr>

                  <th
                    className="
                      px-6
                      py-3
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Référence
                  </th>

                  <th
                    className="
                      px-6
                      py-3
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Numéro
                  </th>

                  <th
                    className="
                      px-6
                      py-3
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Superficie
                  </th>

                  <th
                    className="
                      px-6
                      py-3
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    État
                  </th>

                </tr>
              </thead>


              <tbody
                className="
                  divide-y
                  divide-slate-100
                "
              >

                {parcelles.map(
                  (parcelle) => (
                    <tr
                      key={parcelle.id}
                      className="hover:bg-slate-50"
                    >

                      <td
                        className="
                          px-6
                          py-4
                          text-sm
                          font-medium
                          text-slate-800
                        "
                      >
                        {parcelle.reference}
                      </td>

                      <td
                        className="
                          px-6
                          py-4
                          text-sm
                          text-slate-600
                        "
                      >
                        {parcelle.numero}
                      </td>

                      <td
                        className="
                          px-6
                          py-4
                          text-sm
                          text-slate-600
                        "
                      >
                        {Number(
                          parcelle.superficie,
                        ).toLocaleString(
                          "fr-FR",
                        )}{" "}
                        m²
                      </td>

                      <td
                        className="
                          px-6
                          py-4
                        "
                      >
                        <span
                          className={`
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-medium
                            ${
                              parcelle.proprietaireId
                                ? "bg-blue-50 text-blue-700"
                                : "bg-green-50 text-green-700"
                            }
                          `}
                        >
                          {parcelle.proprietaireId
                            ? "Attribuée"
                            : "Disponible"}
                        </span>
                      </td>

                    </tr>
                  ),
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}


function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        p-4
      "
    >
      <p
        className="
          text-xs
          text-slate-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-xl
          font-bold
          text-slate-900
        "
      >
        {value}
      </p>
    </div>
  );
}