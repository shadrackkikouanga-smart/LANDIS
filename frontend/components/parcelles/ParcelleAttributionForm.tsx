"use client";

import { FormEvent, useEffect, useState } from "react";
import { UserRound, X } from "lucide-react";

import {
  Parcelle,
  attribuerParcelle,
} from "@/services/parcelles";

import {
  getProprietaires,
  Proprietaire,
} from "@/services/proprietaires";

interface ParcelleAttributionFormProps {
  parcelle: Parcelle;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ParcelleAttributionForm({
  parcelle,
  onSuccess,
  onCancel,
}: ParcelleAttributionFormProps) {
  const [proprietaires, setProprietaires] =
    useState<Proprietaire[]>([]);

  const [proprietaireId, setProprietaireId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadProprietaires() {
      try {
        setLoading(true);

        const data =
          await getProprietaires();

        setProprietaires(data);
      } catch (error) {
        console.error(
          "Erreur chargement propriétaires :",
          error,
        );

        setError(
          "Impossible de charger les propriétaires.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProprietaires();
  }, []);

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");

    if (!proprietaireId) {
      setError(
        "Veuillez sélectionner un propriétaire.",
      );
      return;
    }

    try {
      setSaving(true);

      await attribuerParcelle(
        parcelle.id,
        Number(proprietaireId),
      );

      onSuccess();
    } catch (error) {
      console.error(
        "Erreur attribution parcelle :",
        error,
      );

      setError(
        "Impossible d'attribuer cette parcelle.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "
    >
      <div
        className="
          w-full
          max-w-lg
          rounded-2xl
          bg-white
          shadow-xl
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            px-6
            py-5
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                rounded-lg
                bg-slate-100
                p-2
              "
            >
              <UserRound
                size={20}
                className="text-slate-700"
              />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                Attribuer la parcelle
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                {parcelle.reference}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="
              rounded-lg
              p-2
              text-slate-400
              hover:bg-slate-100
            "
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            {error && (
              <div
                className="
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
              >
                {error}
              </div>
            )}

            <div
              className="
                rounded-xl
                bg-slate-50
                p-4
              "
            >
              <p className="text-xs text-slate-400">
                Parcelle
              </p>

              <p
                className="
                  mt-1
                  font-semibold
                  text-slate-800
                "
              >
                {parcelle.reference}
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                {parcelle.superficie.toLocaleString(
                  "fr-FR",
                )}{" "}
                m²
              </p>
            </div>

            <div>
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Propriétaire *
              </label>

              <select
                value={proprietaireId}
                onChange={(event) =>
                  setProprietaireId(
                    event.target.value,
                  )
                }
                disabled={loading}
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  focus:border-slate-500
                  focus:ring-2
                  focus:ring-slate-200
                  disabled:bg-slate-100
                "
              >
                <option value="">
                  {loading
                    ? "Chargement..."
                    : "Sélectionner un propriétaire"}
                </option>

                {proprietaires.map(
                  (proprietaire) => (
                    <option
                      key={proprietaire.id}
                      value={proprietaire.id}
                    >
                      {proprietaire.nom}{" "}
                      {proprietaire.prenom} —{" "}
                      {proprietaire.telephone}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div
            className="
              flex
              justify-end
              gap-3
              border-t
              border-slate-200
              px-6
              py-4
            "
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="
                rounded-lg
                border
                border-slate-300
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-700
                hover:bg-slate-50
              "
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loading ||
                !proprietaireId
              }
              className="
                rounded-lg
                bg-slate-900
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "Attribution..."
                : "Attribuer la parcelle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}