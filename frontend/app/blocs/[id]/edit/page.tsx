"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BlocForm from "@/components/blocs/BlocForm";
import { getBloc, Bloc } from "@/services/blocs";

export default function EditBlocPage() {
  const params = useParams();
  const router = useRouter();

  const [bloc, setBloc] = useState<Bloc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        if (params?.id) {
          const blocData = await getBloc(Number(params.id));
          setBloc(blocData);
        }
      } catch (err) {
        console.error("Erreur chargement édition :", err);
        setError(
          "Impossible de charger les données pour la modification."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <Link
        href="/blocs"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Retour aux blocs
      </Link>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {bloc && (
        <BlocForm
          bloc={bloc}
          onCancel={() => router.push("/blocs")}
          onSuccess={() => router.push("/blocs")}
        />
      )}
    </div>
  );
}