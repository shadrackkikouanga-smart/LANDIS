"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Ruler,
  Square,
  Hash,
  Coins,
} from "lucide-react";

import {
  getSetting,
  updateSetting,
} from "@/services/settings";

interface LotissementSettings {
  superficieParcelle: string;
  largeurRuelle: string;
  largeurAvenue: string;
  uniteSuperficie: string;
  devise: string;
  nombreParcellesParBloc: string;
  statutParcelleParDefaut: string;
  generationReferenceTerrain: boolean;
  generationReferenceBloc: boolean;
  generationReferenceParcelle: boolean;
}

const defaultSettings: LotissementSettings = {
  superficieParcelle: "400",
  largeurRuelle: "7",
  largeurAvenue: "12",
  uniteSuperficie: "m²",
  devise: "FCFA",
  nombreParcellesParBloc: "12",
  statutParcelleParDefaut: "DISPONIBLE",
  generationReferenceTerrain: true,
  generationReferenceBloc: true,
  generationReferenceParcelle: true,
};

export default function LotissementSettingsPage() {
  const [settings, setSettings] =
    useState<LotissementSettings>(
      defaultSettings,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);

      const keys = [
        "lotissement_superficie_parcelle",
        "lotissement_largeur_ruelle",
        "lotissement_largeur_avenue",
        "lotissement_unite_superficie",
        "lotissement_devise",
        "lotissement_nombre_parcelles_bloc",
        "lotissement_statut_parcelle_defaut",
        "lotissement_reference_terrain",
        "lotissement_reference_bloc",
        "lotissement_reference_parcelle",
      ];

      const results = await Promise.all(
        keys.map(async (key) => {
          try {
            return await getSetting(key);
          } catch {
            return null;
          }
        }),
      );

      const values: Record<
        string,
        string
      > = {};

      results.forEach((setting) => {
        if (setting) {
          values[setting.key] =
            setting.value;
        }
      });

      setSettings({
        superficieParcelle:
          values[
            "lotissement_superficie_parcelle"
          ] ??
          defaultSettings.superficieParcelle,

        largeurRuelle:
          values[
            "lotissement_largeur_ruelle"
          ] ??
          defaultSettings.largeurRuelle,

        largeurAvenue:
          values[
            "lotissement_largeur_avenue"
          ] ??
          defaultSettings.largeurAvenue,

        uniteSuperficie:
          values[
            "lotissement_unite_superficie"
          ] ??
          defaultSettings.uniteSuperficie,

        devise:
          values[
            "lotissement_devise"
          ] ??
          defaultSettings.devise,

        nombreParcellesParBloc:
          values[
            "lotissement_nombre_parcelles_bloc"
          ] ??
          defaultSettings.nombreParcellesParBloc,

        statutParcelleParDefaut:
          values[
            "lotissement_statut_parcelle_defaut"
          ] ??
          defaultSettings.statutParcelleParDefaut,

        generationReferenceTerrain:
          values[
            "lotissement_reference_terrain"
          ] !== undefined
            ? values[
                "lotissement_reference_terrain"
              ] === "true"
            : defaultSettings.generationReferenceTerrain,

        generationReferenceBloc:
          values[
            "lotissement_reference_bloc"
          ] !== undefined
            ? values[
                "lotissement_reference_bloc"
              ] === "true"
            : defaultSettings.generationReferenceBloc,

        generationReferenceParcelle:
          values[
            "lotissement_reference_parcelle"
          ] !== undefined
            ? values[
                "lotissement_reference_parcelle"
              ] === "true"
            : defaultSettings.generationReferenceParcelle,
      });
    } catch (error) {
      console.error(
        "Erreur chargement paramètres lotissement :",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof LotissementSettings,
    value:
      | string
      | boolean,
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      await Promise.all([
        updateSetting(
          "lotissement_superficie_parcelle",
          settings.superficieParcelle,
        ),

        updateSetting(
          "lotissement_largeur_ruelle",
          settings.largeurRuelle,
        ),

        updateSetting(
          "lotissement_largeur_avenue",
          settings.largeurAvenue,
        ),

        updateSetting(
          "lotissement_unite_superficie",
          settings.uniteSuperficie,
        ),

        updateSetting(
          "lotissement_devise",
          settings.devise,
        ),

        updateSetting(
          "lotissement_nombre_parcelles_bloc",
          settings.nombreParcellesParBloc,
        ),

        updateSetting(
          "lotissement_statut_parcelle_defaut",
          settings.statutParcelleParDefaut,
        ),

        updateSetting(
          "lotissement_reference_terrain",
          String(
            settings.generationReferenceTerrain,
          ),
        ),

        updateSetting(
          "lotissement_reference_bloc",
          String(
            settings.generationReferenceBloc,
          ),
        ),

        updateSetting(
          "lotissement_reference_parcelle",
          String(
            settings.generationReferenceParcelle,
          ),
        ),
      ]);

      setMessage(
        "Les paramètres du lotissement ont été enregistrés.",
      );
    } catch (error) {
      console.error(
        "Erreur sauvegarde paramètres :",
        error,
      );

      setMessage(
        "Une erreur est survenue lors de l'enregistrement.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Lotissement
          </h1>

          <p className="mt-2 text-slate-500">
            Chargement des paramètres...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* En-tête */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Paramètres du lotissement
        </h1>

        <p className="mt-2 text-slate-500">
          Configurez les règles générales
          utilisées pour la gestion du
          lotissement.
        </p>
      </div>

      {/* Informations générales */}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Square size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Informations générales
              </h2>

              <p className="text-sm text-slate-500">
                Définissez les caractéristiques
                générales du lotissement.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Superficie standard d'une parcelle
            </label>

            <div className="relative">
              <Square
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="number"
                value={
                  settings.superficieParcelle
                }
                onChange={(e) =>
                  updateField(
                    "superficieParcelle",
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Largeur standard des ruelles
            </label>

            <div className="relative">
              <Ruler
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="number"
                value={
                  settings.largeurRuelle
                }
                onChange={(e) =>
                  updateField(
                    "largeurRuelle",
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Largeur standard des avenues
            </label>

            <div className="relative">
              <Ruler
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="number"
                value={
                  settings.largeurAvenue
                }
                onChange={(e) =>
                  updateField(
                    "largeurAvenue",
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />

              <p className="mt-1 text-xs text-slate-500">
                Valeur standard : 12 m
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Unité de superficie
            </label>

            <select
              value={
                settings.uniteSuperficie
              }
              onChange={(e) =>
                updateField(
                  "uniteSuperficie",
                  e.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            >
              <option value="m²">m²</option>
              <option value="ha">
                hectare
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Devise
            </label>

            <div className="relative">
              <Coins
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={settings.devise}
                onChange={(e) =>
                  updateField(
                    "devise",
                    e.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blocs */}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Hash size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Configuration des blocs
              </h2>

              <p className="text-sm text-slate-500">
                Paramètres utilisés lors de la
                création des blocs.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nombre de parcelles par bloc
          </label>

          <input
            type="number"
            min="1"
            value={
              settings.nombreParcellesParBloc
            }
            onChange={(e) =>
              updateField(
                "nombreParcellesParBloc",
                e.target.value,
              )
            }
            className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
          />
        </div>
      </section>

      {/* Parcelles */}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Parcelles
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Valeurs utilisées lors de la création
            des parcelles.
          </p>
        </div>

        <div className="p-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Statut par défaut
          </label>

          <select
            value={
              settings.statutParcelleParDefaut
            }
            onChange={(e) =>
              updateField(
                "statutParcelleParDefaut",
                e.target.value,
              )
            }
            className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
          >
            <option value="DISPONIBLE">
              DISPONIBLE
            </option>

            <option value="RESERVEE">
              RESERVEE
            </option>

            <option value="ATTRIBUEE">
              ATTRIBUEE
            </option>
          </select>
        </div>
      </section>

      {/* Références */}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Références automatiques
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Déterminez si NIANI'S IMO doit générer
            automatiquement les références.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                settings.generationReferenceTerrain
              }
              onChange={(e) =>
                updateField(
                  "generationReferenceTerrain",
                  e.target.checked,
                )
              }
              className="h-4 w-4 rounded border-slate-300"
            />

            <span className="text-sm text-slate-700">
              Générer automatiquement les
              références des terrains
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                settings.generationReferenceBloc
              }
              onChange={(e) =>
                updateField(
                  "generationReferenceBloc",
                  e.target.checked,
                )
              }
              className="h-4 w-4 rounded border-slate-300"
            />

            <span className="text-sm text-slate-700">
              Générer automatiquement les
              références des blocs
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                settings.generationReferenceParcelle
              }
              onChange={(e) =>
                updateField(
                  "generationReferenceParcelle",
                  e.target.checked,
                )
              }
              className="h-4 w-4 rounded border-slate-300"
            />

            <span className="text-sm text-slate-700">
              Générer automatiquement les
              références des parcelles
            </span>
          </label>
        </div>
      </section>

      {/* Message */}

      {message && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      {/* Actions */}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={18} />

          {saving
            ? "Enregistrement..."
            : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}