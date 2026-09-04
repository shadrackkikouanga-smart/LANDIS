"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  RefreshCw,
  Layers,
  LandPlot,
  Map,
  Grid3X3,
  Percent,
} from "lucide-react";

import { getSection, Section } from "@/services/sections";

function formatNumber(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return numericValue.toLocaleString("fr-FR");
}

function formatPercent(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "0 %";
  }

  return `${numericValue.toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  })} %`;
}

export default function SectionDetailPage() {
  const params = useParams();

  const id = Number(params.id);

  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSection() {
    try {
      setLoading(true);
      setError("");

      if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Identifiant de section invalide.");
      }

      const data = await getSection(id);

      setSection(data);
    } catch (err: any) {
      console.error(
        "Erreur chargement section :",
        err,
      );

      setError(
        err.message ||
          "Impossible de charger la section.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSection();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
        <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (error || !section) {
    return (
      <div className="space-y-6 p-6">
        <Link
          href="/sections"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Retour aux sections
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || "Section introuvable."}
        </div>

        <button
          type="button"
          onClick={loadSection}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <RefreshCw size={17} />
          Réessayer
        </button>
      </div>
    );
  }

  const blocs = section.blocs || [];
  const statistiques = section.statistiques;

  const superficieSection = Number(
    statistiques?.superficieSection ??
      section.superficie ??
      0,
  );

  const superficieBlocs = Number(
    statistiques?.superficieBlocs ??
      blocs.reduce(
        (total, bloc) =>
          total + Number(bloc.superficie || 0),
        0,
      ),
  );

  const superficieRestante = Number(
    statistiques?.superficieRestante ??
      Math.max(
        superficieSection - superficieBlocs,
        0,
      ),
  );

  const nombreParcelles =
    statistiques?.nombreParcelles ??
    blocs.reduce(
      (total, bloc) =>
        total + (bloc.parcelles?.length || 0),
      0,
    );

  const tauxOccupation = Number(
    statistiques?.tauxOccupation ??
      (superficieSection > 0
        ? (superficieBlocs / superficieSection) *
          100
        : 0),
  );

  return (
    <div className="space-y-8 p-6">
      {/* RETOUR */}

      <Link
        href="/sections"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Retour aux sections
      </Link>

      {/* EN-TÊTE */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-slate-900 p-3 text-white">
            <Layers size={26} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">
                {section.reference}
              </h1>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Section
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {section.nom || "Sans nom"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadSection}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Actualiser
          </button>

          <Link
            href={`/sections/${section.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Pencil size={17} />
            Modifier
          </Link>
        </div>
      </div>

      {/* ERREUR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* INFORMATIONS GÉNÉRALES */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Map size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Terrain
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {section.terrain?.reference ||
                  `Terrain #${section.terrainId}`}
              </p>

              {section.terrain?.nom && (
                <p className="text-sm text-slate-500">
                  {section.terrain.nom}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <LandPlot size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Superficie de la section
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {formatNumber(superficieSection)} m²
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTIQUES */}

      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Statistiques de la section
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Blocs
              </p>

              <Layers size={18} className="text-slate-400" />
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {statistiques?.nombreBlocs ??
                blocs.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Parcelles
              </p>

              <Grid3X3
                size={18}
                className="text-slate-400"
              />
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {nombreParcelles}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Surface des blocs
              </p>

              <LandPlot
                size={18}
                className="text-slate-400"
              />
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatNumber(superficieBlocs)} m²
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Taux d'occupation
              </p>

              <Percent
                size={18}
                className="text-slate-400"
              />
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatPercent(tauxOccupation)}
            </p>
          </div>
        </div>
      </div>

      {/* SURFACE */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Répartition de la superficie
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Occupation de la section par les blocs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Superficie section
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatNumber(superficieSection)} m²
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Surface occupée par les blocs
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatNumber(superficieBlocs)} m²
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Surface restante
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatNumber(superficieRestante)} m²
            </p>
          </div>
        </div>
      </div>

      {/* BLOCS */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Blocs de la section
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {blocs.length} bloc
              {blocs.length > 1 ? "s" : ""} associé
              {blocs.length > 1 ? "s" : ""}.
            </p>
          </div>
        </div>

        {blocs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {blocs.map((bloc) => {
              const parcelles =
                bloc.parcelles || [];

              return (
                <div
                  key={bloc.id}
                  className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                      <Layers size={20} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {bloc.reference}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {formatNumber(
                          bloc.superficie,
                        )}{" "}
                        m²
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        Parcelles
                      </p>

                      <p className="font-semibold text-slate-800">
                        {parcelles.length}
                      </p>
                    </div>

                    <Link
                      href={`/blocs/${bloc.id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Voir le bloc
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            Aucun bloc n'est encore associé à cette
            section.
          </div>
        )}
      </div>
    </div>
  );
}