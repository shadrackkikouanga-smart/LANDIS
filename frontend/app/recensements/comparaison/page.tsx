"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileWarning,
  Search,
  TriangleAlert,
  Wallet,
} from "lucide-react";

import {
  getComparaisonsRecensements,
  type ComparaisonRecensement,
  type NiveauComparaison,
  type SituationRecensement,
} from "@/services/comparaison-recensement.service";

type FiltreNiveau =
  | "TOUS"
  | NiveauComparaison;

function getSituationLabel(
  situation: SituationRecensement,
): string {
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

function getSituationClasses(
  situation: SituationRecensement,
): string {
  switch (situation) {
    case "VENDUE":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "DONNEE":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "PRISE_ANARCHIQUEMENT":
      return "bg-red-100 text-red-700 border-red-200";
    case "A_VERIFIER":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "AUTRE":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getNiveauLabel(
  niveau: NiveauComparaison,
): string {
  switch (niveau) {
    case "COHERENT":
      return "Cohérent";
    case "A_VERIFIER":
      return "À vérifier";
    case "ANOMALIE":
      return "Anomalie";
    default:
      return niveau;
  }
}

function getNiveauClasses(
  niveau: NiveauComparaison,
): string {
  switch (niveau) {
    case "COHERENT":
      return "bg-green-100 text-green-700 border-green-200";

    case "A_VERIFIER":
      return "bg-amber-100 text-amber-700 border-amber-200";

    case "ANOMALIE":
      return "bg-red-100 text-red-700 border-red-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getNiveauIcon(
  niveau: NiveauComparaison,
) {
  switch (niveau) {
    case "COHERENT":
      return <CheckCircle2 className="h-4 w-4" />;

    case "A_VERIFIER":
      return <TriangleAlert className="h-4 w-4" />;

    case "ANOMALIE":
      return <AlertCircle className="h-4 w-4" />;

    default:
      return <FileWarning className="h-4 w-4" />;
  }
}

function formatNumber(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return new Intl.NumberFormat("fr-FR").format(
    number,
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function ComparaisonRecensementsPage() {
  const [
    comparaisons,
    setComparaisons,
  ] = useState<ComparaisonRecensement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [recherche, setRecherche] =
    useState("");

  const [filtreNiveau, setFiltreNiveau] =
    useState<FiltreNiveau>("TOUS");

  useEffect(() => {
    async function loadComparaisons() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getComparaisonsRecensements();

        setComparaisons(data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les comparaisons.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadComparaisons();
  }, []);

  const statistiques = useMemo(() => {
    let coherents = 0;
    let aVerifier = 0;
    let anomalies = 0;

    for (const comparaison of comparaisons) {
      switch (comparaison.comparaison.niveau) {
        case "COHERENT":
          coherents += 1;
          break;

        case "A_VERIFIER":
          aVerifier += 1;
          break;

        case "ANOMALIE":
          anomalies += 1;
          break;
      }
    }

    return {
      total: comparaisons.length,
      coherents,
      aVerifier,
      anomalies,
    };
  }, [comparaisons]);

  const comparaisonsFiltrees = useMemo(() => {
    const terme =
      recherche.trim().toLowerCase();

    return comparaisons.filter(
      (comparaison) => {
        const niveau =
          comparaison.comparaison.niveau;

        if (
          filtreNiveau !== "TOUS" &&
          niveau !== filtreNiveau
        ) {
          return false;
        }

        if (!terme) {
          return true;
        }

        const parcelle =
          comparaison.landis.parcelle;

        const recensement =
          comparaison.recensement;

        const vendeur =
          recensement.vendeurDonateur;

        const famille =
          recensement.famille;

        const texteRecherche = [
          parcelle.reference,
          parcelle.numero,
          recensement.occupant.nom,
          recensement.occupant.prenom,
          vendeur?.nom,
          vendeur?.prenom,
          famille?.nom,
          getSituationLabel(
            recensement.situation,
          ),
          getNiveauLabel(niveau),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return texteRecherche.includes(
          terme,
        );
      },
    );
  }, [
    comparaisons,
    filtreNiveau,
    recherche,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* En-tête */}
        <div className="mb-6">
          <Link
            href="/recensements"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux recensements
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white">
                  <ClipboardCheck className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Contrôle foncier
                  </p>

                  <h1 className="text-2xl font-bold text-gray-900">
                    Comparaison Recensement ↔ LANDIS
                  </h1>
                </div>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                Cette vue permet de comparer les
                constats réalisés sur le terrain avec
                les informations enregistrées dans
                LANDIS afin d'identifier les situations
                cohérentes, les éléments à vérifier et
                les anomalies.
              </p>
            </div>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="font-semibold text-red-800">
                  Erreur de chargement
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total"
            value={statistiques.total}
            description="Recensements comparés"
            icon={
              <ClipboardCheck className="h-5 w-5" />
            }
          />

          <StatCard
            title="Cohérents"
            value={statistiques.coherents}
            description="Aucun écart détecté"
            icon={
              <CheckCircle2 className="h-5 w-5" />
            }
          />

          <StatCard
            title="À vérifier"
            value={statistiques.aVerifier}
            description="Écarts nécessitant un contrôle"
            icon={
              <TriangleAlert className="h-5 w-5" />
            }
          />

          <StatCard
            title="Anomalies"
            value={statistiques.anomalies}
            description="Contradictions détectées"
            icon={
              <AlertCircle className="h-5 w-5" />
            }
          />
        </div>

        {/* Filtres */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={recherche}
                onChange={(event) =>
                  setRecherche(
                    event.target.value,
                  )
                }
                placeholder="Rechercher une parcelle, famille, occupant..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setFiltreNiveau("TOUS")
                }
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  filtreNiveau === "TOUS"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Tous
              </button>

              <button
                type="button"
                onClick={() =>
                  setFiltreNiveau("COHERENT")
                }
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  filtreNiveau === "COHERENT"
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Cohérents
              </button>

              <button
                type="button"
                onClick={() =>
                  setFiltreNiveau("A_VERIFIER")
                }
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  filtreNiveau === "A_VERIFIER"
                    ? "border-amber-600 bg-amber-600 text-white"
                    : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                <TriangleAlert className="h-4 w-4" />
                À vérifier
              </button>

              <button
                type="button"
                onClick={() =>
                  setFiltreNiveau("ANOMALIE")
                }
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  filtreNiveau === "ANOMALIE"
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                Anomalies
              </button>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Résultats de la comparaison
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {comparaisonsFiltrees.length} résultat
                {comparaisonsFiltrees.length > 1
                  ? "s"
                  : ""}{" "}
                affiché
                {comparaisonsFiltrees.length > 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div className="text-xs text-gray-400">
              Terrain ↔ LANDIS
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({
                  length: 5,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-lg bg-gray-100"
                  />
                ))}
              </div>
            </div>
          ) : comparaisonsFiltrees.length ===
            0 ? (
            <div className="p-10 text-center">
              <ClipboardCheck className="mx-auto h-10 w-10 text-gray-300" />

              <h3 className="mt-3 text-sm font-semibold text-gray-900">
                Aucun résultat
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Aucun recensement ne correspond aux
                critères sélectionnés.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Parcelle
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Terrain
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      LANDIS
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Transaction
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Montants
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Résultat
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {comparaisonsFiltrees.map(
                    (comparaison) => {
                      const parcelle =
                        comparaison.landis.parcelle;

                      const recensement =
                        comparaison.recensement;

                      const transaction =
                        comparaison.landis
                          .transactions
                          .transactionActive;

                      const niveau =
                        comparaison.comparaison
                          .niveau;

                      const montantRecensement =
                        recensement.montantTotal;

                      const montantLandis =
                        transaction?.prix ?? null;

                      return (
                        <tr
                          key={
                            recensement.id
                          }
                          className="transition hover:bg-gray-50"
                        >
                          {/* Parcelle */}
                          <td className="px-4 py-4 align-top">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {
                                  parcelle.reference
                                }
                              </p>

                              {parcelle.numero && (
                                <p className="mt-1 text-xs text-gray-500">
                                  N°{" "}
                                  {
                                    parcelle.numero
                                  }
                                </p>
                              )}

                              <p className="mt-1 text-xs text-gray-500">
                                {
                                  formatNumber(
                                    parcelle.superficie,
                                  )
                                }{" "}
                                m²
                              </p>
                            </div>
                          </td>

                          {/* Terrain / recensement */}
                          <td className="px-4 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getSituationClasses(
                                recensement.situation,
                              )}`}
                            >
                              {getSituationLabel(
                                recensement.situation,
                              )}
                            </span>

                            <p className="mt-2 text-sm text-gray-700">
                              {[
                                recensement
                                  .occupant
                                  .prenom,
                                recensement
                                  .occupant.nom,
                              ]
                                .filter(Boolean)
                                .join(" ") ||
                                "Occupant non renseigné"}
                            </p>

                            {recensement
                              .famille && (
                              <p className="mt-1 text-xs text-gray-500">
                                Famille :{" "}
                                {
                                  recensement
                                    .famille
                                    .nom
                                }
                              </p>
                            )}
                          </td>

                          {/* LANDIS */}
                          <td className="px-4 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                parcelle.statut ===
                                "VENDUE"
                                  ? "border-blue-200 bg-blue-100 text-blue-700"
                                  : "border-green-200 bg-green-100 text-green-700"
                              }`}
                            >
                              {
                                parcelle.statut
                              }
                            </span>

                            <p className="mt-2 text-xs text-gray-500">
                              {parcelle
                                .proprietaire !==
                              null
                                ? `Propriétaire #${parcelle.proprietaire}`
                                : "Aucun propriétaire"}
                            </p>
                          </td>

                          {/* Transaction */}
                          <td className="px-4 py-4 align-top">
                            {transaction?.existe ? (
                              <>
                                <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                  {
                                    transaction.statut
                                  }
                                </span>

                                {transaction
                                  .acquereur && (
                                  <p className="mt-2 text-sm text-gray-700">
                                    {
                                      transaction
                                        .acquereur
                                        .prenom
                                    }{" "}
                                    {
                                      transaction
                                        .acquereur
                                        .nom
                                    }
                                  </p>
                                )}

                                <p className="mt-1 text-xs text-gray-500">
                                  {
                                    comparaison
                                      .landis
                                      .transactions
                                      .nombre
                                  }{" "}
                                  transaction
                                  {comparaison
                                    .landis
                                    .transactions
                                    .nombre >
                                  1
                                    ? "s"
                                    : ""}
                                </p>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">
                                Aucune transaction active
                              </span>
                            )}
                          </td>

                          {/* Montants */}
                          <td className="px-4 py-4 align-top">
                            {montantRecensement !==
                              null ||
                            montantLandis !==
                              null ? (
                              <div className="space-y-1 text-xs">
                                <p className="flex items-center gap-1 text-gray-700">
                                  <span className="font-medium">
                                    Terrain :
                                  </span>
                                  {
                                    formatNumber(
                                      montantRecensement,
                                    )
                                  }{" "}
                                  FCFA
                                </p>

                                <p className="flex items-center gap-1 text-gray-700">
                                  <span className="font-medium">
                                    LANDIS :
                                  </span>
                                  {
                                    formatNumber(
                                      montantLandis,
                                    )
                                  }{" "}
                                  FCFA
                                </p>

                                {transaction?.existe && (
                                  <p className="text-gray-500">
                                    Payé :{" "}
                                    {
                                      formatNumber(
                                        transaction.totalPaye,
                                      )
                                    }{" "}
                                    FCFA
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">
                                Non concerné
                              </span>
                            )}
                          </td>

                          {/* Résultat */}
                          <td className="px-4 py-4 align-top">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getNiveauClasses(
                                niveau,
                              )}`}
                            >
                              {getNiveauIcon(
                                niveau,
                              )}

                              {getNiveauLabel(
                                niveau,
                              )}
                            </span>

                            {comparaison
                              .comparaison
                              .anomalies
                              .length >
                              0 && (
                              <p className="mt-2 text-xs font-medium text-red-600">
                                {
                                  comparaison
                                    .comparaison
                                    .anomalies
                                    .length
                                }{" "}
                                anomalie
                                {comparaison
                                  .comparaison
                                  .anomalies
                                  .length >
                                1
                                  ? "s"
                                  : ""}
                              </p>
                            )}

                            {comparaison
                              .comparaison
                              .avertissements
                              .length >
                              0 && (
                              <p className="mt-1 text-xs text-amber-600">
                                {
                                  comparaison
                                    .comparaison
                                    .avertissements
                                    .length
                                }{" "}
                                avertissement
                                {comparaison
                                  .comparaison
                                  .avertissements
                                  .length >
                                1
                                  ? "s"
                                  : ""}
                              </p>
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-4 py-4 text-right align-top">
                            <Link
                              href={`/recensements/${recensement.id}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" />
                              Voir
                            </Link>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Légende */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-gray-600" />

            <h2 className="text-sm font-semibold text-gray-900">
              Lecture des résultats
            </h2>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />

                <span className="text-sm font-semibold text-green-700">
                  Cohérent
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-green-700">
                Les informations comparées ne présentent
                pas d'écart nécessitant une vérification.
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-amber-600" />

                <span className="text-sm font-semibold text-amber-700">
                  À vérifier
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                Un écart ou une situation particulière
                nécessite un contrôle complémentaire.
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />

                <span className="text-sm font-semibold text-red-700">
                  Anomalie
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-red-700">
                Les données présentent une contradiction
                importante entre le recensement et LANDIS.
              </p>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 py-5">
          <Link
            href="/recensements"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux recensements
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Wallet className="h-3.5 w-3.5" />
            LANDIS · Comparaison foncière
          </div>
        </div>
      </div>
    </div>
  );
}