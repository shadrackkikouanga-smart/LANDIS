"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  UserRound,
  Phone,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";

import {
  getAcquereur,
  type Acquereur,
} from "@/services/acquereurs";

export default function AcquereurDetailsPage() {
  const params = useParams();

  const id = Number(params.id);

  const [acquereur, setAcquereur] =
    useState<Acquereur | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const data =
          await getAcquereur(id);

        setAcquereur(data);
      } catch (error) {
        console.error(
          "Erreur chargement acquéreur :",
          error,
        );

        setError(
          "Impossible de charger l'acquéreur.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (Number.isFinite(id)) {
      load();
    }
  }, [id]);

  if (loading) {
    return (
      <div
        className="
          h-96
          animate-pulse
          rounded-2xl
          bg-white
        "
      />
    );
  }

  if (error || !acquereur) {
    return (
      <div className="space-y-5">
        <Link
          href="/acquereurs"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-slate-600
          "
        >
          <ArrowLeft size={17} />
          Retour
        </Link>

        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-5
            py-4
            text-sm
            text-red-700
          "
        >
          {error ||
            "Acquéreur introuvable."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <Link
          href="/acquereurs"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-slate-600
            hover:text-slate-900
          "
        >
          <ArrowLeft size={17} />
          Retour aux acquéreurs
        </Link>

        <Link
          href={`/acquereurs/${acquereur.id}/edit`}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-slate-900
            px-4
            py-2.5
            text-sm
            font-medium
            text-white
            hover:bg-slate-800
          "
        >
          <Pencil size={17} />
          Modifier
        </Link>
      </div>

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            border-b
            border-slate-100
            px-6
            py-6
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                rounded-xl
                bg-slate-900
                p-4
                text-white
              "
            >
              <UserRound size={28} />
            </div>

            <div>
              <h1
                className="
                  text-2xl
                  font-bold
                  text-slate-900
                "
              >
                {acquereur.prenom}{" "}
                {acquereur.nom}
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Acquéreur #{acquereur.id}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
            "
          >
            <div className="flex gap-3">
              <Phone
                size={19}
                className="text-slate-400"
              />

              <div>
                <p className="text-xs text-slate-400">
                  Téléphone
                </p>

                <p className="mt-1 text-sm font-medium">
                  {acquereur.telephone}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail
                size={19}
                className="text-slate-400"
              />

              <div>
                <p className="text-xs text-slate-400">
                  Email
                </p>

                <p className="mt-1 text-sm font-medium">
                  {acquereur.email ||
                    "Non renseigné"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin
                size={19}
                className="text-slate-400"
              />

              <div>
                <p className="text-xs text-slate-400">
                  Adresse
                </p>

                <p className="mt-1 text-sm font-medium">
                  {acquereur.adresse ||
                    "Non renseignée"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <FileText
                size={19}
                className="text-slate-400"
              />

              <div>
                <p className="text-xs text-slate-400">
                  Transactions
                </p>

                <p className="mt-1 text-sm font-medium">
                  {acquereur.transactions
                    ?.length ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            border-b
            border-slate-100
            px-6
            py-5
          "
        >
          <h2 className="font-semibold text-slate-900">
            Parcelles / transactions
          </h2>
        </div>

        <div className="p-6">
          {!acquereur.transactions ||
          acquereur.transactions.length ===
            0 ? (
            <p className="text-sm text-slate-500">
              Aucune transaction enregistrée
              pour cet acquéreur.
            </p>
          ) : (
            <div className="space-y-3">
              {acquereur.transactions.map(
                (transaction) => (
                  <div
                    key={transaction.id}
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-4
                    "
                  >
                    <p className="text-sm font-semibold">
                      {transaction.parcelle
                        ?.reference ||
                        "Parcelle"}
                    </p>

                    {transaction.parcelle && (
                      <p className="mt-1 text-sm text-slate-500">
                        Parcelle{" "}
                        {
                          transaction
                            .parcelle
                            .numero
                        }{" "}
                        —{" "}
                        {
                          transaction
                            .parcelle
                            .superficie
                        }{" "}
                        m²
                      </p>
                    )}

                    {transaction.statut && (
                      <p className="mt-2 text-xs text-slate-400">
                        Statut :{" "}
                        {
                          transaction.statut
                        }
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}