"use client";

import { FormEvent, useState } from "react";
import {
  UserRound,
  Phone,
  Mail,
  MapPin,
  Save,
} from "lucide-react";

import {
  createAcquereur,
  updateAcquereur,
  type Acquereur,
} from "@/services/acquereurs";

interface AcquereurFormProps {
  acquereur?: Acquereur;
  onSuccess: (
    acquereur: Acquereur,
  ) => void;
}

export default function AcquereurForm({
  acquereur,
  onSuccess,
}: AcquereurFormProps) {
  const [nom, setNom] = useState(
    acquereur?.nom ?? "",
  );

  const [prenom, setPrenom] = useState(
    acquereur?.prenom ?? "",
  );

  const [telephone, setTelephone] =
    useState(
      acquereur?.telephone ?? "",
    );

  const [email, setEmail] =
    useState(
      acquereur?.email ?? "",
    );

  const [adresse, setAdresse] =
    useState(
      acquereur?.adresse ?? "",
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!nom.trim()) {
      setError(
        "Le nom est obligatoire.",
      );
      return;
    }

    if (!prenom.trim()) {
      setError(
        "Le prénom est obligatoire.",
      );
      return;
    }

    if (!telephone.trim()) {
      setError(
        "Le téléphone est obligatoire.",
      );
      return;
    }

    try {
      setLoading(true);

      const data = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim(),
        email: email.trim() || undefined,
        adresse:
          adresse.trim() || undefined,
      };

      let result: Acquereur;

      if (acquereur) {
        result =
          await updateAcquereur(
            acquereur.id,
            data,
          );
      } else {
        result =
          await createAcquereur(data);
      }

      onSuccess(result);
    } catch (error) {
      console.error(
        "Erreur sauvegarde acquéreur :",
        error,
      );

      setError(
        "Impossible d'enregistrer l'acquéreur.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        space-y-6
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
      "
    >
      {error && (
        <div
          className="
            rounded-xl
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
          grid
          grid-cols-1
          gap-5
          md:grid-cols-2
        "
      >
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
            Nom *
          </label>

          <div className="relative">
            <UserRound
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={nom}
              onChange={(e) =>
                setNom(e.target.value)
              }
              placeholder="Nom"
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                py-2.5
                pl-10
                pr-3
                text-sm
                outline-none
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
            />
          </div>
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
            Prénom *
          </label>

          <input
            type="text"
            value={prenom}
            onChange={(e) =>
              setPrenom(e.target.value)
            }
            placeholder="Prénom"
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
            "
          />
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
            Téléphone *
          </label>

          <div className="relative">
            <Phone
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="tel"
              value={telephone}
              onChange={(e) =>
                setTelephone(
                  e.target.value,
                )
              }
              placeholder="+242 ..."
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                py-2.5
                pl-10
                pr-3
                text-sm
                outline-none
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
            />
          </div>
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
            Email
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="email@example.com"
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                py-2.5
                pl-10
                pr-3
                text-sm
                outline-none
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
            />
          </div>
        </div>
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
          Adresse
        </label>

        <div className="relative">
          <MapPin
            size={18}
            className="
              absolute
              left-3
              top-3
              text-slate-400
            "
          />

          <textarea
            value={adresse}
            onChange={(e) =>
              setAdresse(e.target.value)
            }
            placeholder="Adresse complète"
            rows={3}
            className="
              w-full
              resize-none
              rounded-lg
              border
              border-slate-300
              bg-white
              py-2.5
              pl-10
              pr-3
              text-sm
              outline-none
              focus:border-slate-500
              focus:ring-2
              focus:ring-slate-200
            "
          />
        </div>
      </div>

      <div
        className="
          flex
          justify-end
          border-t
          border-slate-100
          pt-5
        "
      >
        <button
          type="submit"
          disabled={loading}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-slate-900
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            shadow-sm
            hover:bg-slate-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Save size={17} />

          {loading
            ? "Enregistrement..."
            : acquereur
              ? "Enregistrer les modifications"
              : "Créer l'acquéreur"}
        </button>
      </div>
    </form>
  );
}