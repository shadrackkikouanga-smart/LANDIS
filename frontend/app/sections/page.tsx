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
  Layers,
  LandPlot,
  Layers3,
} from "lucide-react";

import {
  getSections,
  deleteSection,
  Section,
} from "@/services/sections";

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSections() {
    try {
      setLoading(true);
      setError("");

      const data = await getSections();

      setSections(data);
    } catch (err: any) {
      console.error("Erreur chargement sections :", err);

      setError(
        err.message || "Impossible de charger les sections.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSections();
  }, []);

  async function handleDelete(
    id: number,
    reference: string,
  ) {
    if (
      !window.confirm(
        `Voulez-vous vraiment supprimer la section "${reference}" ?`,
      )
    ) {
      return;
    }

    try {
      setError("");

      await deleteSection(id);

      await loadSections();
    } catch (err: any) {
      console.error(
        "Erreur suppression section :",
        err,
      );

      setError(
        err.message ||
          "Erreur lors de la suppression de la section.",
      );
    }
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

  const superficieTotale = sections.reduce(
    (total, section) =>
      total + Number(section.superficie || 0),
    0,
  );

  const nombreBlocs = sections.reduce(
    (total, section) =>
      total + (section.blocs?.length || 0),
    0,
  );

  return (
    <div className="space-y-8 p-6">
      {/* RETOUR */}

      <Link
        href="/terrains"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Retour aux terrains
      </Link>

      {/* EN-TÊTE */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-900 p-3 text-white">
            <Layers size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Sections
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Gestion des sections des terrains
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadSections}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Actualiser
          </button>

          <Link
            href="/sections/new"
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Nouvelle section
          </Link>
        </div>
      </div>

      {/* ERREUR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STATISTIQUES */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Nombre de sections
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {sections.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Superficie cumulée
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {superficieTotale.toLocaleString("fr-FR")} m²
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Blocs totaux
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {nombreBlocs}
          </p>
        </div>
      </div>

      {/* LISTE */}

      {sections.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const blocs = section.blocs || [];

            return (
              <div
                key={section.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* IDENTITÉ */}

                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Référence
                    </span>

                    <h3 className="mt-0.5 text-xl font-bold text-slate-900">
                      {section.reference}
                    </h3>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {section.nom || "Sans nom"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Layers size={20} />
                  </div>
                </div>

                {/* INFORMATIONS */}

                <div className="mt-6 space-y-3.5 border-b border-t border-slate-100 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <LandPlot size={16} />
                      <span>Superficie</span>
                    </div>

                    <span className="font-semibold text-slate-800">
                      {Number(
                        section.superficie || 0,
                      ).toLocaleString("fr-FR")}{" "}
                      m²
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <LandPlot size={16} />
                      <span>Terrain</span>
                    </div>

                    <span className="max-w-[180px] truncate font-semibold text-slate-800">
                      {section.terrain?.reference ||
                        `Terrain #${section.terrainId}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Layers3 size={16} />
                      <span>Blocs</span>
                    </div>

                    <span className="font-semibold text-slate-800">
                      {blocs.length}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="mt-5 flex items-center justify-end gap-2">
                  <Link
                    href={`/sections/${section.id}`}
                    title="Voir"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Eye size={16} />
                  </Link>

                  <Link
                    href={`/sections/${section.id}/edit`}
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
                        section.id,
                        section.reference,
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
          <Layers
            size={36}
            className="mx-auto mb-3 text-slate-300"
          />

          <p className="font-medium">
            Aucune section disponible pour le moment.
          </p>

          <p className="mt-1 text-sm">
            Créez votre première section.
          </p>
        </div>
      )}
    </div>
  );
}