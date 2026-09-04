"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardList,
  Handshake,
  Loader2,
  MapPin,
  Save,
  UserRound,
  Wallet,
} from "lucide-react";

import {
  getRecensement,
  updateRecensement,
  type Recensement,
  type SituationRecensement,
  type UpdateRecensementData,
} from "@/services/recensements.service";

function formatNumber(value: number | string | null | undefined): string {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return new Intl.NumberFormat("fr-FR").format(number);
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

function getSituationClasses(
  situation: SituationRecensement,
): string {
  switch (situation) {
    case "VENDUE":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "DONNEE":
      return "border-purple-200 bg-purple-50 text-purple-700";

    case "PRISE_ANARCHIQUEMENT":
      return "border-red-200 bg-red-50 text-red-700";

    case "A_VERIFIER":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "AUTRE":
      return "border-gray-200 bg-gray-50 text-gray-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function InputLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {children}

      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>
  );
}

function inputClassName(): string {
  return "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200";
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

export default function EditRecensementPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [recensement, setRecensement] =
    useState<Recensement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [situation, setSituation] =
    useState<SituationRecensement>("A_VERIFIER");

  const [occupantNom, setOccupantNom] = useState("");
  const [occupantPrenom, setOccupantPrenom] = useState("");
  const [occupantTelephone, setOccupantTelephone] = useState("");
  const [occupantAdresse, setOccupantAdresse] = useState("");

  const [vendeurDonateurNom, setVendeurDonateurNom] =
    useState("");

  const [vendeurDonateurPrenom, setVendeurDonateurPrenom] =
    useState("");

  const [vendeurDonateurQualite, setVendeurDonateurQualite] =
    useState("");

  const [montantTotal, setMontantTotal] = useState("");
  const [montantPaye, setMontantPaye] = useState("");

  const [droitRevendique, setDroitRevendique] =
    useState("");

  const [cooperative, setCooperative] = useState(true);

  const [observations, setObservations] = useState("");

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

        setSituation(data.situation);

        setOccupantNom(data.occupantNom ?? "");
        setOccupantPrenom(data.occupantPrenom ?? "");
        setOccupantTelephone(data.occupantTelephone ?? "");
        setOccupantAdresse(data.occupantAdresse ?? "");

        setVendeurDonateurNom(
          data.vendeurDonateurMembre?.nom ??
            data.vendeurDonateurNom ??
            "",
        );

        setVendeurDonateurPrenom(
          data.vendeurDonateurMembre?.prenom ??
            data.vendeurDonateurPrenom ??
            "",
        );

        setVendeurDonateurQualite(
          data.vendeurDonateurMembre?.qualite ??
            data.vendeurDonateurQualite ??
            "",
        );

        setMontantTotal(
          data.montantTotal !== null &&
            data.montantTotal !== undefined
            ? String(data.montantTotal)
            : "",
        );

        setMontantPaye(
          data.montantPaye !== null &&
            data.montantPaye !== undefined
            ? String(data.montantPaye)
            : "",
        );

        setDroitRevendique(
          data.droitRevendique ?? "",
        );

        setCooperative(data.cooperative);

        setObservations(
          data.observations ?? "",
        );
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

  const montantTotalNumber = useMemo(() => {
    const value = Number(montantTotal);

    return Number.isFinite(value) && value >= 0
      ? value
      : 0;
  }, [montantTotal]);

  const montantPayeNumber = useMemo(() => {
    const value = Number(montantPaye);

    return Number.isFinite(value) && value >= 0
      ? value
      : 0;
  }, [montantPaye]);

  const montantRestant = Math.max(
    montantTotalNumber - montantPayeNumber,
    0,
  );

  function validateForm(): string | null {
    if (!situation) {
      return "Veuillez sélectionner une situation.";
    }

    if (
      montantTotal !== "" &&
      (!Number.isFinite(Number(montantTotal)) ||
        Number(montantTotal) < 0)
    ) {
      return "Le montant total doit être un nombre positif ou nul.";
    }

    if (
      montantPaye !== "" &&
      (!Number.isFinite(Number(montantPaye)) ||
        Number(montantPaye) < 0)
    ) {
      return "Le montant payé doit être un nombre positif ou nul.";
    }

    if (
      montantTotal !== "" &&
      montantPaye !== "" &&
      Number(montantPaye) > Number(montantTotal)
    ) {
      return "Le montant payé ne peut pas être supérieur au montant total.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload: UpdateRecensementData = {
        situation,

        occupantNom:
          occupantNom.trim() !== ""
            ? occupantNom.trim()
            : undefined,

        occupantPrenom:
          occupantPrenom.trim() !== ""
            ? occupantPrenom.trim()
            : undefined,

        occupantTelephone:
          occupantTelephone.trim() !== ""
            ? occupantTelephone.trim()
            : undefined,

        occupantAdresse:
          occupantAdresse.trim() !== ""
            ? occupantAdresse.trim()
            : undefined,

        vendeurDonateurNom:
          vendeurDonateurNom.trim() !== ""
            ? vendeurDonateurNom.trim()
            : undefined,

        vendeurDonateurPrenom:
          vendeurDonateurPrenom.trim() !== ""
            ? vendeurDonateurPrenom.trim()
            : undefined,

        vendeurDonateurQualite:
          vendeurDonateurQualite.trim() !== ""
            ? vendeurDonateurQualite.trim()
            : undefined,

        montantTotal:
          montantTotal.trim() !== ""
            ? Number(montantTotal)
            : undefined,

        montantPaye:
          montantPaye.trim() !== ""
            ? Number(montantPaye)
            : undefined,

        droitRevendique:
          droitRevendique.trim() !== ""
            ? droitRevendique.trim()
            : undefined,

        cooperative,

        observations:
          observations.trim() !== ""
            ? observations.trim()
            : undefined,
      };

      await updateRecensement(id, payload);

      setSuccess(
        "Le recensement a été modifié avec succès.",
      );

      setTimeout(() => {
        router.push(`/recensements/${id}`);
      }, 700);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le recensement.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-10 w-72 animate-pulse rounded-lg bg-gray-200" />

          <div className="space-y-6">
            <div className="h-64 animate-pulse rounded-xl bg-white shadow-sm" />
            <div className="h-64 animate-pulse rounded-xl bg-white shadow-sm" />
            <div className="h-64 animate-pulse rounded-xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !recensement) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/recensements"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux recensements
          </Link>

          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

            <h1 className="mt-4 text-lg font-semibold text-gray-900">
              Impossible de charger le recensement
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!recensement) {
    return null;
  }

  const parcelle = recensement.parcelle;
  const bloc = parcelle?.bloc;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {/* En-tête */}
        <div className="mb-6">
          <Link
            href={`/recensements/${id}`}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au recensement
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
                <ClipboardList className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Modification du recensement #{recensement.id}
                </p>

                <h1 className="text-2xl font-bold text-gray-900">
                  {parcelle?.reference ||
                    "Parcelle inconnue"}
                </h1>
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${getSituationClasses(
                situation,
              )}`}
            >
              {getSituationLabel(situation)}
            </span>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Erreur
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Modification enregistrée
              </p>

              <p className="mt-1">
                {success}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Situation */}
          <div className="mb-6">
            <SectionCard
              title="Situation constatée"
              icon={
                <ClipboardList className="h-5 w-5" />
              }
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <InputLabel required>
                    Situation
                  </InputLabel>

                  <select
                    value={situation}
                    onChange={(event) =>
                      setSituation(
                        event.target
                          .value as SituationRecensement,
                      )
                    }
                    className={inputClassName()}
                  >
                    <option value="VENDUE">
                      Vendue
                    </option>

                    <option value="DONNEE">
                      Donnée
                    </option>

                    <option value="PRISE_ANARCHIQUEMENT">
                      Prise anarchiquement
                    </option>

                    <option value="A_VERIFIER">
                      À vérifier
                    </option>

                    <option value="AUTRE">
                      Autre
                    </option>
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Situation actuelle
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {getSituationLabel(situation)}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Parcelle */}
          <div className="mb-6">
            <SectionCard
              title="Parcelle concernée"
              icon={<MapPin className="h-5 w-5" />}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <InputLabel>
                    Référence de la parcelle
                  </InputLabel>

                  <input
                    type="text"
                    value={parcelle?.reference ?? ""}
                    readOnly
                    className={`${inputClassName()} cursor-not-allowed bg-gray-100`}
                  />
                </div>

                <div>
                  <InputLabel>
                    Superficie
                  </InputLabel>

                  <input
                    type="text"
                    value={
                      parcelle?.superficie !== undefined
                        ? `${formatNumber(
                            parcelle.superficie,
                          )} m²`
                        : ""
                    }
                    readOnly
                    className={`${inputClassName()} cursor-not-allowed bg-gray-100`}
                  />
                </div>

                <div>
                  <InputLabel>
                    Bloc
                  </InputLabel>

                  <input
                    type="text"
                    value={bloc?.reference ?? ""}
                    readOnly
                    className={`${inputClassName()} cursor-not-allowed bg-gray-100`}
                  />
                </div>

                <div>
                  <InputLabel>
                    Famille foncière
                  </InputLabel>

                  <input
                    type="text"
                    value={
                      recensement.famille?.nom ?? ""
                    }
                    readOnly
                    className={`${inputClassName()} cursor-not-allowed bg-gray-100`}
                  />
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                La localisation foncière n'est pas
                modifiée depuis cette page. Elle reste
                liée à la parcelle enregistrée dans
                LANDIS.
              </p>
            </SectionCard>
          </div>

          {/* Occupant */}
          <div className="mb-6">
            <SectionCard
              title="Occupant constaté"
              icon={<UserRound className="h-5 w-5" />}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <InputLabel>
                    Nom
                  </InputLabel>

                  <input
                    type="text"
                    value={occupantNom}
                    onChange={(event) =>
                      setOccupantNom(
                        event.target.value,
                      )
                    }
                    placeholder="Nom de l'occupant"
                    className={inputClassName()}
                  />
                </div>

                <div>
                  <InputLabel>
                    Prénom
                  </InputLabel>

                  <input
                    type="text"
                    value={occupantPrenom}
                    onChange={(event) =>
                      setOccupantPrenom(
                        event.target.value,
                      )
                    }
                    placeholder="Prénom de l'occupant"
                    className={inputClassName()}
                  />
                </div>

                <div>
                  <InputLabel>
                    Téléphone
                  </InputLabel>

                  <input
                    type="tel"
                    value={occupantTelephone}
                    onChange={(event) =>
                      setOccupantTelephone(
                        event.target.value,
                      )
                    }
                    placeholder="Téléphone"
                    className={inputClassName()}
                  />
                </div>

                <div>
                  <InputLabel>
                    Adresse
                  </InputLabel>

                  <input
                    type="text"
                    value={occupantAdresse}
                    onChange={(event) =>
                      setOccupantAdresse(
                        event.target.value,
                      )
                    }
                    placeholder="Adresse"
                    className={inputClassName()}
                  />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Vendeur / donateur */}
          <div className="mb-6">
            <SectionCard
              title={
                situation === "DONNEE"
                  ? "Donateur"
                  : situation === "VENDUE"
                    ? "Vendeur"
                    : "Vendeur / donateur"
              }
              icon={<Handshake className="h-5 w-5" />}
            >
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <InputLabel>
                    Nom
                  </InputLabel>

                  <input
                    type="text"
                    value={vendeurDonateurNom}
                    onChange={(event) =>
                      setVendeurDonateurNom(
                        event.target.value,
                      )
                    }
                    placeholder="Nom"
                    className={inputClassName()}
                  />
                </div>

                <div>
                  <InputLabel>
                    Prénom
                  </InputLabel>

                  <input
                    type="text"
                    value={vendeurDonateurPrenom}
                    onChange={(event) =>
                      setVendeurDonateurPrenom(
                        event.target.value,
                      )
                    }
                    placeholder="Prénom"
                    className={inputClassName()}
                  />
                </div>

                <div>
                  <InputLabel>
                    Qualité
                  </InputLabel>

                  <input
                    type="text"
                    value={vendeurDonateurQualite}
                    onChange={(event) =>
                      setVendeurDonateurQualite(
                        event.target.value,
                      )
                    }
                    placeholder="Ex. Fils, Oncle..."
                    className={inputClassName()}
                  />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Montants */}
          <div className="mb-6">
            <SectionCard
              title="Informations financières"
              icon={<Wallet className="h-5 w-5" />}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <InputLabel>
                    Montant total
                  </InputLabel>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={montantTotal}
                      onChange={(event) =>
                        setMontantTotal(
                          event.target.value,
                        )
                      }
                      placeholder="0"
                      className={`${inputClassName()} pr-16`}
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      FCFA
                    </span>
                  </div>
                </div>

                <div>
                  <InputLabel>
                    Montant payé
                  </InputLabel>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={montantPaye}
                      onChange={(event) =>
                        setMontantPaye(
                          event.target.value,
                        )
                      }
                      placeholder="0"
                      className={`${inputClassName()} pr-16`}
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Total
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {formatNumber(
                      montantTotalNumber,
                    )}{" "}
                    FCFA
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Payé
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {formatNumber(
                      montantPayeNumber,
                    )}{" "}
                    FCFA
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Reste
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {formatNumber(
                      montantRestant,
                    )}{" "}
                    FCFA
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Droit revendiqué */}
          <div className="mb-6">
            <SectionCard
              title="Droit revendiqué"
              icon={<Building2 className="h-5 w-5" />}
            >
              <InputLabel>
                Droit revendiqué sur la parcelle
              </InputLabel>

              <input
                type="text"
                value={droitRevendique}
                onChange={(event) =>
                  setDroitRevendique(
                    event.target.value,
                  )
                }
                placeholder="Ex. Droit coutumier"
                className={inputClassName()}
              />
            </SectionCard>
          </div>

          {/* Coopération */}
          <div className="mb-6">
            <SectionCard
              title="Coopération"
              icon={<CheckCircle2 className="h-5 w-5" />}
            >
              <button
                type="button"
                onClick={() =>
                  setCooperative(!cooperative)
                }
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                  cooperative
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      cooperative
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {cooperative ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {cooperative
                        ? "Personne coopérative"
                        : "Personne non coopérative"}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Cliquez pour modifier l'état de
                      coopération.
                    </p>
                  </div>
                </div>

                <div
                  className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                    cooperative
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      cooperative
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </SectionCard>
          </div>

          {/* Observations */}
          <div className="mb-6">
            <SectionCard
              title="Observations"
              icon={
                <ClipboardList className="h-5 w-5" />
              }
            >
              <InputLabel>
                Observations
              </InputLabel>

              <textarea
                value={observations}
                onChange={(event) =>
                  setObservations(
                    event.target.value,
                  )
                }
                placeholder="Saisissez les observations relatives au constat..."
                rows={6}
                className={inputClassName()}
              />
            </SectionCard>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 z-10 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
            <div className="mx-auto flex max-w-6xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/recensements/${id}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Annuler
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}