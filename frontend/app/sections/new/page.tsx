"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Layers,
} from "lucide-react";

import {
  createSection,
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

export default function NewSectionPage() {
  const [terrains, setTerrains] = useState<Terrain[]>(
    [],
  );

  const [reference, setReference] = useState("");
  const [nom, setNom] = useState("");
  const [superficie, setSuperficie] =
    useState("");
  const [terrainId, setTerrainId] =
    useState("");

  const [loadingTerrains, setLoadingTerrains] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    async function loadTerrains() {
      try {
        setLoadingTerrains(true);
        setError("");

        const data = await getTerrains();

        setTerrains(data);
      } catch (error) {
        console.error(
          "Erreur chargement terrains :",
          error,
        );

        setError(
          "Impossible de charger les terrains.",
        );
      } finally {
        setLoadingTerrains(false);
      }
    }

    loadTerrains();
  }, []);

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

    if (!superficie || Number(superficie) <= 0) {
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
      setLoading(true);

      await createSection({
        reference: reference.trim(),
        nom: nom.trim(),
        superficie: Number(superficie),
        terrainId: Number(terrainId),
      });

      setSuccess(
        "La section a été créée avec succès.",
      );

      setReference("");
      setNom("");
      setSuperficie("");
      setTerrainId("");
    } catch (error: any) {
      console.error(
        "Erreur création section :",
        error,
      );

      setError(
        error.message ||
          "Impossible de créer la section. Vérifiez les informations saisies.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* RETOUR */}

      <Link
        href="/sections"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Retour aux sections
      </Link>

      {/* EN-TÊTE */}

      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-slate-900 p-3 text-white">
          <Layers size={26} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Nouvelle section
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Enregistrez une nouvelle section
            dans un terrain.
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

              {!loadingTerrains &&
                terrains.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    Aucun terrain disponible.
                    Créez d'abord un terrain.
                  </p>
                )}
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
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Link
              href="/sections"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={
                loading ||
                loadingTerrains ||
                terrains.length === 0
              }
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Création..."
                : "Créer la section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}