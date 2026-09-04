"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Home,
  MapPin,
  Users,
  UserRound,
  Wallet,
  AlertCircle,
  Landmark,
  Handshake,
  Pencil,
} from "lucide-react";

import {
  getRecensement,
  type Recensement,
  type SituationRecensement,
} from "@/services/recensements.service";

function formatNumber(value: number | string | null | undefined): string {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return new Intl.NumberFormat("fr-FR").format(number);
}

function formatDate(value: string | null | undefined): string {
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

function getSituationLabel(situation: SituationRecensement): string {
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

function getSituationClasses(situation: SituationRecensement): string {
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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 py-3 last:border-b-0">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>

      <span className="text-sm font-medium text-gray-900">
        {value || "—"}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
          {icon}
        </div>

        <h2 className="text-base font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

export default function RecensementDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [recensement, setRecensement] = useState<Recensement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecensement() {
      if (!Number.isInteger(id) || id <= 0) {
        setError("Identifiant de recensement invalide.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getRecensement(id);

        setRecensement(data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger le recensement.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadRecensement();
  }, [id]);

  const montantTotal = useMemo(() => {
    return Number(recensement?.montantTotal ?? 0);
  }, [recensement]);

  const montantPaye = useMemo(() => {
    return Number(recensement?.montantPaye ?? 0);
  }, [recensement]);

  const montantRestant = Math.max(montantTotal - montantPaye, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 h-10 w-64 animate-pulse rounded-lg bg-gray-200" />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-xl bg-white shadow-sm lg:col-span-2" />

            <div className="h-64 animate-pulse rounded-xl bg-white shadow-sm" />

            <div className="h-64 animate-pulse rounded-xl bg-white shadow-sm lg:col-span-3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !recensement) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/recensements"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux recensements
          </Link>

          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h1 className="text-lg font-semibold text-gray-900">
              Recensement introuvable
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {error || "Le recensement demandé n'existe pas."}
            </p>

            <Link
              href="/recensements"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const parcelle = recensement.parcelle;
  const bloc = parcelle?.bloc;

  const famille = recensement.famille;
  const vendeurDonateur = recensement.vendeurDonateurMembre;

  const documents = recensement.documents ?? [];
  const signataires = recensement.signataires ?? [];
  const autorites = recensement.autorites ?? [];

  const occupantNom = [
    recensement.occupantPrenom,
    recensement.occupantNom,
  ]
    .filter(Boolean)
    .join(" ");

  const vendeurDonateurNom = [
    vendeurDonateur?.prenom ?? recensement.vendeurDonateurPrenom,
    vendeurDonateur?.nom ?? recensement.vendeurDonateurNom,
  ]
    .filter(Boolean)
    .join(" ");

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
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
                  <ClipboardList className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Recensement #{recensement.id}
                  </p>

                  <h1 className="text-2xl font-bold text-gray-900">
                    {parcelle?.reference || "Parcelle inconnue"}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${getSituationClasses(
                  recensement.situation,
                )}`}
              >
                {getSituationLabel(recensement.situation)}
              </span>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                  recensement.cooperative
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {recensement.cooperative ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}

                {recensement.cooperative
                  ? "Personne coopérative"
                  : "Personne non coopérative"}
              </span>

              {/* Modifier */}
              <Link
                href={`/recensements/${recensement.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </Link>
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionCard
              title="Localisation de la parcelle"
              icon={<MapPin className="h-5 w-5" />}
            >
              <div className="grid gap-x-8 md:grid-cols-2">
                <InfoRow
                  label="Parcelle"
                  value={parcelle?.reference}
                />

                <InfoRow
                  label="Superficie"
                  value={
                    parcelle?.superficie !== undefined
                      ? `${formatNumber(parcelle.superficie)} m²`
                      : "—"
                  }
                />

                <InfoRow
                  label="Bloc"
                  value={bloc?.reference}
                />

                <InfoRow
                  label="Superficie du bloc"
                  value={
                    bloc?.superficie !== undefined
                      ? `${formatNumber(bloc.superficie)} m²`
                      : "—"
                  }
                />

                <div className="md:col-span-2">
                  <InfoRow
                    label="Situation recensée"
                    value={getSituationLabel(recensement.situation)}
                  />
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="Informations du constat"
            icon={<CalendarDays className="h-5 w-5" />}
          >
            <InfoRow
              label="Date du recensement"
              value={formatDate(recensement.createdAt)}
            />

            <InfoRow
              label="Dernière modification"
              value={formatDate(recensement.updatedAt)}
            />

            <InfoRow
              label="Coopération"
              value={
                recensement.cooperative
                  ? "Coopérative"
                  : "Non coopérative"
              }
            />
          </SectionCard>
        </div>

        {/* Occupant + famille */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Occupant constaté"
            icon={<UserRound className="h-5 w-5" />}
          >
            <div className="grid gap-x-8 md:grid-cols-2">
              <InfoRow
                label="Nom et prénom"
                value={occupantNom || "Non renseigné"}
              />

              <InfoRow
                label="Téléphone"
                value={recensement.occupantTelephone}
              />

              <div className="md:col-span-2">
                <InfoRow
                  label="Adresse"
                  value={recensement.occupantAdresse}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Famille foncière"
            icon={<Users className="h-5 w-5" />}
          >
            <div className="grid gap-x-8 md:grid-cols-2">
              <InfoRow
                label="Famille"
                value={famille?.nom}
              />

              <InfoRow
                label="Famille principale"
                value={
                  famille?.estPrincipale === true
                    ? "Oui"
                    : famille
                      ? "Non"
                      : "—"
                }
              />

              <div className="md:col-span-2">
                <InfoRow
                  label="Description"
                  value={famille?.description}
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Vendeur / donateur */}
        <SectionCard
          title={
            recensement.situation === "DONNEE"
              ? "Donateur"
              : recensement.situation === "VENDUE"
                ? "Vendeur"
                : "Vendeur / donateur"
          }
          icon={<Handshake className="h-5 w-5" />}
        >
          <div className="grid gap-x-8 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label="Nom et prénom"
              value={vendeurDonateurNom}
            />

            <InfoRow
              label="Qualité"
              value={
                vendeurDonateur?.qualite ||
                recensement.vendeurDonateurQualite
              }
            />

            <InfoRow
              label="Famille foncière"
              value={famille?.nom}
            />

            {recensement.droitRevendique && (
              <div className="lg:col-span-3">
                <InfoRow
                  label="Droit revendiqué"
                  value={recensement.droitRevendique}
                />
              </div>
            )}
          </div>
        </SectionCard>

        {/* Montants */}
        {(montantTotal > 0 || montantPaye > 0) && (
          <div className="my-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Wallet className="h-5 w-5" />
                </div>

                <span className="text-sm font-medium text-gray-500">
                  Montant total
                </span>
              </div>

              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(montantTotal)}
              </p>

              <p className="mt-1 text-xs text-gray-500">FCFA</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <span className="text-sm font-medium text-gray-500">
                  Montant payé
                </span>
              </div>

              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(montantPaye)}
              </p>

              <p className="mt-1 text-xs text-gray-500">FCFA</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <AlertCircle className="h-5 w-5" />
                </div>

                <span className="text-sm font-medium text-gray-500">
                  Reste à payer
                </span>
              </div>

              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(montantRestant)}
              </p>

              <p className="mt-1 text-xs text-gray-500">FCFA</p>
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="my-6">
          <SectionCard
            title={`Pièces / documents (${documents.length})`}
            icon={<FileText className="h-5 w-5" />}
          >
            {documents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-gray-400" />

                <p className="mt-2 text-sm font-medium text-gray-600">
                  Aucun document enregistré
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="text-left">
                      <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Type
                      </th>

                      <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Référence
                      </th>

                      <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>

                      <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Observations
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {documents.map((document) => (
                      <tr key={document.id}>
                        <td className="px-3 py-3 text-sm font-medium text-gray-900">
                          {document.typeDocument}
                        </td>

                        <td className="px-3 py-3 text-sm text-gray-600">
                          {document.reference || "—"}
                        </td>

                        <td className="px-3 py-3 text-sm text-gray-600">
                          {formatDate(document.dateDocument)}
                        </td>

                        <td className="px-3 py-3 text-sm text-gray-600">
                          {document.observations || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Signataires */}
        <div className="mb-6">
          <SectionCard
            title={`Signataires (${signataires.length})`}
            icon={<Users className="h-5 w-5" />}
          >
            {signataires.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                <Users className="mx-auto h-8 w-8 text-gray-400" />

                <p className="mt-2 text-sm font-medium text-gray-600">
                  Aucun signataire enregistré
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {signataires.map((signataire) => (
                  <div
                    key={signataire.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                        <UserRound className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {[signataire.prenom, signataire.nom]
                            .filter(Boolean)
                            .join(" ")}
                        </p>

                        {signataire.qualite && (
                          <p className="mt-1 text-sm text-gray-600">
                            {signataire.qualite}
                          </p>
                        )}

                        {signataire.fonction && (
                          <p className="text-sm text-gray-500">
                            {signataire.fonction}
                          </p>
                        )}
                      </div>
                    </div>

                    {signataire.observations && (
                      <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
                        {signataire.observations}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Autorités de l'État */}
        <div className="mb-6">
          <SectionCard
            title={`Autorités de l'État (${autorites.length})`}
            icon={<Landmark className="h-5 w-5" />}
          >
            {autorites.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                <Landmark className="mx-auto h-8 w-8 text-gray-400" />

                <p className="mt-2 text-sm font-medium text-gray-600">
                  Aucune autorité enregistrée
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {autorites.map((autorite) => (
                  <div
                    key={autorite.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                        <Landmark className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {[autorite.prenom, autorite.nom]
                            .filter(Boolean)
                            .join(" ")}
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {autorite.fonction}
                        </p>

                        {autorite.institution && (
                          <p className="text-sm text-gray-500">
                            {autorite.institution}
                          </p>
                        )}

                        {autorite.telephone && (
                          <p className="mt-1 text-sm text-gray-500">
                            {autorite.telephone}
                          </p>
                        )}
                      </div>
                    </div>

                    {autorite.observations && (
                      <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
                        {autorite.observations}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Observations */}
        <div className="mb-6">
          <SectionCard
            title="Observations"
            icon={<ClipboardList className="h-5 w-5" />}
          >
            {recensement.observations ? (
              <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                {recensement.observations}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Aucune observation enregistrée.
              </p>
            )}
          </SectionCard>
        </div>

        {/* Récapitulatif */}
        <div className="mb-6">
          <SectionCard
            title="Récapitulatif du constat"
            icon={<Building2 className="h-5 w-5" />}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Parcelle
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  {parcelle?.reference || "—"}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Situation
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  {getSituationLabel(recensement.situation)}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Documents
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  {documents.length}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Signataires
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  {signataires.length}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Pied de page */}
        <div className="flex items-center justify-between border-t border-gray-200 py-5">
          <Link
            href="/recensements"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux recensements
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Home className="h-3.5 w-3.5" />
            LANDIS · Recensement foncier
          </div>
        </div>
      </div>
    </div>
  );
}