"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import BlocForm from "@/components/blocs/BlocForm";

import {
  getTerrains,
  Terrain,
} from "@/services/blocs";

export default function NewBlocPage() {
  const router = useRouter();

  const [terrains, setTerrains] =
    useState<Terrain[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadTerrains() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getTerrains();

        setTerrains(data);
      } catch (error) {
        console.error(
          "Erreur chargement terrains :",
          error,
        );

        setError(
          "Impossible de charger les terrains.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTerrains();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <Link
        href="/blocs"
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

        Retour aux blocs
      </Link>


      {error && (
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
          {error}
        </div>
      )}


      {terrains.length === 0 ? (
        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-10
            text-center
          "
        >
          <h1
            className="
              text-xl
              font-bold
              text-slate-900
            "
          >
            Aucun terrain disponible
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Vous devez créer un terrain avant
            de pouvoir créer un bloc.
          </p>

          <Link
            href="/terrains/new"
            className="
              mt-6
              inline-flex
              rounded-lg
              bg-slate-900
              px-5
              py-2.5
              text-sm
              font-medium
              text-white
              hover:bg-slate-800
            "
          >
            Créer un terrain
          </Link>
        </div>
      ) : (
        <BlocForm
          terrains={terrains}
          onCancel={() =>
            router.push("/blocs")
          }
          onSuccess={() =>
            router.push("/blocs")
          }
        />
      )}

    </div>
  );
}