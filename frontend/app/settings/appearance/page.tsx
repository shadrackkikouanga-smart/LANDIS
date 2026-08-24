"use client";

import { useEffect, useState } from "react";
import {
  Palette,
  Sun,
  Moon,
  Save,
  Building2,
} from "lucide-react";

type Theme = "light" | "dark";

type Settings = {
  theme: Theme;
  primaryColor: string;
  organizationName: string;
};

const defaultSettings: Settings = {
  theme: "light",
  primaryColor: "slate",
  organizationName: "LANDIS",
};

async function settingsRequest(
  endpoint: string,
  options?: RequestInit,
) {
  const response = await fetch(
    `/api/settings${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    },
  );

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Une erreur est survenue.",
    );
  }

  return data;
}

export default function AppearancePage() {
  const [settings, setSettings] =
    useState<Settings>(
      defaultSettings,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const data =
        await settingsRequest("");

      if (Array.isArray(data)) {
        const result = {
          ...defaultSettings,
        };

        for (const item of data) {
          if (item.key === "theme") {
            result.theme =
              item.value as Theme;
          }

          if (
            item.key === "primaryColor"
          ) {
            result.primaryColor =
              item.value;
          }

          if (
            item.key ===
            "organizationName"
          ) {
            result.organizationName =
              item.value;
          }
        }

        setSettings(result);
      }
    } catch (error) {
      console.error(
        "Erreur chargement paramètres :",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les paramètres.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveSetting(
    key: string,
    value: string,
  ) {
    await settingsRequest(
      `/${key}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          value,
        }),
      },
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      await saveSetting(
        "theme",
        settings.theme,
      );

      await saveSetting(
        "primaryColor",
        settings.primaryColor,
      );

      await saveSetting(
        "organizationName",
        settings.organizationName,
      );

      setMessage(
        "Les paramètres ont été enregistrés.",
      );
    } catch (error) {
      console.error(
        "Erreur sauvegarde paramètres :",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer les paramètres.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-400">
          Chargement des paramètres...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Palette size={21} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Apparence
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Personnalisez l'apparence de
              votre plateforme LANDIS.
            </p>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          {message}
        </div>
      )}

      {/* THEME */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Thème
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choisissez le mode d'affichage
            de LANDIS.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              setSettings((current) => ({
                ...current,
                theme: "light",
              }))
            }
            className={`
              flex
              items-center
              gap-4
              rounded-xl
              border
              p-5
              text-left
              transition
              ${
                settings.theme === "light"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:bg-slate-50"
              }
            `}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
              <Sun size={20} />
            </div>

            <div>
              <p className="font-medium text-slate-900">
                Clair
              </p>

              <p className="text-sm text-slate-500">
                Interface claire
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setSettings((current) => ({
                ...current,
                theme: "dark",
              }))
            }
            className={`
              flex
              items-center
              gap-4
              rounded-xl
              border
              p-5
              text-left
              transition
              ${
                settings.theme === "dark"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:bg-slate-50"
              }
            `}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Moon size={20} />
            </div>

            <div>
              <p className="font-medium text-slate-900">
                Sombre
              </p>

              <p className="text-sm text-slate-500">
                Interface sombre
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* COULEUR */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Couleur principale
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choisissez la couleur principale
            de l'interface.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            "slate",
            "blue",
            "green",
            "purple",
            "orange",
            "red",
          ].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() =>
                setSettings((current) => ({
                  ...current,
                  primaryColor: color,
                }))
              }
              className={`
                rounded-lg
                border
                px-4
                py-2
                text-sm
                font-medium
                capitalize
                ${
                  settings.primaryColor ===
                  color
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              {color}
            </button>
          ))}
        </div>
      </section>

      {/* ORGANISATION */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <Building2 size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Organisation
            </h2>

            <p className="text-sm text-slate-500">
              Nom affiché dans la plateforme.
            </p>
          </div>
        </div>

        <input
          type="text"
          value={
            settings.organizationName
          }
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              organizationName:
                event.target.value,
            }))
          }
          className="
            w-full
            max-w-xl
            rounded-lg
            border
            border-slate-300
            px-4
            py-3
            outline-none
            focus:border-slate-900
            focus:ring-1
            focus:ring-slate-900
          "
          placeholder="Nom de l'organisation"
        />
      </section>

      {/* SAUVEGARDER */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-slate-900
            px-5
            py-3
            text-sm
            font-medium
            text-white
            transition
            hover:bg-slate-800
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <Save size={18} />

          {saving
            ? "Enregistrement..."
            : "Enregistrer les paramètres"}
        </button>
      </div>
    </div>
  );
}