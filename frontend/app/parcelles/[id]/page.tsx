"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LandPlot,
  Pencil,
  Trash2,
  UserRound,
  Ruler,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  getParcelle,
  deleteParcelle,
  Parcelle,
} from "@/services/parcelles";

export default function ParcelleDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [parcelle, setParcelle] =
    useState<Parcelle | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getParcelle(id);

        setParcelle(data);
      } catch (error) {
        console.error(
          "Erreur chargement parcelle :",
          error,
        );

        setError(
          "Impossible de charger la parcelle.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  async function handleDelete() {
    if (!parcelle) {
      return;
    }

    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer "${parcelle.reference}" ?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteParcelle(
        parcelle.id,
      );

      router.push("/parcelles");
    } catch (error) {
      console.error(
        "Erreur suppression :",
        error,
      );

      setError(
        "Impossible de supprimer cette parcelle. Une parcelle attribuée ne peut pas être supprimée.",
      );
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="h-80 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (error && !parcelle) {
    return (
      <div className="space-y-6">
        <Link
          href="/parcelles"
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

          Retour aux parcelles
        </Link>

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
      </div>
    );
  }

  if (!parcelle) {
    return null;
  }

  return (
    <div className="space-y-8">
      <Link
        href="/parcelles"
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

        Retour aux parcelles
      </Link>

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
            <LandPlot size={26} />
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
                {parcelle.reference}
              </h1>

              <span
                className="
                  rounded-full
                  bg-green-50
                  px-3
                  py-1
                  text-xs
                  font-medium
                  text-green-700
                "
              >
                {parcelle.statut}
              </span>
            </div>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Parcelle n° {parcelle.numero}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/parcelles/${parcelle.id}/edit`}
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
            "
          >
            <Trash2 size={17} />

            Supprimer
          </button>
        </div>
      </div>

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
          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Superficie
          </h2>

          <div className="mt-5 flex items-center gap-3">
            <Ruler
              size={22}
              className="text-slate-400"
            />

            <p
              className="
                text-2xl
                font-bold
                text-slate-900
              "
            >
              {parcelle.superficie.toLocaleString(
                "fr-FR",
              )}{" "}
              m²
            </p>
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
          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Bloc
          </h2>

          <p
            className="
              mt-5
              text-xl
              font-bold
              text-slate-900
            "
          >
            {parcelle.bloc?.reference ||
              `Bloc #${parcelle.blocId}`}
          </p>
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
          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Propriétaire
          </h2>

          {parcelle.proprietaire ? (
            <div className="mt-5">
              <div className="flex items-center gap-3">
                <UserRound
                  size={22}
                  className="text-slate-400"
                />

                <p
                  className="
                    font-semibold
                    text-slate-900
                  "
                >
                  {
                    parcelle.proprietaire
                      .nom
                  }{" "}
                  {
                    parcelle.proprietaire
                      .prenom
                  }
                </p>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {
                  parcelle.proprietaire
                    .telephone
                }
              </p>

              {parcelle
                .proprietaire
                .email && (
                <p className="mt-1 text-sm text-slate-500">
                  {
                    parcelle
                      .proprietaire
                      .email
                  }
                </p>
              )}
            </div>
          ) : (
            <p
              className="
                mt-5
                text-sm
                text-slate-500
              "
            >
              Cette parcelle n'a pas encore
              été attribuée.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}