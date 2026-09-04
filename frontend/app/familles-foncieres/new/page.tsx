"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Users, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  createFamilleFonciere,
  FamilleFonciere,
} from "@/services/familles-foncieres.service";

interface Terrain {
  id: number;
  reference: string;
  nom: string;
  superficie: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

export default function NouvelleFamilleFoncierePage() {
  const router = useRouter();

  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loadingTerrains, setLoadingTerrains] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [terrainId, setTerrainId] = useState("");
  const [estPrincipale, setEstPrincipale] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    async function loadTerrains() {
      try {
        setLoadingTerrains(true);
        setError("");

        const response = await fetch(`${API_URL}/terrains`, {
          cache: "no-store",
        });

        if (!response.ok) {
          const message = await response.text();

          throw new Error(
            message || "Impossible de charger les terrains.",
          );
        }

        const data = await response.json();

        setTerrains(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(
          "Erreur chargement terrains :",
          err,
        );

        setError(
          err.message ||
            "Impossible de charger les terrains.",
        );
      } finally {
        setLoadingTerrains(false);
      }
    }

    loadTerrains();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const nomNettoye = nom.trim();

    if (!nomNettoye) {
      setError("Le nom de la famille est obligatoire.");
      return;
    }

    if (!terrainId) {
      setError("Veuillez sélectionner un terrain.");
      return;
    }

    try {
      setSaving(true);

      const famille: FamilleFonciere =
        await createFamilleFonciere({
          nom: nomNettoye,
          description: description.trim() || undefined,
          terrainId: Number(terrainId),
          estPrincipale,
          active,
        });

      router.push(
        `/familles-foncieres/${famille.id}`,
      );
    } catch (err: any) {
      console.error(
        "Erreur création famille foncière :",
        err,
      );

      setError(
        err.message ||
          "Impossible de créer la famille foncière.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 p-6">
      {/* RETOUR */}

      <Link
        href="/familles-foncieres"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Retour aux familles foncières
      </Link>

      {/* EN-TÊTE */}

      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-slate-900 p-3 text-white">
          <Users size={24} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Nouvelle famille foncière
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Enregistrer une famille foncière rattachée à un
            terrain.
          </p>
        </div>
      </div>

      {/* ERREUR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORMULAIRE */}

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-6"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Informations générales
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Définissez l'identité et le rattachement
              territorial de la famille.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* TERRAIN */}

            <div className="md:col-span-2">
              <label
                htmlFor="terrain"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Terrain <span className="text-red-500">*</span>
              </label>

              <select
                id="terrain"
                value={terrainId}
                onChange={(event) =>
                  setTerrainId(event.target.value)
                }
                disabled={loadingTerrains || saving}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                    {terrain.reference} — {terrain.nom}
                  </option>
                ))}
              </select>

              {!loadingTerrains &&
                terrains.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    Aucun terrain disponible.
                  </p>
                )}
            </div>

            {/* NOM */}

            <div className="md:col-span-2">
              <label
                htmlFor="nom"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Nom de la famille{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="nom"
                type="text"
                value={nom}
                onChange={(event) =>
                  setNom(event.target.value)
                }
                disabled={saving}
                placeholder="Ex. Famille KIKOUANGA"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-500 disabled:bg-slate-100"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                disabled={saving}
                rows={4}
                placeholder="Description ou informations complémentaires concernant la famille..."
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-500 disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        {/* STATUTS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Statut et rôle
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Définissez le statut administratif de la
              famille.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={estPrincipale}
                onChange={(event) =>
                  setEstPrincipale(event.target.checked)
                }
                disabled={saving}
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Famille principale
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Indique que cette famille est la famille
                  foncière principale du terrain.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) =>
                  setActive(event.target.checked)
                }
                disabled={saving}
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Famille active
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Une famille inactive reste enregistrée
                  dans l'historique mais n'est plus active
                  dans LANDIS.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/familles-foncieres"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={17} />
                Créer la famille
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}