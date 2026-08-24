"use client";

import { useEffect, useState } from "react";

import {
  FileText,
  Save,
  Check,
} from "lucide-react";

import { apiRequest } from "@/services/api";

interface DocumentSettings {
  documentsOrganizationName: string;
  documentsAddress: string;
  documentsTelephone: string;
  documentsEmail: string;
  documentsFooter: string;
  documentsContractPrefix: string;
  documentsReceiptPrefix: string;
  documentsShowLogo: string;
  documentsShowSignatures: string;
  documentsLegalNotice: string;
  documentsDateFormat: string;
}

const defaultSettings: DocumentSettings = {
  documentsOrganizationName: "",
  documentsAddress: "",
  documentsTelephone: "",
  documentsEmail: "",
  documentsFooter: "",
  documentsContractPrefix: "CONTRAT",
  documentsReceiptPrefix: "RECU",
  documentsShowLogo: "true",
  documentsShowSignatures: "true",
  documentsLegalNotice: "",
  documentsDateFormat: "DD/MM/YYYY",
};

export default function DocumentsSettingsPage() {
  const [settings, setSettings] =
    useState<DocumentSettings>(
      defaultSettings,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);

      const data =
        await apiRequest("/settings");

      const values: DocumentSettings = {
        ...defaultSettings,
      };

      for (const setting of data) {
        if (
          setting.key in values
        ) {
          values[
            setting.key as keyof DocumentSettings
          ] = setting.value;
        }
      }

      setSettings(values);
    } catch (error) {
      console.error(
        "Erreur chargement paramètres documents :",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    key: keyof DocumentSettings,
    value: string,
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  }

  async function saveSetting(
    key: keyof DocumentSettings,
  ) {
    await apiRequest(
      `/settings/${key}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          value: settings[key],
        }),
      },
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      setSaved(false);

      await Promise.all(
        Object.keys(settings).map(
          (key) =>
            saveSetting(
              key as keyof DocumentSettings,
            ),
        ),
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Erreur sauvegarde paramètres documents :",
        error,
      );

      alert(
        "Impossible d'enregistrer les paramètres.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-slate-500">
        Chargement des paramètres...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* EN-TÊTE */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-lg
                bg-slate-100
                text-slate-700
              "
            >
              <FileText size={21} />
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Documents
            </h1>

          </div>

          <p className="mt-2 text-slate-500">
            Configurez les paramètres
            utilisés pour les documents
            et contrats de LANDIS.
          </p>

        </div>


        <button
          onClick={handleSave}
          disabled={saving}
          className="
            flex
            w-fit
            items-center
            gap-2
            rounded-lg
            bg-slate-900
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            transition
            hover:bg-slate-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >

          {saved ? (
            <Check size={18} />
          ) : (
            <Save size={18} />
          )}

          {saving
            ? "Enregistrement..."
            : saved
              ? "Enregistré"
              : "Enregistrer"}

        </button>

      </div>


      {/* INFORMATIONS AFFICHÉES */}

      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Informations des documents
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Informations qui pourront être
            affichées sur les documents LANDIS.
          </p>

        </div>


        <div className="grid gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nom de l'organisation
            </label>

            <input
              value={
                settings.documentsOrganizationName
              }
              onChange={(event) =>
                updateField(
                  "documentsOrganizationName",
                  event.target.value,
                )
              }
              placeholder="Nom de l'organisation"
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-2.5
                outline-none
                focus:border-slate-900
              "
            />

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Téléphone
            </label>

            <input
              value={
                settings.documentsTelephone
              }
              onChange={(event) =>
                updateField(
                  "documentsTelephone",
                  event.target.value,
                )
              }
              placeholder="+242 ..."
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-2.5
                outline-none
                focus:border-slate-900
              "
            />

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Adresse
            </label>

            <input
              value={
                settings.documentsAddress
              }
              onChange={(event) =>
                updateField(
                  "documentsAddress",
                  event.target.value,
                )
              }
              placeholder="Adresse"
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-2.5
                outline-none
                focus:border-slate-900
              "
            />

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={
                settings.documentsEmail
              }
              onChange={(event) =>
                updateField(
                  "documentsEmail",
                  event.target.value,
                )
              }
              placeholder="contact@example.com"
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-2.5
                outline-none
                focus:border-slate-900
              "
            />

          </div>

        </div>

      </section>


      {/* NUMÉROTATION */}

      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Numérotation
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Définissez les préfixes utilisés
            pour identifier les documents.
          </p>

        </div>


        <div className="grid gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Préfixe des contrats
            </label>

            <input
              value={
                settings.documentsContractPrefix
              }
              onChange={(event) =>
                updateField(
                  "documentsContractPrefix",
                  event.target.value,
                )
              }
              placeholder="CONTRAT"
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-2.5
                outline-none
                focus:border-slate-900
              "
            />

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Préfixe des reçus
            </label>

            <input
              value={
                settings.documentsReceiptPrefix
              }
              onChange={(event) =>
                updateField(
                  "documentsReceiptPrefix",
                  event.target.value,
                )
              }
              placeholder="RECU"
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-2.5
                outline-none
                focus:border-slate-900
              "
            />

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Format des dates
            </label>

            <select
              value={
                settings.documentsDateFormat
              }
              onChange={(event) =>
                updateField(
                  "documentsDateFormat",
                  event.target.value,
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-4
                py-2.5
                outline-none
                focus:border-slate-900
              "
            >

              <option value="DD/MM/YYYY">
                JJ/MM/AAAA
              </option>

              <option value="YYYY-MM-DD">
                AAAA-MM-JJ
              </option>

              <option value="MM/DD/YYYY">
                MM/JJ/AAAA
              </option>

            </select>

          </div>

        </div>

      </section>


      {/* AFFICHAGE */}

      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Affichage
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Définissez les éléments à afficher
            sur les documents.
          </p>

        </div>


        <div className="space-y-5">

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">

            <div>

              <p className="font-medium text-slate-900">
                Afficher le logo
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Afficher le logo de l'organisation
                sur les documents.
              </p>

            </div>

            <input
              type="checkbox"
              checked={
                settings.documentsShowLogo ===
                "true"
              }
              onChange={(event) =>
                updateField(
                  "documentsShowLogo",
                  String(
                    event.target.checked,
                  ),
                )
              }
              className="h-5 w-5"
            />

          </label>


          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">

            <div>

              <p className="font-medium text-slate-900">
                Afficher les signatures
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Réserver un espace pour les
                signatures sur les contrats.
              </p>

            </div>

            <input
              type="checkbox"
              checked={
                settings.documentsShowSignatures ===
                "true"
              }
              onChange={(event) =>
                updateField(
                  "documentsShowSignatures",
                  String(
                    event.target.checked,
                  ),
                )
              }
              className="h-5 w-5"
            />

          </label>

        </div>

      </section>


      {/* PIED DE PAGE */}

      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Pied de page
          </h2>

        </div>

        <textarea
          value={
            settings.documentsFooter
          }
          onChange={(event) =>
            updateField(
              "documentsFooter",
              event.target.value,
            )
          }
          rows={3}
          placeholder="Texte affiché en bas des documents..."
          className="
            w-full
            resize-none
            rounded-lg
            border
            border-slate-300
            px-4
            py-3
            outline-none
            focus:border-slate-900
          "
        />

      </section>


      {/* MENTIONS LÉGALES */}

      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Mentions légales
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Texte légal pouvant être utilisé
            dans les contrats et documents.
          </p>

        </div>

        <textarea
          value={
            settings.documentsLegalNotice
          }
          onChange={(event) =>
            updateField(
              "documentsLegalNotice",
              event.target.value,
            )
          }
          rows={5}
          placeholder="Mentions légales..."
          className="
            w-full
            resize-none
            rounded-lg
            border
            border-slate-300
            px-4
            py-3
            outline-none
            focus:border-slate-900
          "
        />

      </section>


      {/* BOUTON FINAL */}

      <div className="flex justify-end pb-8">

        <button
          onClick={handleSave}
          disabled={saving}
          className="
            flex
            items-center
            gap-2
            rounded-lg
            bg-slate-900
            px-6
            py-3
            text-sm
            font-medium
            text-white
            hover:bg-slate-800
            disabled:opacity-50
          "
        >

          {saved ? (
            <Check size={18} />
          ) : (
            <Save size={18} />
          )}

          {saving
            ? "Enregistrement..."
            : saved
              ? "Paramètres enregistrés"
              : "Enregistrer les paramètres"}

        </button>

      </div>

    </div>
  );
}