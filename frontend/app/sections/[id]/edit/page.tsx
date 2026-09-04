"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Layers,
} from "lucide-react";

import {
  getSection,
  updateSection,
  Section,
} from "@/services/sections";

import {
  getTerrains,
} from "@/services/terrains";

interface Terrain {
  id: number;
  reference: string;
  nom: string;
  superficie: number;
}

export default function EditSectionPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [section, setSection] =
    useState<Section | null>(null);

  const [terrains, setTerrains] =
    useState<Terrain[]>([]);

  const [reference, setReference] =
    useState("");

  const [nom, setNom] =
    useState("");

  const [superficie, setSuperficie] =
    useState("");

  const [terrainId, setTerrainId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [loadingTerrains, setLoadingTerrains] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setLoadingTerrains(true);
        setError("");

        if (!Number.isInteger(id) || id <= 0) {
          throw new Error(
            "Identifiant de section invalide.",
          );
        }

        const [sectionData, terrainsData] =
          await Promise.all([
            getSection(id),
            getTerrains(),
          ]);

        setSection(sectionData);
        setTerrains(terrainsData);

        setReference(
          sectionData.reference || "",
        );

        setNom(sectionData.nom || "");

        setSuperficie(
          String(sectionData.superficie ?? ""),
        );

        setTerrainId(
          String(sectionData.terrainId),
        );
      } catch (err: any) {
        console.error(
          "Erreur chargement modification section :",
          err,
        );

        setError(
          err.message ||
            "Impossible de charger les informations de la section.",
        );
      } finally {
        setLoading(false);
        setLoadingTerrains(false);
      }
    }

    loadData();
  }, [id]);

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!reference.trim()) {
      setError(
        "La référence de la section est obligatoire.",
      );
      return;
    }

    if (
      !superficie ||
      Number(superficie) <= 0
    ) {
      setError(
        "La superficie doit être supérieure à 0.",
      );
      return;
    }

    if (!terrainId) {
      setError(
        "Veuillez sélectionner un terrain.",
      );
      return;
    }

    try {
      setSaving(true);

      const updated = await updateSection(
        id,
        {
          reference: reference.trim(),
          nom: nom.trim(),
          superficie: Number(superficie),
          terrainId: Number(terrainId),
        },
      );

      setSection(updated);

      setSuccess(
        "La section a été modifiée avec succès.",
      );

      setTimeout(() => {
        router.push(`/sections/${id}`);
      }, 800);
    } catch (err: any) {
      console.error(
        "Erreur modification section :",
        err,
      );

      setError(
        err.message ||
          "Impossible de modifier la section. Vérifiez les informations saisies.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
        <div className="h-12 w-72 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="space-y-6 p-6">
        <Link
          href="/sections"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Retour aux sections
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error ||
            "Section introuvable."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* RETOUR */}

      <Link
        href={`/sections/${section.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Retour à la section
      </Link>

      {/* EN-TÊTE */}

      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-slate-900 p-3 text-white">
          <Layers size={26} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Modifier la section
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {section.reference}
          </p>
        </div>
      </div>

      {/* FORMULAIRE */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6">
            {/* ERREUR */}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* SUCCÈS */}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* TERRAIN */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Terrain *
              </label>

              <select
                value={terrainId}
                onChange={(event) =>
                  setTerrainId(
                    event.target.value,
                  )
                }
                disabled={loadingTerrains}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingTerrains
                    ? "Chargement des terrains..."
                    : "Sélectionner un terrain"}
                </option>

                {terrains.map((terrain) => (
                  <option
                    key={terrain.id}
                    value={terrain.id}
                  >
                    {terrain.reference} —{" "}
                    {terrain.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* RÉFÉRENCE + NOM */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Référence *
                </label>

                <input
                  type="text"
                  value={reference}
                  onChange={(event) =>
                    setReference(
                      event.target.value,
                    )
                  }
                  placeholder="Ex. SEC-001"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nom de la section
                </label>

                <input
                  type="text"
                  value={nom}
                  onChange={(event) =>
                    setNom(event.target.value)
                  }
                  placeholder="Ex. Section A"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            {/* SUPERFICIE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Superficie de la section (m²) *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={superficie}
                onChange={(event) =>
                  setSuperficie(
                    event.target.value,
                  )
                }
                placeholder="Ex. 5000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />

              <p className="mt-2 text-xs text-slate-400">
                La superficie ne peut pas être
                inférieure à la superficie cumulée
                des blocs déjà présents dans cette
                section.
              </p>
            </div>

            {/* INFORMATIONS */}

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                Informations actuelles
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-400">
                    Blocs
                  </p>

                  <p className="font-semibold text-slate-800">
                    {section.blocs?.length || 0}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Superficie actuelle
                  </p>

                  <p className="font-semibold text-slate-800">
                    {Number(
                      section.superficie || 0,
                    ).toLocaleString("fr-FR")}{" "}
                    m²
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Terrain actuel
                  </p>

                  <p className="font-semibold text-slate-800">
                    {section.terrain?.reference ||
                      `Terrain #${section.terrainId}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Link
              href={`/sections/${section.id}`}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                loadingTerrains ||
                terrains.length === 0
              }
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}