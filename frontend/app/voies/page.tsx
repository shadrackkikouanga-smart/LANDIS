"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Route,
  LandPlot,
  Ruler,
  Square,
  Blocks,
} from "lucide-react";

import {
  getVoies,
  deleteVoie,
  Voie,
} from "@/services/voies";

export default function VoiesPage() {
  const [voies, setVoies] = useState<Voie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadVoies() {
    try {
      setLoading(true);
      setError("");

      const data = await getVoies();

      setVoies(data);
    } catch (err: any) {
      console.error("Erreur chargement voies :", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Impossible de charger les voies.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVoies();
  }, []);

  async function handleDelete(
    id: number,
    reference: string,
  ) {
    if (
      !window.confirm(
        `Voulez-vous vraiment supprimer la voie "${reference}" ?\n\nCette suppression retirera également ses associations avec les blocs bordés.`,
      )
    ) {
      return;
    }

    try {
      setError("");

      await deleteVoie(id);

      await loadVoies();
    } catch (err: any) {
      console.error("Erreur suppression voie :", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Erreur lors de la suppression de la voie.",
      );
    }
  }

  function formatType(type: string) {
    switch (type) {
      case "AVENUE":
        return "Avenue";

      case "RUE":
        return "Rue";

      case "RUELLE":
        return "Ruelle";

      case "AUTRE":
        return "Autre";

      default:
        return type;
    }
  }

  function formatPosition(position: string) {
    switch (position) {
      case "HAUT":
        return "Haut";

      case "BAS":
        return "Bas";

      case "GAUCHE":
        return "Gauche";

      case "DROITE":
        return "Droite";

      case "AUTRE":
        return "Autre";

      default:
        return position;
    }
  }

  function formatNumber(value: number | string | null | undefined) {
    return Number(value || 0).toLocaleString("fr-FR");
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-100" />

        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />

        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  const superficieTotale = voies.reduce(
    (total, voie) =>
      total + Number(voie.superficie || 0),
    0,
  );

  const longueurTotale = voies.reduce(
    (total, voie) =>
      total + Number(voie.longueur || 0),
    0,
  );

  const nombreAssociations = voies.reduce(
    (total, voie) =>
      total + (voie.blocs?.length || 0),
    0,
  );

  const voiesPartagees = voies.filter(
    (voie) => (voie.blocs?.length || 0) > 1,
  ).length;

  const types = {
    AVENUE: voies.filter(
      (voie) => voie.type === "AVENUE",
    ).length,

    RUE: voies.filter(
      (voie) => voie.type === "RUE",
    ).length,

    RUELLE: voies.filter(
      (voie) => voie.type === "RUELLE",
    ).length,

    AUTRE: voies.filter(
      (voie) => voie.type === "AUTRE",
    ).length,
  };

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
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-900 p-3 text-white">
            <Route size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Voies
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Gestion des avenues, rues et ruelles
              des lotissements
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadVoies}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={17} />

            Actualiser
          </button>

          <Link
            href="/voies/new"
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={18} />

            Nouvelle voie
          </Link>
        </div>
      </div>

      {/* ERREUR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STATISTIQUES PRINCIPALES */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* NOMBRE DE VOIES */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Nombre de voies
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {voies.length}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Route size={20} />
            </div>
          </div>
        </div>

        {/* LONGUEUR */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Longueur totale
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatNumber(longueurTotale)} m
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Ruler size={20} />
            </div>
          </div>
        </div>

        {/* SUPERFICIE */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Superficie occupée
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatNumber(superficieTotale)} m²
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Square size={20} />
            </div>
          </div>
        </div>

        {/* ASSOCIATIONS */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Blocs bordés
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {nombreAssociations}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {voiesPartagees} voie
                {voiesPartagees > 1 ? "s" : ""} partagée
                {voiesPartagees > 1 ? "s" : ""}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Blocks size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* RÉPARTITION */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">
            Avenues
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {types.AVENUE}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">
            Rues
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {types.RUE}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">
            Ruelles
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {types.RUELLE}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">
            Autres
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {types.AUTRE}
          </p>
        </div>
      </div>

      {/* LISTE */}

      {voies.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {voies.map((voie) => {
            const blocs = voie.blocs || [];
            const estPartagee = blocs.length > 1;

            return (
              <div
                key={voie.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* IDENTITÉ */}

                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Référence
                    </span>

                    <h3 className="mt-0.5 truncate text-xl font-bold text-slate-900">
                      {voie.reference}
                    </h3>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {formatType(voie.type)}
                    </p>
                  </div>

                  <div className="ml-3 rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Route size={20} />
                  </div>
                </div>

                {/* INFORMATIONS PHYSIQUES */}

                <div className="mt-6 space-y-3.5 border-b border-t border-slate-100 py-4">
                  {/* DIMENSIONS */}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Ruler size={16} />

                      <span>Dimensions</span>
                    </div>

                    <span className="font-semibold text-slate-800">
                      {formatNumber(voie.largeur)} ×{" "}
                      {formatNumber(voie.longueur)} m
                    </span>
                  </div>

                  {/* SUPERFICIE */}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Square size={16} />

                      <span>Superficie</span>
                    </div>

                    <span className="font-semibold text-slate-800">
                      {formatNumber(voie.superficie)} m²
                    </span>
                  </div>

                  {/* TERRAIN */}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <LandPlot size={16} />

                      <span>Terrain</span>
                    </div>

                    <span className="max-w-[180px] truncate font-semibold text-slate-800">
                      {voie.terrain?.reference ||
                        `Terrain #${voie.terrainId}`}
                    </span>
                  </div>
                </div>

                {/* BLOCS BORDÉS */}

                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Blocks
                        size={16}
                        className="text-slate-500"
                      />

                      <span className="text-sm font-semibold text-slate-700">
                        Blocs bordés
                      </span>
                    </div>

                    {estPartagee && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                        Voie partagée
                      </span>
                    )}
                  </div>

                  {blocs.length > 0 ? (
                    <div className="space-y-2">
                      {blocs.map((association) => (
                        <div
                          key={association.id}
                          className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {association.bloc?.reference ||
                                `Bloc #${association.blocId}`}
                            </p>

                            {association.bloc?.section && (
                              <p className="mt-0.5 text-[11px] text-slate-500">
                                Section{" "}
                                {
                                  association.bloc
                                    .section.reference
                                }
                              </p>
                            )}
                          </div>

                          <span className="ml-3 shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                            {formatPosition(
                              association.position,
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-center">
                      <p className="text-xs text-slate-400">
                        Aucun bloc associé
                      </p>
                    </div>
                  )}
                </div>

                {/* INFORMATIONS PARTAGE */}

                {estPartagee && (
                  <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
                    <p className="text-xs leading-relaxed text-blue-700">
                      Cette voie physique borde{" "}
                      <strong>{blocs.length} blocs</strong>.
                      Elle n'est comptabilisée qu'une seule
                      fois dans les statistiques du terrain.
                    </p>
                  </div>
                )}

                {/* ACTIONS */}

                <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  <Link
                    href={`/voies/${voie.id}`}
                    title="Voir"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Eye size={16} />
                  </Link>

                  <Link
                    href={`/voies/${voie.id}/edit`}
                    title="Modifier"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil size={16} />
                  </Link>

                  <button
                    type="button"
                    title="Supprimer"
                    onClick={() =>
                      handleDelete(
                        voie.id,
                        voie.reference,
                      )
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
          <Route
            size={36}
            className="mx-auto mb-3 text-slate-300"
          />

          <p className="font-medium">
            Aucune voie disponible pour le moment.
          </p>

          <p className="mt-1 text-sm">
            Créez votre première voie.
          </p>

          <Link
            href="/voies/new"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={17} />

            Nouvelle voie
          </Link>
        </div>
      )}
    </div>
  );
}