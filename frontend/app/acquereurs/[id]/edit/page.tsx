"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserRound,
} from "lucide-react";

import {
  getAcquereur,
  type Acquereur,
} from "@/services/acquereurs";

import AcquereurForm from "@/components/acquereurs/AcquereurForm";

export default function EditAcquereurPage() {
  const params = useParams();
  const router = useRouter();

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
      <div>
        <Link
          href={`/acquereurs/${id}`}
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
          Retour aux détails
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="
            rounded-xl
            bg-slate-900
            p-3
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
            Modifier l'acquéreur
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            {acquereur.prenom}{" "}
            {acquereur.nom}
          </p>
        </div>
      </div>

      <AcquereurForm
        acquereur={acquereur}
        onSuccess={(updated) => {
          router.push(
            `/acquereurs/${updated.id}`,
          );
        }}
      />
    </div>
  );
}