"use client";

import { useEffect, useState } from "react";

import {
  ShieldCheck,
  Save,
  KeyRound,
  Clock,
  UserCheck,
  Lock,
} from "lucide-react";

import { apiRequest } from "@/services/api";

interface SecuritySettings {
  sessionTimeout: string;
  maxLoginAttempts: string;
  passwordMinLength: string;
  requireStrongPassword: boolean;
  requireMfa: boolean;
  allowMultipleSessions: boolean;
}

const defaultSettings: SecuritySettings = {
  sessionTimeout: "30",
  maxLoginAttempts: "5",
  passwordMinLength: "8",
  requireStrongPassword: true,
  requireMfa: false,
  allowMultipleSessions: true,
};

export default function SecuritySettingsPage() {
  const [settings, setSettings] =
    useState<SecuritySettings>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await apiRequest("/settings");

        const result = { ...defaultSettings };

        for (const setting of data) {
          switch (setting.key) {
            case "security.sessionTimeout":
              result.sessionTimeout = setting.value;
              break;

            case "security.maxLoginAttempts":
              result.maxLoginAttempts = setting.value;
              break;

            case "security.passwordMinLength":
              result.passwordMinLength = setting.value;
              break;

            case "security.requireStrongPassword":
              result.requireStrongPassword =
                setting.value === "true";
              break;

            case "security.requireMfa":
              result.requireMfa =
                setting.value === "true";
              break;

            case "security.allowMultipleSessions":
              result.allowMultipleSessions =
                setting.value === "true";
              break;
          }
        }

        setSettings(result);
      } catch (error) {
        console.error(
          "Erreur chargement sécurité :",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateSetting(
    key: keyof SecuritySettings,
    value: string | boolean,
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveSetting(
    key: keyof SecuritySettings,
  ) {
    setSaving(true);
    setMessage("");

    try {
      await apiRequest(
        `/settings/security.${key}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            value: String(settings[key]),
          }),
        },
      );

      setMessage("Paramètres de sécurité enregistrés.");
    } catch (error) {
      console.error(
        "Erreur sauvegarde sécurité :",
        error,
      );

      setMessage(
        "Erreur lors de l'enregistrement.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveAll() {
    setSaving(true);
    setMessage("");

    try {
      for (const [key, value] of Object.entries(
        settings,
      )) {
        await apiRequest(
          `/settings/security.${key}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              value: String(value),
            }),
          },
        );
      }

      setMessage(
        "Tous les paramètres de sécurité ont été enregistrés.",
      );
    } catch (error) {
      console.error(
        "Erreur sauvegarde sécurité :",
        error,
      );

      setMessage(
        "Erreur lors de l'enregistrement.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-slate-500">
        Chargement des paramètres de sécurité...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="flex items-start justify-between gap-4">

        <div>
          <div className="flex items-center gap-3">
            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-lg
              bg-slate-100
              text-slate-700
            ">
              <ShieldCheck size={22} />
            </div>

            <h1 className="
              text-3xl
              font-bold
              text-slate-900
            ">
              Sécurité
            </h1>
          </div>

          <p className="
            mt-3
            text-slate-500
          ">
            Configurez les règles de sécurité
            de la plateforme NIANI'S IMO.
          </p>
        </div>

        <button
          onClick={saveAll}
          disabled={saving}
          className="
            flex
            items-center
            gap-2
            rounded-lg
            bg-slate-900
            px-4
            py-2.5
            text-sm
            font-medium
            text-white
            transition
            hover:bg-slate-800
            disabled:opacity-50
          "
        >
          <Save size={17} />

          {saving
            ? "Enregistrement..."
            : "Enregistrer"}
        </button>

      </div>

      {message && (
        <div className="
          rounded-lg
          border
          border-slate-200
          bg-slate-50
          px-4
          py-3
          text-sm
          text-slate-600
        ">
          {message}
        </div>
      )}

      <div className="
        grid
        gap-6
        lg:grid-cols-2
      ">

        <section className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        ">

          <div className="flex items-center gap-3">

            <div className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              bg-slate-100
              text-slate-700
            ">
              <KeyRound size={19} />
            </div>

            <div>
              <h2 className="
                font-semibold
                text-slate-900
              ">
                Politique des mots de passe
              </h2>

              <p className="
                text-sm
                text-slate-500
              ">
                Définissez les règles minimales.
              </p>
            </div>

          </div>

          <div className="mt-6 space-y-5">

            <div>
              <label className="
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Longueur minimale
              </label>

              <input
                type="number"
                min="4"
                max="64"
                value={settings.passwordMinLength}
                onChange={(e) =>
                  updateSetting(
                    "passwordMinLength",
                    e.target.value,
                  )
                }
                className="
                  mt-2
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  py-2.5
                  outline-none
                  focus:border-slate-500
                "
              />

              <p className="
                mt-1
                text-xs
                text-slate-500
              ">
                Nombre minimal de caractères.
              </p>
            </div>

            <label className="
              flex
              items-center
              justify-between
              gap-4
              rounded-lg
              border
              border-slate-200
              p-4
            ">

              <div>
                <p className="
                  text-sm
                  font-medium
                  text-slate-800
                ">
                  Mot de passe complexe
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-slate-500
                ">
                  Exiger une combinaison plus forte.
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  settings.requireStrongPassword
                }
                onChange={(e) =>
                  updateSetting(
                    "requireStrongPassword",
                    e.target.checked,
                  )
                }
                className="h-5 w-5"
              />

            </label>

          </div>

        </section>

        <section className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        ">

          <div className="flex items-center gap-3">

            <div className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              bg-slate-100
              text-slate-700
            ">
              <Clock size={19} />
            </div>

            <div>
              <h2 className="
                font-semibold
                text-slate-900
              ">
                Sessions
              </h2>

              <p className="
                text-sm
                text-slate-500
              ">
                Contrôlez les sessions utilisateurs.
              </p>
            </div>

          </div>

          <div className="mt-6 space-y-5">

            <div>
              <label className="
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Expiration de session
              </label>

              <div className="mt-2 flex items-center gap-2">

                <input
                  type="number"
                  min="5"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    updateSetting(
                      "sessionTimeout",
                      e.target.value,
                    )
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    outline-none
                    focus:border-slate-500
                  "
                />

                <span className="
                  text-sm
                  text-slate-500
                ">
                  minutes
                </span>

              </div>
            </div>

            <div>
              <label className="
                block
                text-sm
                font-medium
                text-slate-700
              ">
                Tentatives de connexion
              </label>

              <input
                type="number"
                min="1"
                value={settings.maxLoginAttempts}
                onChange={(e) =>
                  updateSetting(
                    "maxLoginAttempts",
                    e.target.value,
                  )
                }
                className="
                  mt-2
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  py-2.5
                  outline-none
                  focus:border-slate-500
                "
              />

              <p className="
                mt-1
                text-xs
                text-slate-500
              ">
                Nombre maximal de tentatives avant
                blocage.
              </p>
            </div>

          </div>

        </section>

        <section className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        ">

          <div className="flex items-center gap-3">

            <div className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              bg-slate-100
              text-slate-700
            ">
              <UserCheck size={19} />
            </div>

            <div>
              <h2 className="
                font-semibold
                text-slate-900
              ">
                Authentification
              </h2>

              <p className="
                text-sm
                text-slate-500
              ">
                Renforcez l'accès à NIANI'S IMO.
              </p>
            </div>

          </div>

          <div className="mt-6 space-y-4">

            <label className="
              flex
              items-center
              justify-between
              gap-4
              rounded-lg
              border
              border-slate-200
              p-4
            ">

              <div>
                <p className="
                  text-sm
                  font-medium
                  text-slate-800
                ">
                  Authentification MFA
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-slate-500
                ">
                  Exiger une authentification
                  multifacteur.
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings.requireMfa}
                onChange={(e) =>
                  updateSetting(
                    "requireMfa",
                    e.target.checked,
                  )
                }
                className="h-5 w-5"
              />

            </label>

            <label className="
              flex
              items-center
              justify-between
              gap-4
              rounded-lg
              border
              border-slate-200
              p-4
            ">

              <div>
                <p className="
                  text-sm
                  font-medium
                  text-slate-800
                ">
                  Sessions multiples
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-slate-500
                ">
                  Autoriser plusieurs connexions
                  simultanées.
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  settings.allowMultipleSessions
                }
                onChange={(e) =>
                  updateSetting(
                    "allowMultipleSessions",
                    e.target.checked,
                  )
                }
                className="h-5 w-5"
              />

            </label>

          </div>

        </section>

        <section className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        ">

          <div className="flex items-center gap-3">

            <div className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              bg-slate-100
              text-slate-700
            ">
              <Lock size={19} />
            </div>

            <div>
              <h2 className="
                font-semibold
                text-slate-900
              ">
                Protection
              </h2>

              <p className="
                text-sm
                text-slate-500
              ">
                Paramètres généraux de protection.
              </p>
            </div>

          </div>

          <div className="
            mt-6
            rounded-lg
            bg-slate-50
            p-4
          ">

            <p className="
              text-sm
              font-medium
              text-slate-800
            ">
              Configuration centralisée
            </p>

            <p className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            ">
              Ces paramètres sont enregistrés
              dans le système de configuration
              NIANI'S IMO et pourront ensuite être
              utilisés par les mécanismes
              d'authentification et de sécurité
              du backend.
            </p>

          </div>

        </section>

      </div>

    </div>
  );
}