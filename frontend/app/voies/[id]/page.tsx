"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Route,
  LandPlot,
  Ruler,
  Square,
  Blocks,
  MapPin,
  Layers,
} from "lucide-react";

import {
  getVoie,
  deleteVoie,
  Voie,
} from "@/services/voies";

export default function VoieDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [voie, setVoie] = useState<Voie | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const id = Number(params.id);

  async function loadVoie() {
    try {
      setLoading(true);
      setError("");

      if (!id || Number.isNaN(id)) {
        setError("Identifiant de voie invalide.");
        return;
      }

      const data = await getVoie(id);

      setVoie(data);
    } catch (err: any) {
      console.error(
        "Erreur chargement voie :",
        err,
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Impossible de charger cette voie.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVoie();
  }, [id]);

  async function handleDelete() {
    if (!voie) {
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la voie "${voie.reference}" ?\n\nCette action supprimera également toutes ses associations avec les blocs.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteVoie(voie.id);

      router.push("/voies");
    } catch (err: any) {
      console.error(
        "Erreur suppression voie :",
        err,
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Erreur lors de la suppression de la voie.",
      );

      setDeleting(false);
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

  function formatNumber(
    value: number | string | null | undefined,
  ) {
    return Number(value || 0).toLocaleString("fr-FR");
  }

  function getPositionDescription(position: string) {
    switch (position) {
      case "HAUT":
        return "Côté haut du bloc";

      case "BAS":
        return "Côté bas du bloc";

      case "GAUCHE":
        return "Côté gauche du bloc";

      case "DROITE":
        return "Côté droit du bloc";

      case "AUTRE":
        return "Autre position";

      default:
        return "";
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-100" />

        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />

        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (error && !voie) {
    return (
      <div className="space-y-6 p-6">
        <Link
          href="/voies"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />

          Retour aux voies
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!voie) {
    return (
      <div className="space-y-6 p-6">
        <Link
          href="/voies"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />

          Retour aux voies
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Voie introuvable.
        </div>
      </div>
    );
  }

  const blocs = voie.blocs || [];
  const estPartagee = blocs.length > 1;

  return (
    <div className="space-y-8 p-6">
      {/* RETOUR */}

      <Link
        href="/voies"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />

        Retour aux voies
      </Link>

      {/* ERREUR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* EN-TÊTE */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <Route size={30} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">
                {voie.reference}
              </h1>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {formatType(voie.type)}
              </span>

              {estPartagee && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Voie partagée
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Détails et associations de la voie
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/voies/${voie.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={17} />

            Modifier
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={17} />

            {deleting
              ? "Suppression..."
              : "Supprimer"}
          </button>
        </div>
      </div>

      {/* INFORMATIONS PRINCIPALES */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* CARACTÉRISTIQUES */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Ruler size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Caractéristiques
              </h2>

              <p className="text-xs text-slate-500">
                Dimensions de la voie
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            {/* LARGEUR */}

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Largeur
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatNumber(voie.largeur)} m
              </p>
            </div>

            {/* LONGUEUR */}

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Longueur
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatNumber(voie.longueur)} m
              </p>
            </div>

            {/* SUPERFICIE */}

            <div className="col-span-2 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <Square
                  size={16}
                  className="text-slate-500"
                />

                <p className="text-xs text-slate-500">
                  Superficie occupée
                </p>
              </div>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatNumber(voie.superficie)} m²
              </p>
            </div>
          </div>
        </div>

        {/* TERRAIN */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <LandPlot size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Terrain
              </h2>

              <p className="text-xs text-slate-500">
                Terrain auquel appartient la voie
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs text-slate-500">
                Référence du terrain
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {voie.terrain?.reference ||
                  `Terrain #${voie.terrainId}`}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={16} />

              <span>
                Identifiant terrain :{" "}
                <strong className="text-slate-700">
                  {voie.terrainId}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCS BORDÉS */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Blocks size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Blocs bordés
              </h2>

              <p className="text-xs text-slate-500">
                Blocs utilisant cette voie comme limite
              </p>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
            {blocs.length} bloc
            {blocs.length > 1 ? "s" : ""}
          </span>
        </div>

        {blocs.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {blocs.map((association) => (
              <div
                key={association.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Bloc
                    </p>

                    <p className="mt-1 truncate text-lg font-bold text-slate-900">
                      {association.bloc?.reference ||
                        `Bloc #${association.blocId}`}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {formatPosition(
                      association.position,
                    )}
                  </span>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                  {association.bloc?.section && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Layers size={15} />

                      <span>
                        Section :{" "}
                        <strong className="text-slate-800">
                          {
                            association.bloc.section
                              .reference
                          }
                        </strong>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={15} />

                    <span>
                      {getPositionDescription(
                        association.position,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <Blocks
              size={32}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="font-medium text-slate-500">
              Aucun bloc associé à cette voie.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Cette voie existe sur le terrain mais
              n'est actuellement associée à aucun bloc.
            </p>
          </div>
        )}
      </div>

      {/* EXPLICATION VOIE PARTAGÉE */}

      {estPartagee && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white p-2 text-blue-600">
              <Route size={20} />
            </div>

            <div>
              <h3 className="font-semibold text-blue-900">
                Voie physique partagée
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-blue-700">
                Cette voie physique est utilisée comme
                limite par{" "}
                <strong>{blocs.length} blocs</strong>.
                Elle reste enregistrée comme une seule
                voie sur le terrain. Chaque bloc possède
                sa propre association et sa propre
                position.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}