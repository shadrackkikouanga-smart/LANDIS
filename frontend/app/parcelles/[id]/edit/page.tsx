"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getParcelle,
  Parcelle,
} from "@/services/parcelles";

import ParcelleEditForm from "@/components/parcelles/ParcelleEditForm";

export default function EditParcellePage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [parcelle, setParcelle] =
    useState<Parcelle | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const data =
          await getParcelle(id);

        setParcelle(data);
      } catch (error) {
        console.error(
          "Erreur chargement parcelle :",
          error,
        );

        setError(
          "Impossible de charger la parcelle.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  if (loading) {
    return (
      <div
        className="
          h-80
          animate-pulse
          rounded-2xl
          bg-white
        "
      />
    );
  }

  if (error || !parcelle) {
    return (
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
          "Parcelle introuvable."}
      </div>
    );
  }

  return (
    <ParcelleEditForm
      parcelle={parcelle}
      onSuccess={() =>
        router.push(
          `/parcelles/${parcelle.id}`,
        )
      }
      onCancel={() =>
        router.push(
          `/parcelles/${parcelle.id}`,
        )
      }
    />
  );
}