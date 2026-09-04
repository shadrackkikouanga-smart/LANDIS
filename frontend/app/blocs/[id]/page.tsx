"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Layers,
  ShieldAlert,
  Plus,
  Minus,
  RefreshCw,
  Pencil,
  Trash2,
  Navigation,
} from "lucide-react";
import Link from "next/link";

import {
  getBloc,
  ajouterParcelles,
  reduireParcelles,
  deleteBloc,
  Bloc,
  BlocVoie,
  PositionVoie,
} from "@/services/blocs";

/* =========================================================
   TYPES
========================================================= */

type CoteVoie = {
  position: PositionVoie;
  label: string;
  direction: string;
  icon: string;
};

/* =========================================================
   CONFIGURATION DES 4 CÔTÉS
========================================================= */

const COTES: CoteVoie[] = [
  {
    position: "HAUT",
    label: "Haut",
    direction: "Nord",
    icon: "⬆️",
  },
  {
    position: "BAS",
    label: "Bas",
    direction: "Sud",
    icon: "⬇️",
  },
  {
    position: "GAUCHE",
    label: "Gauche",
    direction: "Ouest",
    icon: "⬅️",
  },
  {
    position: "DROITE",
    label: "Droite",
    direction: "Est",
    icon: "➡️",
  },
];

/* =========================================================
   OUTILS
========================================================= */

function formatNumber(
  value: number | string | null | undefined,
  decimals = 0
): string {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return numericValue.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* =========================================================
   PAGE
========================================================= */

export default function DetailBlocPage() {
  const params = useParams();
  const router = useRouter();

  const [bloc, setBloc] = useState<Bloc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantite, setQuantite] = useState("1");

  /* =======================================================
     CHARGEMENT
  ======================================================= */

  async function loadBlocData() {
    try {
      setLoading(true);
      setError("");

      if (params?.id) {
        const data = await getBloc(Number(params.id));
        setBloc(data);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données du bloc.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlocData();
  }, [params?.id]);

  /* =======================================================
     AJOUTER DES PARCELLES
  ======================================================= */

  async function handleAjouter() {
    if (!bloc || Number(quantite) <= 0) {
      return;
    }

    try {
      setError("");

      await ajouterParcelles(
        bloc.id,
        Number(quantite)
      );

      await loadBlocData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Impossible d'ajouter les parcelles."
      );
    }
  }

  /* =======================================================
     RÉDUIRE DES PARCELLES
  ======================================================= */

  async function handleReduire() {
    if (!bloc || Number(quantite) <= 0) {
      return;
    }

    try {
      setError("");

      await reduireParcelles(
        bloc.id,
        Number(quantite)
      );

      await loadBlocData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Impossible de réduire les parcelles."
      );
    }
  }

  /* =======================================================
     SUPPRESSION
  ======================================================= */

  async function handleDelete() {
    if (!bloc) {
      return;
    }

    const confirmed = window.confirm(
      `Supprimer le bloc "${bloc.reference}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteBloc(bloc.id);

      router.push("/blocs");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Impossible de supprimer le bloc."
      );
    }
  }

  /* =======================================================
     CHARGEMENT
  ======================================================= */

  if (loading) {
    return (
      <div className="p-6 h-40 animate-pulse bg-slate-100 rounded-xl" />
    );
  }

  if (!bloc) {
    return (
      <div className="p-6 text-center text-red-600">
        Bloc introuvable.
      </div>
    );
  }

  const stats = bloc.statistiques;

  /* =======================================================
     VOIES DU BLOC
  ======================================================= */

  const voies = bloc.voies ?? [];

  /*
   * Recherche la voie associée à un côté précis.
   */
  function getVoieByPosition(
    position: PositionVoie
  ): BlocVoie | undefined {
    return voies.find(
      (association) =>
        association.position === position
    );
  }

  return (
    <div className="space-y-6">

      {/* ===================================================
          RETOUR + ACTIONS
      =================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <Link
          href="/blocs"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Retour aux blocs
        </Link>

        <div className="flex gap-3">

          <Link
            href={`/blocs/${bloc.id}/edit`}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={16} />
            Modifier
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
            Supprimer
          </button>

        </div>
      </div>

      {/* ===================================================
          TITRE
      =================================================== */}

      <div className="flex items-center gap-4">

        <div className="rounded-xl bg-slate-900 p-3 text-white">
          <Layers size={24} />
        </div>

        <div>

          <div className="flex items-center gap-3">

            <h1 className="text-2xl font-bold text-slate-900">
              BLOC-{bloc.reference}
            </h1>

            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                stats?.etatBloc === "COMPLET"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {stats?.etatBloc || "INCOMPLET"}
            </span>

          </div>

          <p className="text-sm text-slate-500 mt-1">
            Terrain :{" "}
            {bloc.terrain?.reference ||
              "Terrain principal Pointe-Noire"}
          </p>

        </div>
      </div>

      {/* ===================================================
          ERREUR
      =================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ===================================================
          RÉSUMÉ
      =================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium uppercase">
            Superficie
          </span>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatNumber(bloc.superficie)} m²
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium uppercase">
            Parcelles
          </span>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {bloc.nombreParcelles}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium uppercase">
            Terrain
          </span>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {bloc.terrain?.reference || "TER-001"}
          </p>
        </div>

      </div>

      {/* ===================================================
          PLAN DES VOIES LIMITROPHES
      =================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 mb-3 border-b pb-2">

          <Navigation size={16} />

          Plan des voies limitrophes

          <span className="text-slate-400 font-normal">
            (
            {bloc.statut === "TERMINE"
              ? "Quadrillage Validé"
              : "En cours"}
            )
          </span>

        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {COTES.map((cote) => {

            const association =
              getVoieByPosition(cote.position);

            const voie = association?.voie;

            return (
              <div
                key={cote.position}
                className={`rounded-lg p-3 border ${
                  voie
                    ? "bg-slate-50 border-slate-200"
                    : "bg-amber-50 border-amber-100"
                }`}
              >

                {/* CÔTÉ */}

                <div className="flex items-center gap-2 text-xs text-slate-500">

                  <span>
                    {cote.icon}
                  </span>

                  <span>
                    {cote.label} ({cote.direction})
                  </span>

                </div>

                {voie ? (
                  <div className="mt-2 space-y-1">

                    {/* RÉFÉRENCE */}

                    <p className="font-bold text-slate-900">
                      {voie.reference}
                    </p>

                    {/* TYPE */}

                    <p className="text-xs font-medium text-slate-600">
                      {voie.type}
                    </p>

                    {/* LARGEUR */}

                    <p className="text-xs text-slate-500">
                      Largeur :{" "}
                      <span className="font-semibold text-slate-700">
                        {formatNumber(voie.largeur, 2)} m
                      </span>
                    </p>

                    {/* LONGUEUR */}

                    <p className="text-xs text-slate-500">
                      Longueur :{" "}
                      <span className="font-semibold text-slate-700">
                        {formatNumber(voie.longueur, 2)} m
                      </span>
                    </p>

                    {/* SUPERFICIE */}

                    <p className="text-xs text-slate-500">
                      Surface :{" "}
                      <span className="font-semibold text-slate-700">
                        {formatNumber(voie.superficie, 2)} m²
                      </span>
                    </p>

                  </div>
                ) : (
                  <div className="mt-2">

                    <p className="font-semibold text-amber-700">
                      Aucune voie associée
                    </p>

                    <p className="text-xs text-amber-600 mt-0.5">
                      Ce côté du bloc n'est pas encore couvert.
                    </p>

                  </div>
                )}

              </div>
            );
          })}

        </div>

        {/* RÉSUMÉ DES VOIES */}

        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">

            <span>
              <strong className="text-slate-900">
                {stats?.nombreVoies ??
                  voies.length}
              </strong>{" "}
              voie(s) associée(s)
            </span>

            <span>
              <strong className="text-slate-900">
                {formatNumber(
                  stats?.superficieVoies ?? 0,
                  2
                )}
              </strong>{" "}
              m² de surface de voies
            </span>

            <span
              className={
                stats?.quadrillageComplet
                  ? "font-semibold text-emerald-600"
                  : "font-semibold text-amber-600"
              }
            >
              {stats?.quadrillageComplet
                ? "Quadrillage complet"
                : "Quadrillage incomplet"}
            </span>

          </div>

        </div>

      </div>

      {/* ===================================================
          STATISTIQUES
      =================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-6 py-4 text-slate-800 font-semibold text-sm">

          <ShieldAlert
            size={18}
            className="text-amber-500"
          />

          Statistiques du bloc

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white">

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <span className="text-xs text-slate-400 font-medium">
              Parcelles déclarées
            </span>

            <p className="text-lg font-bold text-slate-900 mt-1">
              {stats?.nombreParcellesDeclarees || 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <span className="text-xs text-slate-400 font-medium">
              Parcelles réelles
            </span>

            <p className="text-lg font-bold text-slate-900 mt-1">
              {stats?.nombreParcellesReelles || 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <span className="text-xs text-slate-400 font-medium">
              Parcelles attribuées
            </span>

            <p className="text-lg font-bold text-slate-900 mt-1">
              {stats?.parcellesAttribuees || 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <span className="text-xs text-slate-400 font-medium">
              Parcelles disponibles
            </span>

            <p className="text-lg font-bold text-slate-900 mt-1">
              {stats?.parcellesDisponibles || 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <span className="text-xs text-slate-400 font-medium">
              Surface occupée
            </span>

            <p className="text-lg font-bold text-slate-900 mt-1">
              {formatNumber(stats?.surfaceOccupee)} m²
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <span className="text-xs text-slate-400 font-medium">
              Surface disponible
            </span>

            <p className="text-lg font-bold text-slate-900 mt-1">
              {formatNumber(stats?.surfaceDisponible)} m²
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <span className="text-xs text-slate-400 font-medium">
              Taux d'occupation
            </span>

            <p className="text-lg font-bold text-slate-900 mt-1">
              {formatNumber(
                stats?.tauxOccupation,
                2
              )}{" "}
              %
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <span className="text-xs text-slate-400 font-medium">
              Écart parcelles
            </span>

            <p className="text-lg font-bold text-slate-900 mt-1">
              {stats?.ecartParcelles || 0}
            </p>
          </div>

        </div>

      </div>

      {/* ===================================================
          GESTION DES PARCELLES
      =================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">

        <div>

          <h3 className="text-base font-bold text-slate-900">
            Gestion des parcelles
          </h3>

          <p className="text-xs text-slate-400 mt-0.5">
            Ajoutez ou réduisez le nombre de parcelles du bloc.
          </p>

        </div>

        <div className="flex flex-wrap items-center gap-3">

          <input
            type="number"
            min="1"
            value={quantite}
            onChange={(e) =>
              setQuantite(e.target.value)
            }
            className="w-24 rounded-lg border border-slate-300 p-2 text-sm text-center font-semibold outline-none"
          />

          <button
            type="button"
            onClick={handleAjouter}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={15} />
            Ajouter
          </button>

          <button
            type="button"
            onClick={handleReduire}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Minus size={15} />
            Réduire
          </button>

          <button
            type="button"
            onClick={loadBlocData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={15} />
            Actualiser
          </button>

        </div>

      </div>

      {/* ===================================================
          TABLEAU DES PARCELLES
      =================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        <div className="border-b border-slate-100 p-6 bg-white">

          <h3 className="text-base font-bold text-slate-900">
            Parcelles du bloc
          </h3>

          <p className="text-xs text-slate-400 mt-0.5">
            {bloc.parcelles?.length || 0} parcelle(s)
            enregistrée(s).
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse text-left text-sm text-slate-500">

            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">

              <tr>

                <th className="px-6 py-4">
                  Référence
                </th>

                <th className="px-6 py-4">
                  Numéro
                </th>

                <th className="px-6 py-4">
                  Superficie
                </th>

                <th className="px-6 py-4">
                  État
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100 border-t border-slate-100">

              {bloc.parcelles &&
              bloc.parcelles.length > 0 ? (

                bloc.parcelles.map(
                  (parcelle) => (

                    <tr
                      key={parcelle.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >

                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {parcelle.reference}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {parcelle.numero}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {Number(
                          parcelle.superficie
                        ).toFixed(3)}{" "}
                        m²
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                            parcelle.proprietaireId
                              ? "text-blue-700 font-semibold"
                              : "text-emerald-600 font-semibold"
                          }`}
                        >
                          {parcelle.proprietaireId
                            ? "Attribuée"
                            : "Disponible"}
                        </span>

                      </td>

                    </tr>
                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    Aucune parcelle trouvée.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}