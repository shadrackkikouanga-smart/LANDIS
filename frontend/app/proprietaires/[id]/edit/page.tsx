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
  Save,
  UserRound,
  Loader2,
} from "lucide-react";

import {
  getProprietaire,
  updateProprietaire,
} from "@/services/proprietaires";

export default function EditProprietairePage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] =
    useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getProprietaire(id);

        setNom(data.nom);
        setPrenom(data.prenom);
        setTelephone(data.telephone);
        setEmail(data.email ?? "");
        setAdresse(data.adresse ?? "");
      } catch (error) {
        console.error(
          "Erreur chargement propriétaire :",
          error,
        );

        setError(
          "Impossible de charger ce propriétaire.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await updateProprietaire(id, {
        nom,
        prenom,
        telephone,
        email: email || undefined,
        adresse: adresse || undefined,
      });

      router.push(
        `/proprietaires/${id}`,
      );
    } catch (error) {
      console.error(
        "Erreur modification propriétaire :",
        error,
      );

      setError(
        "Impossible de modifier le propriétaire.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[400px]
          items-center
          justify-center
        "
      >
        <Loader2
          size={32}
          className="animate-spin text-slate-500"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">

      {/* EN-TÊTE */}

      <div className="flex items-center gap-4">

        <Link
          href={`/proprietaires/${id}`}
          className="
            rounded-lg
            border
            border-slate-300
            bg-white
            p-2
            text-slate-600
            hover:bg-slate-50
          "
        >
          <ArrowLeft size={20} />
        </Link>

        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-slate-900
            text-white
          "
        >
          <UserRound size={24} />
        </div>

        <div>

          <h1
            className="
              text-3xl
              font-bold
              text-slate-900
            "
          >
            Modifier le propriétaire
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Modifier les informations du propriétaire
          </p>

        </div>

      </div>


      {/* FORMULAIRE */}

      <form
        onSubmit={handleSubmit}
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
          md:p-8
        "
      >

        {error && (
          <div
            className="
              mb-6
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


        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <div>

            <label
              htmlFor="nom"
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

            <input
              id="nom"
              type="text"
              value={nom}
              onChange={(event) =>
                setNom(event.target.value)
              }
              required
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-3
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
              htmlFor="prenom"
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
              id="prenom"
              type="text"
              value={prenom}
              onChange={(event) =>
                setPrenom(event.target.value)
              }
              required
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-3
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
              htmlFor="telephone"
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

            <input
              id="telephone"
              type="tel"
              value={telephone}
              onChange={(event) =>
                setTelephone(event.target.value)
              }
              required
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-3
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
              htmlFor="email"
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

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                px-4
                py-3
                text-sm
                outline-none
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
            />

          </div>


          <div className="md:col-span-2">

            <label
              htmlFor="adresse"
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

            <textarea
              id="adresse"
              value={adresse}
              onChange={(event) =>
                setAdresse(event.target.value)
              }
              rows={4}
              className="
                w-full
                resize-none
                rounded-lg
                border
                border-slate-300
                px-4
                py-3
                text-sm
                outline-none
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
            />

          </div>

        </div>


        {/* ACTIONS */}

        <div
          className="
            mt-8
            flex
            justify-end
            gap-3
            border-t
            border-slate-100
            pt-6
          "
        >

          <Link
            href={`/proprietaires/${id}`}
            className="
              rounded-lg
              border
              border-slate-300
              bg-white
              px-5
              py-2.5
              text-sm
              font-medium
              text-slate-700
              hover:bg-slate-50
            "
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={saving}
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
              hover:bg-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            <Save size={17} />

            {saving
              ? "Enregistrement..."
              : "Enregistrer les modifications"}

          </button>

        </div>

      </form>

    </div>
  );
}