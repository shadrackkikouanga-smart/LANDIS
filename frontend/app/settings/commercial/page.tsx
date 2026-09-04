"use client";

import { useEffect, useState } from "react";
import { Save, CreditCard } from "lucide-react";

import { apiRequest } from "@/services/api";

export default function CommercialSettingsPage() {
  const [settings, setSettings] = useState({
    devise: "FCFA",
    modesPaiement: "Espèces, Mobile Money, Virement bancaire",
    acompteMinimum: "30",
    delaiPaiement: "30",
    prefixeRecu: "REC",
    conditionsPaiement:
      "Le paiement doit être effectué selon les conditions définies dans le contrat.",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const keys = [
          "commercial_devise",
          "commercial_modes_paiement",
          "commercial_acompte_minimum",
          "commercial_delai_paiement",
          "commercial_prefixe_recu",
          "commercial_conditions_paiement",
        ];

        const results = await Promise.all(
          keys.map(async (key) => {
            try {
              return await apiRequest(`/settings/${key}`);
            } catch {
              return null;
            }
          }),
        );

        setSettings({
          devise:
            results[0]?.value ??
            "FCFA",

          modesPaiement:
            results[1]?.value ??
            "Espèces, Mobile Money, Virement bancaire",

          acompteMinimum:
            results[2]?.value ??
            "30",

          delaiPaiement:
            results[3]?.value ??
            "30",

          prefixeRecu:
            results[4]?.value ??
            "REC",

          conditionsPaiement:
            results[5]?.value ??
            "Le paiement doit être effectué selon les conditions définies dans le contrat.",
        });
      } catch (error) {
        console.error(
          "Erreur chargement paramètres commerciaux :",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateField(
    field: keyof typeof settings,
    value: string,
  ) {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveSetting(
    key: string,
    value: string,
  ) {
    await apiRequest(`/settings/${key}`, {
      method: "PATCH",
      body: JSON.stringify({
        value,
      }),
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      await Promise.all([
        saveSetting(
          "commercial_devise",
          settings.devise,
        ),

        saveSetting(
          "commercial_modes_paiement",
          settings.modesPaiement,
        ),

        saveSetting(
          "commercial_acompte_minimum",
          settings.acompteMinimum,
        ),

        saveSetting(
          "commercial_delai_paiement",
          settings.delaiPaiement,
        ),

        saveSetting(
          "commercial_prefixe_recu",
          settings.prefixeRecu,
        ),

        saveSetting(
          "commercial_conditions_paiement",
          settings.conditionsPaiement,
        ),
      ]);

      setMessage(
        "Les paramètres commerciaux ont été enregistrés.",
      );
    } catch (error) {
      console.error(
        "Erreur sauvegarde paramètres commerciaux :",
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
      <div className="p-6 text-slate-500">
        Chargement des paramètres commerciaux...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <CreditCard size={22} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Commercial
            </h1>

            <p className="mt-1 text-slate-500">
              Configurez les paramètres commerciaux et les
              conditions de paiement de NIANI'S IMO.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Paramètres généraux
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Devise
            </label>

            <input
              type="text"
              value={settings.devise}
              onChange={(e) =>
                updateField(
                  "devise",
                  e.target.value,
                )
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-500"
              placeholder="FCFA"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Préfixe des reçus
            </label>

            <input
              type="text"
              value={settings.prefixeRecu}
              onChange={(e) =>
                updateField(
                  "prefixeRecu",
                  e.target.value,
                )
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-500"
              placeholder="REC"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Modes de paiement
            </label>

            <input
              type="text"
              value={settings.modesPaiement}
              onChange={(e) =>
                updateField(
                  "modesPaiement",
                  e.target.value,
                )
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-500"
              placeholder="Espèces, Mobile Money, Virement bancaire"
            />

            <p className="mt-1 text-xs text-slate-500">
              Séparez les différents modes par des virgules.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Conditions de paiement
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Acompte minimum (%)
            </label>

            <input
              type="number"
              min="0"
              max="100"
              value={settings.acompteMinimum}
              onChange={(e) =>
                updateField(
                  "acompteMinimum",
                  e.target.value,
                )
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Délai de paiement (jours)
            </label>

            <input
              type="number"
              min="0"
              value={settings.delaiPaiement}
              onChange={(e) =>
                updateField(
                  "delaiPaiement",
                  e.target.value,
                )
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Conditions de paiement
            </label>

            <textarea
              rows={5}
              value={settings.conditionsPaiement}
              onChange={(e) =>
                updateField(
                  "conditionsPaiement",
                  e.target.value,
                )
              }
              className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {message && (
            <p className="text-sm text-slate-600">
              {message}
            </p>
          )}
        </div>

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