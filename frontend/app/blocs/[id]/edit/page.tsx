"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useParams, useRouter } from "next/navigation";

import BlocForm from "@/components/blocs/BlocForm";

import {
  getBloc,
  getTerrains,
  Bloc,
  Terrain,
} from "@/services/blocs";

export default function EditBlocPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [bloc, setBloc] =
    useState<Bloc | null>(null);

  const [terrains, setTerrains] =
    useState<Terrain[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          blocData,
          terrainsData,
        ] = await Promise.all([
          getBloc(id),
          getTerrains(),
        ]);

        setBloc(blocData);
        setTerrains(terrainsData);
      } catch (error) {
        console.error(
          "Erreur chargement bloc :",
          error,
        );

        setError(
          "Impossible de charger les informations du bloc.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (error || !bloc) {
    return (
      <div className="space-y-6">

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

        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-8
            text-sm
            text-red-700
          "
        >
          {error ||
            "Bloc introuvable."}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8">

      <Link
        href={`/blocs/${id}`}
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

        Retour au bloc
      </Link>


      <BlocForm
        terrains={terrains}
        bloc={bloc}
        onCancel={() =>
          router.push(`/blocs/${id}`)
        }
        onSuccess={() =>
          router.push(`/blocs/${id}`)
        }
      />

    </div>
  );
}