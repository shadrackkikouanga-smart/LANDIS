"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  GitCompare,
  Handshake,
  Plus,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getRecensements,
  type Recensement,
  type SituationRecensement,
} from "@/services/recensements.service";

const SITUATIONS: Array<{
  value: SituationRecensement | "TOUS";
  label: string;
}> = [
  {
    value: "TOUS",
    label: "Toutes les situations",
  },
  {
    value: "VENDUE",
    label: "Vendue",
  },
  {
    value: "DONNEE",
    label: "Donnée",
  },
  {
    value: "PRISE_ANARCHIQUEMENT",
    label: "Prise anarchiquement",
  },
  {
    value: "A_VERIFIER",
    label: "À vérifier",
  },
  {
    value: "AUTRE",
    label: "Autre",
  },
];

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
  }).format(date);
}

function getSituationLabel(
  situation: SituationRecensement,
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

function SituationBadge({
  situation,
}: {
  situation: SituationRecensement;
}) {
  const styles: Record<
    SituationRecensement,
    string
  > = {
    VENDUE:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    DONNEE:
      "bg-blue-50 text-blue-700 border-blue-200",
    PRISE_ANARCHIQUEMENT:
      "bg-red-50 text-red-700 border-red-200",
    A_VERIFIER:
      "bg-amber-50 text-amber-700 border-amber-200",
    AUTRE:
      "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[situation]}`}
    >
      {getSituationLabel(situation)}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string;
  value: string | number;
  icon: typeof ClipboardList;
  description: string;
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

export default function RecensementsPage() {
  const [recensements, setRecensements] = useState<
    Recensement[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const [situation, setSituation] = useState<
    SituationRecensement | "TOUS"
  >("TOUS");

  async function loadRecensements() {
    try {
      setLoading(true);
      setError(null);

      const data = await getRecensements();

      setRecensements(
        Array.isArray(data) ? data : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les recensements.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecensements();
  }, []);

  const filteredRecensements = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return recensements.filter((item) => {
      const matchesSituation =
        situation === "TOUS" ||
        item.situation === situation;

      if (!matchesSituation) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        item.parcelle?.reference,
        item.parcelle?.numero,
        item.parcelle?.bloc?.reference,
        item.parcelle?.terrain?.reference,
        item.parcelle?.terrain?.nom,
        item.occupantNom,
        item.occupantPrenom,
        item.famille?.nom,
        item.vendeurDonateurNom,
        item.vendeurDonateurPrenom,
        item.vendeurDonateurQualite,
        item.droitRevendique,
        item.observations,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch,
      );
    });
  }, [recensements, search, situation]);

  const statistiques = useMemo(() => {
    const total = recensements.length;

    const vendues = recensements.filter(
      (item) => item.situation === "VENDUE",
    ).length;

    const donnees = recensements.filter(
      (item) => item.situation === "DONNEE",
    ).length;

    const anarchiques = recensements.filter(
      (item) =>
        item.situation ===
        "PRISE_ANARCHIQUEMENT",
    ).length;

    const aVerifier = recensements.filter(
      (item) => item.situation === "A_VERIFIER",
    ).length;

    const cooperatifs = recensements.filter(
      (item) => item.cooperative,
    ).length;

    const nonCooperatifs = recensements.filter(
      (item) => !item.cooperative,
    ).length;

    return {
      total,
      vendues,
      donnees,
      anarchiques,
      aVerifier,
      cooperatifs,
      nonCooperatifs,
    };
  }, [recensements]);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="space-y-6 p-6 lg:p-8">
        {/* En-tête */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-3 text-white">
                <ClipboardList className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Recensements
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Constat des occupations et droits
                  déclarés sur les parcelles.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/recensements/rapports"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FileText className="h-4 w-4" />
              Rapports
            </Link>

            <Link
              href="/recensements/comparaison"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <GitCompare className="h-4 w-4" />
              Comparer avec LANDIS
            </Link>

            <Link
              href="/recensements/nouveau"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Nouveau recensement
            </Link>
          </div>
        </div>

        {/* Statistiques */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total"
            value={statistiques.total}
            icon={ClipboardList}
            description="Recensements enregistrés"
          />

          <StatCard
            label="Vendues"
            value={statistiques.vendues}
            icon={CheckCircle2}
            description="Situations déclarées vendues"
          />

          <StatCard
            label="Données"
            value={statistiques.donnees}
            icon={Handshake}
            description="Situations déclarées données"
          />

          <StatCard
            label="À vérifier"
            value={statistiques.aVerifier}
            icon={AlertTriangle}
            description="Situations nécessitant un contrôle"
          />
        </div>

        {/* Statistiques secondaires */}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <XCircle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Prises anarchiquement
                </p>

                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {statistiques.anarchiques}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Handshake className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Coopératifs
                </p>

                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {statistiques.cooperatifs}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Non coopératifs
                </p>

                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {statistiques.nonCooperatifs}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recherche / filtres */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Rechercher une parcelle, un occupant, une famille, un vendeur..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <select
              value={situation}
              onChange={(event) =>
                setSituation(
                  event.target.value as
                    | SituationRecensement
                    | "TOUS",
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              {SITUATIONS.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Erreur */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-medium">
                  Impossible de charger les recensements
                </p>

                <p className="mt-1">{error}</p>

                <button
                  type="button"
                  onClick={loadRecensements}
                  className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tableau */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Liste des recensements
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredRecensements.length} résultat
                {filteredRecensements.length > 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div className="text-xs text-slate-400">
              Les informations correspondent aux
              constatations de terrain.
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
                Chargement des recensements...
              </div>
            </div>
          ) : filteredRecensements.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
                <ClipboardList className="h-7 w-7" />
              </div>

              <h3 className="mt-4 font-medium text-slate-900">
                Aucun recensement trouvé
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Aucun recensement ne correspond aux
                critères de recherche actuels.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Parcelle
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Situation
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Occupant
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Famille / vendeur
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Montants
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Coopération
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRecensements.map(
                    (recensement) => {
                      const occupant = [
                        recensement.occupantPrenom,
                        recensement.occupantNom,
                      ]
                        .filter(Boolean)
                        .join(" ");

                      const vendeur = [
                        recensement.vendeurDonateurPrenom,
                        recensement.vendeurDonateurNom,
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <tr
                          key={recensement.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {recensement.parcelle
                                  ?.reference ||
                                  `Parcelle #${recensement.parcelleId}`}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {recensement.parcelle
                                  ?.numero
                                  ? `N° ${recensement.parcelle.numero}`
                                  : ""}

                                {recensement.parcelle
                                  ?.bloc?.reference
                                  ? ` · ${recensement.parcelle.bloc.reference}`
                                  : ""}
                              </p>

                              {recensement.parcelle
                                ?.terrain && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {
                                    recensement.parcelle
                                      .terrain.reference
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <SituationBadge
                              situation={
                                recensement.situation
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                                <UserRound className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {occupant ||
                                    "Non renseigné"}
                                </p>

                                {recensement.occupantTelephone && (
                                  <p className="text-xs text-slate-500">
                                    {
                                      recensement.occupantTelephone
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {recensement.famille ||
                            vendeur ? (
                              <div>
                                {recensement.famille && (
                                  <p className="text-sm font-medium text-slate-800">
                                    {
                                      recensement
                                        .famille
                                        .nom
                                    }
                                  </p>
                                )}

                                {vendeur && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {vendeur}

                                    {recensement.vendeurDonateurQualite
                                      ? ` · ${recensement.vendeurDonateurQualite}`
                                      : ""}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">
                                Non renseigné
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {recensement.montantTotal !=
                            null ? (
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {formatMoney(
                                    recensement.montantTotal,
                                  )}
                                </p>

                                {recensement.montantPaye !=
                                  null && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    Payé :{" "}
                                    {formatMoney(
                                      recensement.montantPaye,
                                    )}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {recensement.cooperative ? (
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

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {formatDate(
                              recensement.createdAt,
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/recensements/${recensement.id}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
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

        {/* Information métier */}

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <h3 className="font-medium text-blue-900">
                Principe du recensement
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Le recensement constitue un constat de
                terrain. Il permet d'enregistrer la
                situation déclarée par l'occupant, les
                informations relatives à la famille
                foncière, au vendeur ou donateur, ainsi
                que les pièces et personnes présentes.
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Il ne modifie pas automatiquement le
                statut commercial de la parcelle dans
                LANDIS. La comparaison avec les données
                LANDIS intervient séparément.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}