"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  Handshake,
  RefreshCw,
  ShieldAlert,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getTerrains } from "@/services/terrains";

import {
  getRapportGlobal,
  type RapportGlobal,
  type RapportAnomalie,
  type RapportPriseAnarchique,
  type RapportVente,
} from "@/services/recensement-rapports.service";

/* -------------------------------------------------------------------------- */
/* Utilitaires                                                                */
/* -------------------------------------------------------------------------- */

function formatNumber(
  value: number | string | null | undefined,
) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "0";
  }

  return new Intl.NumberFormat("fr-FR").format(
    numberValue,
  );
}

function formatMoney(
  value: number | string | null | undefined,
) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "0 FCFA";
  }

  return `${new Intl.NumberFormat("fr-FR").format(
    numberValue,
  )} FCFA`;
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function nomComplet(
  prenom?: string | null,
  nom?: string | null,
) {
  return [prenom, nom]
    .filter(Boolean)
    .join(" ");
}

function situationLabel(
  situation: string,
) {
  switch (situation) {
    case "VENDUE":
      return "Vendue";

    case "DONNEE":
      return "Donnée";

    case "PRISE_ANARCHIQUEMENT":
      return "Prise anarchiquement";

    case "A_VERIFIER":
      return "À vérifier";

    case "AUTRE":
      return "Autre";

    default:
      return situation;
  }
}

/* -------------------------------------------------------------------------- */
/* Composants                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof ClipboardList;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ClipboardList;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-slate-200 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function NiveauBadge({
  niveau,
}: {
  niveau: string;
}) {
  if (niveau === "ANOMALIE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
        <XCircle className="h-3.5 w-3.5" />
        Anomalie
      </span>
    );
  }

  if (niveau === "A_VERIFIER") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5" />
        À vérifier
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Cohérent
    </span>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <ClipboardList className="h-6 w-6" />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

interface TerrainRapport {
  id: number;
  reference: string;
  nom: string;
}

export default function RecensementsRapportsPage() {
  const [terrains, setTerrains] = useState<
  TerrainRapport[]
  >([]);

  const [terrainId, setTerrainId] = useState<
    number | undefined
  >(undefined);

  const [rapport, setRapport] =
    useState<RapportGlobal | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [loadingTerrains, setLoadingTerrains] =
    useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [terrainError, setTerrainError] =
    useState<string | null>(null);

  async function loadTerrains() {
    try {
      setLoadingTerrains(true);
      setTerrainError(null);

      const data = await getTerrains();

      setTerrains(
        Array.isArray(data) ? data : [],
      );
    } catch (err) {
      setTerrainError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les terrains.",
      );
    } finally {
      setLoadingTerrains(false);
    }
  }

  async function loadRapport(
    selectedTerrainId?: number,
  ) {
    try {
      setLoading(true);
      setError(null);

      const data = await getRapportGlobal(
        selectedTerrainId,
      );

      setRapport(data);
    } catch (err) {
      setRapport(null);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger le rapport du recensement.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTerrains();
  }, []);

  useEffect(() => {
    loadRapport(terrainId);
  }, [terrainId]);

  const ventes = useMemo(
    () =>
      rapport?.ventesParFamille.familles ?? [],
    [rapport],
  );

  const dons = useMemo(
    () => rapport?.donsParFamille.dons ?? [],
    [rapport],
  );

  const prisesAnarchiques = useMemo(
    () =>
      rapport?.prisesAnarchiques.occupations ?? [],
    [rapport],
  );

  const anomalies = useMemo(
    () =>
      rapport?.anomalies.resultats ?? [],
    [rapport],
  );

  return (
    <div className="min-h-full bg-slate-50">
      <div className="space-y-6 p-6 lg:p-8">
        {/* En-tête */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/recensements"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux recensements
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-3 text-white">
                <FileText className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Rapports du recensement
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Synthèse et exploitation des
                  constatations de terrain.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              loadRapport(terrainId)
            }
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Actualiser
          </button>
        </div>

        {/* Filtre terrain */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Périmètre du rapport
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Affichez les données de tous les
                terrains ou d'un terrain précis.
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              <select
                value={
                  terrainId !== undefined
                    ? String(terrainId)
                    : ""
                }
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setTerrainId(
                    value
                      ? Number(value)
                      : undefined,
                  );
                }}
                disabled={loadingTerrains}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
              >
                <option value="">
                  Tous les terrains
                </option>

                {terrains.map((terrain) => (
                  <option
                    key={terrain.id}
                    value={terrain.id}
                  >
                    {terrain.reference} —{" "}
                    {terrain.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {terrainError && (
            <p className="mt-3 text-xs text-red-600">
              {terrainError}
            </p>
          )}
        </div>

        {/* Erreur rapport */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="font-medium text-red-900">
                  Impossible de charger le rapport
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadRapport(terrainId)
                  }
                  className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
              Génération du rapport...
            </div>
          </div>
        ) : rapport ? (
          <>
            {/* Informations du rapport */}

            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {terrainId !== undefined
                    ? "Rapport du terrain sélectionné"
                    : "Rapport global"}
                </p>

                {terrainId !==
                  undefined &&
                  terrains.find(
                    (terrain) =>
                      terrain.id === terrainId,
                  ) && (
                    <p className="mt-1 text-xs text-slate-500">
                      {
                        terrains.find(
                          (terrain) =>
                            terrain.id ===
                            terrainId,
                        )?.reference
                      }{" "}
                      —{" "}
                      {
                        terrains.find(
                          (terrain) =>
                            terrain.id ===
                            terrainId,
                        )?.nom
                      }
                    </p>
                  )}
              </div>

              <p className="text-xs text-slate-400">
                Généré le{" "}
                {formatDate(rapport.genereLe)}
              </p>
            </div>

            {/* Synthèse */}

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Synthèse
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Vue d'ensemble des recensements
                  enregistrés.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total"
                  value={
                    rapport.synthese
                      .totalRecensements
                  }
                  description="Recensements enregistrés"
                  icon={ClipboardList}
                />

                <StatCard
                  label="Vendues"
                  value={
                    rapport.synthese
                      .situations.vendues
                  }
                  description="Situations déclarées vendues"
                  icon={CheckCircle2}
                />

                <StatCard
                  label="Données"
                  value={
                    rapport.synthese
                      .situations.donnees
                  }
                  description="Situations déclarées données"
                  icon={Handshake}
                />

                <StatCard
                  label="À vérifier"
                  value={
                    rapport.synthese
                      .situations.aVerifier
                  }
                  description="Situations nécessitant un contrôle"
                  icon={AlertTriangle}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Prises anarchiques"
                  value={
                    rapport.synthese
                      .situations
                      .prisesAnarchiquement
                  }
                  description="Occupations constatées"
                  icon={ShieldAlert}
                />

                <StatCard
                  label="Autres"
                  value={
                    rapport.synthese
                      .situations.autres
                  }
                  description="Autres situations"
                  icon={ClipboardList}
                />

                <StatCard
                  label="Coopératifs"
                  value={
                    rapport.synthese
                      .cooperation.cooperatives
                  }
                  description="Occupants coopératifs"
                  icon={Handshake}
                />

                <StatCard
                  label="Non coopératifs"
                  value={
                    rapport.synthese
                      .cooperation.nonCooperatives
                  }
                  description="Occupants non coopératifs"
                  icon={XCircle}
                />
              </div>

              {/* Finances */}

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <SectionTitle
                  icon={ClipboardList}
                  title="Situation financière déclarée"
                  description="Montants renseignés dans les recensements."
                />

                <div className="grid gap-4 p-5 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      Montant total
                    </p>

                    <p className="mt-1 text-xl font-semibold text-slate-900">
                      {formatMoney(
                        rapport.synthese
                          .finances.montantTotal,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Montant payé
                    </p>

                    <p className="mt-1 text-xl font-semibold text-emerald-700">
                      {formatMoney(
                        rapport.synthese
                          .finances.montantPaye,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Reste à payer
                    </p>

                    <p className="mt-1 text-xl font-semibold text-amber-700">
                      {formatMoney(
                        rapport.synthese
                          .finances.resteAPayer,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Ventes */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionTitle
                icon={CheckCircle2}
                title="Ventes recensées par famille"
                description={`${rapport.ventesParFamille.nombreFamilles} famille(s) concernée(s) par des ventes recensées.`}
              />

              {ventes.length === 0 ? (
                <EmptyState message="Aucune vente recensée pour ce périmètre." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Famille
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Terrain
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Ventes
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Total
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Payé
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Reste
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Détail
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {ventes.map(
                        (famille) => (
                          <tr
                            key={
                              famille.familleId
                            }
                            className="hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <p className="font-medium text-slate-900">
                                {
                                  famille.famille
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm text-slate-700">
                                {
                                  famille
                                    .terrain
                                    .reference
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  famille
                                    .terrain
                                    .nom
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm font-medium text-slate-800">
                              {formatNumber(
                                famille.nombreVentes,
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-700">
                              {formatMoney(
                                famille.montantTotal,
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-emerald-700">
                              {formatMoney(
                                famille.montantPaye,
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-amber-700">
                              {formatMoney(
                                famille.resteAPayer,
                              )}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <Link
                                href={`/recensements/${famille.ventes[0]?.recensementId ?? ""}`}
                                className="text-xs font-medium text-slate-700 hover:text-slate-900"
                              >
                                Voir
                              </Link>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Détail des ventes */}

              {ventes.some(
                (famille) =>
                  famille.ventes.length > 0,
              ) && (
                <div className="border-t border-slate-200 p-5">
                  <h3 className="mb-4 text-sm font-semibold text-slate-900">
                    Détail des vendeurs et
                    parcelles
                  </h3>

                  <div className="space-y-4">
                    {ventes.flatMap(
                      (famille) =>
                        famille.ventes.map(
                          (
                            vente: RapportVente,
                          ) => (
                            <div
                              key={
                                vente.recensementId
                              }
                              className="rounded-xl border border-slate-200 p-4"
                            >
                              <div className="grid gap-4 lg:grid-cols-5">
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Parcelle
                                  </p>

                                  <Link
                                    href={`/parcelles/${vente.parcelle.id}`}
                                    className="mt-1 block text-sm font-medium text-slate-900 hover:underline"
                                  >
                                    {
                                      vente
                                        .parcelle
                                        .reference
                                    }
                                  </Link>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {vente
                                      .parcelle
                                      .numero
                                      ? `N° ${vente.parcelle.numero} · `
                                      : ""}
                                    {formatNumber(
                                      vente
                                        .parcelle
                                        .superficie,
                                    )}{" "}
                                    m²
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Vendeur
                                  </p>

                                  <p className="mt-1 text-sm font-medium text-slate-800">
                                    {nomComplet(
                                      vente
                                        .vendeur
                                        .prenom,
                                      vente
                                        .vendeur
                                        .nom,
                                    ) ||
                                      "Non renseigné"}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {vente.vendeur
                                      .qualite ||
                                      "Qualité non renseignée"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Occupant
                                  </p>

                                  <p className="mt-1 text-sm font-medium text-slate-800">
                                    {nomComplet(
                                      vente
                                        .occupant
                                        .prenom,
                                      vente
                                        .occupant
                                        .nom,
                                    ) ||
                                      "Non renseigné"}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {vente.occupant
                                      .telephone ||
                                      "Téléphone non renseigné"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Finances
                                  </p>

                                  <p className="mt-1 text-sm text-slate-800">
                                    {formatMoney(
                                      vente.montantTotal,
                                    )}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    Payé :{" "}
                                    {formatMoney(
                                      vente.montantPaye,
                                    )}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Pièces
                                  </p>

                                  <p className="mt-1 text-sm text-slate-800">
                                    {
                                      vente.nombreDocuments
                                    }{" "}
                                    document
                                    {vente.nombreDocuments >
                                    1
                                      ? "s"
                                      : ""}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {
                                      vente.nombreSignataires
                                    }{" "}
                                    signataire
                                    {vente.nombreSignataires >
                                    1
                                      ? "s"
                                      : ""}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ),
                        ),
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Dons */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionTitle
                icon={Handshake}
                title="Dons recensés"
                description={`${rapport.donsParFamille.nombreDons} donation(s) recensée(s).`}
              />

              {dons.length === 0 ? (
                <EmptyState message="Aucune donation recensée pour ce périmètre." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Parcelle
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Famille
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Donateur
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Occupant
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Pièces
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {dons.map((don) => (
                        <tr
                          key={
                            don.recensementId
                          }
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <Link
                              href={`/parcelles/${don.parcelle.id}`}
                              className="font-medium text-slate-900 hover:underline"
                            >
                              {
                                don.parcelle
                                  .reference
                              }
                            </Link>

                            <p className="mt-1 text-xs text-slate-500">
                              {don.parcelle
                                .numero
                                ? `N° ${don.parcelle.numero} · `
                                : ""}
                              {formatNumber(
                                don.parcelle
                                  .superficie,
                              )}{" "}
                              m²
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {don.famille
                              ?.nom ||
                              "Non renseignée"}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-slate-800">
                              {nomComplet(
                                don.donateur
                                  .prenom,
                                don.donateur
                                  .nom,
                              ) ||
                                "Non renseigné"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {don.donateur
                                .qualite ||
                                "Qualité non renseignée"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {nomComplet(
                              don.occupant
                                .prenom,
                              don.occupant
                                .nom,
                            ) ||
                              "Non renseigné"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {don.nombreDocuments}{" "}
                            doc. ·{" "}
                            {
                              don.nombreSignataires
                            }{" "}
                            sign.
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/recensements/${don.recensementId}`}
                              className="text-xs font-medium text-slate-700 hover:text-slate-900"
                            >
                              Voir
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Prises anarchiques */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionTitle
                icon={ShieldAlert}
                title="Prises anarchiques"
                description={`${rapport.prisesAnarchiques.nombrePrisesAnarchiques} occupation(s) anarchique(s) recensée(s).`}
              />

              {prisesAnarchiques.length ===
              0 ? (
                <EmptyState message="Aucune prise anarchique recensée pour ce périmètre." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Parcelle
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Occupant
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Famille
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Droit revendiqué
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Coopération
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Pièces
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {prisesAnarchiques.map(
                        (
                          occupation: RapportPriseAnarchique,
                        ) => (
                          <tr
                            key={
                              occupation.recensementId
                            }
                            className="hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <Link
                                href={`/parcelles/${occupation.parcelle.id}`}
                                className="font-medium text-slate-900 hover:underline"
                              >
                                {
                                  occupation
                                    .parcelle
                                    .reference
                                }
                              </Link>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  occupation
                                    .terrain
                                    .reference
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-slate-800">
                                {nomComplet(
                                  occupation
                                    .occupant
                                    .prenom,
                                  occupation
                                    .occupant
                                    .nom,
                                ) ||
                                  "Non renseigné"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  occupation
                                    .occupant
                                    .telephone
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-700">
                              {occupation
                                .famille
                                ?.nom ||
                                "Non renseignée"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-700">
                              {occupation.droitRevendique ||
                                "Non renseigné"}
                            </td>

                            <td className="px-5 py-4">
                              {occupation.cooperative ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Oui
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                                  <XCircle className="h-3.5 w-3.5" />
                                  Non
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {
                                occupation.nombreDocuments
                              }{" "}
                              doc. ·{" "}
                              {
                                occupation.nombreSignataires
                              }{" "}
                              sign. ·{" "}
                              {
                                occupation.nombreAutoritesEtat
                              }{" "}
                              autor.
                            </td>

                            <td className="px-5 py-4 text-right">
                              <Link
                                href={`/recensements/${occupation.recensementId}`}
                                className="text-xs font-medium text-slate-700 hover:text-slate-900"
                              >
                                Voir
                              </Link>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Pièces */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionTitle
                icon={FileText}
                title="Pièces, signataires et autorités"
                description="Documents et personnes associés aux constats de terrain."
              />

              {rapport.piecesEtAutorites
                .recensements.length ===
              0 ? (
                <EmptyState message="Aucune pièce ou personne associée aux recensements de ce périmètre." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {rapport.piecesEtAutorites.recensements.map(
                    (item) => (
                      <div
                        key={
                          item.recensementId
                        }
                        className="p-5"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <Link
                              href={`/recensements/${item.recensementId}`}
                              className="font-medium text-slate-900 hover:underline"
                            >
                              {item.parcelle
                                .reference}
                            </Link>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                item
                                  .terrain
                                  .reference
                              }{" "}
                              ·{" "}
                              {situationLabel(
                                item.situation,
                              )}
                            </p>
                          </div>

                          <div className="text-xs text-slate-500">
                            {
                              item
                                .documents
                                .length
                            }{" "}
                            document
                            {item.documents
                              .length >
                            1
                              ? "s"
                              : ""}{" "}
                            ·{" "}
                            {
                              item
                                .signataires
                                .length
                            }{" "}
                            signataire
                            {item.signataires
                              .length >
                            1
                              ? "s"
                              : ""}{" "}
                            ·{" "}
                            {
                              item
                                .autorites
                                .length
                            }{" "}
                            autorité
                            {item.autorites
                              .length >
                            1
                              ? "s"
                              : ""}
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Documents
                            </p>

                            {item.documents
                              .length ===
                            0 ? (
                              <p className="mt-2 text-sm text-slate-400">
                                Aucun document
                              </p>
                            ) : (
                              <ul className="mt-2 space-y-2">
                                {item.documents.map(
                                  (
                                    document,
                                  ) => (
                                    <li
                                      key={
                                        document.id
                                      }
                                      className="text-sm text-slate-700"
                                    >
                                      <span className="font-medium">
                                        {
                                          document.typeDocument
                                        }
                                      </span>

                                      {document.reference && (
                                        <span className="ml-1 text-xs text-slate-500">
                                          ·{" "}
                                          {
                                            document.reference
                                          }
                                        </span>
                                      )}
                                    </li>
                                  ),
                                )}
                              </ul>
                            )}
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Signataires
                            </p>

                            {item.signataires
                              .length ===
                            0 ? (
                              <p className="mt-2 text-sm text-slate-400">
                                Aucun signataire
                              </p>
                            ) : (
                              <ul className="mt-2 space-y-2">
                                {item.signataires.map(
                                  (
                                    signataire,
                                  ) => (
                                    <li
                                      key={
                                        signataire.id
                                      }
                                      className="text-sm text-slate-700"
                                    >
                                      <span className="font-medium">
                                        {nomComplet(
                                          signataire.prenom,
                                          signataire.nom,
                                        )}
                                      </span>

                                      {(signataire.qualite ||
                                        signataire.fonction) && (
                                        <span className="block text-xs text-slate-500">
                                          {[
                                            signataire.qualite,
                                            signataire.fonction,
                                          ]
                                            .filter(
                                              Boolean,
                                            )
                                            .join(
                                              " · ",
                                            )}
                                        </span>
                                      )}
                                    </li>
                                  ),
                                )}
                              </ul>
                            )}
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Autorités de l'État
                            </p>

                            {item.autorites
                              .length ===
                            0 ? (
                              <p className="mt-2 text-sm text-slate-400">
                                Aucune autorité
                              </p>
                            ) : (
                              <ul className="mt-2 space-y-2">
                                {item.autorites.map(
                                  (
                                    autorite,
                                  ) => (
                                    <li
                                      key={
                                        autorite.id
                                      }
                                      className="text-sm text-slate-700"
                                    >
                                      <span className="font-medium">
                                        {nomComplet(
                                          autorite.prenom,
                                          autorite.nom,
                                        )}
                                      </span>

                                      <span className="block text-xs text-slate-500">
                                        {
                                          autorite.fonction
                                        }

                                        {autorite.institution &&
                                          ` · ${autorite.institution}`}
                                      </span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>

            {/* Anomalies */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionTitle
                icon={AlertTriangle}
                title="Anomalies et situations à vérifier"
                description={`${rapport.anomalies.nombreProblemes} recensement(s) nécessitant une attention particulière après comparaison avec LANDIS.`}
              />

              {anomalies.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-900">
                    Aucun problème détecté
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Aucun recensement de ce
                    périmètre ne présente
                    actuellement d'anomalie ou
                    de situation à vérifier.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {anomalies.map(
                    (
                      item: RapportAnomalie,
                    ) => (
                      <div
                        key={
                          item.recensementId
                        }
                        className="p-5"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-center gap-3">
                            <NiveauBadge
                              niveau={
                                item.niveau
                              }
                            />

                            <span className="text-sm text-slate-500">
                              Recensement #
                              {
                                item.recensementId
                              }
                            </span>
                          </div>

                          <Link
                            href={`/recensements/${item.recensementId}`}
                            className="text-xs font-medium text-slate-700 hover:text-slate-900"
                          >
                            Voir le recensement
                          </Link>
                        </div>

                        {item.anomalies.length >
                          0 && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                              Anomalies
                            </p>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                              {item.anomalies.map(
                                (
                                  message,
                                  index,
                                ) => (
                                  <li
                                    key={`${item.recensementId}-anomalie-${index}`}
                                  >
                                    {message}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                        {item.avertissements
                          .length >
                          0 && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                              Avertissements
                            </p>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                              {item.avertissements.map(
                                (
                                  message,
                                  index,
                                ) => (
                                  <li
                                    key={`${item.recensementId}-avertissement-${index}`}
                                  >
                                    {message}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                        {item.observations.length >
                          0 && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Observations
                            </p>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                              {item.observations.map(
                                (
                                  message,
                                  index,
                                ) => (
                                  <li
                                    key={`${item.recensementId}-observation-${index}`}
                                  >
                                    {message}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>

            {/* Parcelles recensées */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionTitle
                icon={ClipboardList}
                title="Parcelles recensées"
                description={`${rapport.synthese.parcelles.length} parcelle(s) concernée(s) par les recensements du périmètre.`}
              />

              {rapport.synthese.parcelles
                .length === 0 ? (
                <EmptyState message="Aucune parcelle recensée pour ce périmètre." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Parcelle
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Terrain
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Superficie
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Situation
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Occupant
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {rapport.synthese.parcelles.map(
                        (parcelle) => (
                          <tr
                            key={
                              parcelle.recensementId
                            }
                            className="hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <Link
                                href={`/parcelles/${parcelle.parcelleId}`}
                                className="font-medium text-slate-900 hover:underline"
                              >
                                {
                                  parcelle.reference
                                }
                              </Link>

                              {parcelle.numero && (
                                <p className="mt-1 text-xs text-slate-500">
                                  N°{" "}
                                  {
                                    parcelle.numero
                                  }
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm text-slate-700">
                                {
                                  parcelle
                                    .terrain
                                    .reference
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  parcelle
                                    .terrain
                                    .nom
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-700">
                              {formatNumber(
                                parcelle.superficie,
                              )}{" "}
                              m²
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                                {situationLabel(
                                  parcelle.situation,
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                                  <UserRound className="h-4 w-4" />
                                </div>

                                <span className="text-sm text-slate-700">
                                  {nomComplet(
                                    parcelle.occupantPrenom,
                                    parcelle.occupantNom,
                                  ) ||
                                    "Non renseigné"}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <Link
                                href={`/recensements/${parcelle.recensementId}`}
                                className="text-xs font-medium text-slate-700 hover:text-slate-900"
                              >
                                Voir
                              </Link>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}

        {/* Note métier */}

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <h3 className="font-medium text-blue-900">
                Principe des rapports
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Ces rapports présentent les
                constatations enregistrées lors des
                recensements. Ils ne modifient pas
                automatiquement les données commerciales
                de LANDIS.
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Les anomalies présentées proviennent de
                la comparaison entre les constatations
                de terrain et les données actuellement
                enregistrées dans LANDIS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}