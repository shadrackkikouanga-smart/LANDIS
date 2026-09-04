"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  ShieldCheck,
  Plus,
  Phone,
  Mail,
  MapPin,
  UserRound,
  KeyRound,
  CircleCheck,
  CircleX,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getFamilleFonciere,
  deleteFamilleFonciere,
  createMembreFamille,
  updateMembreFamille,
  deleteMembreFamille,
  createDroitFamille,
  updateDroitFamille,
  deleteDroitFamille,
  type FamilleFonciere,
  type MembreFamilleFonciere,
  type DroitFamilleFonciere,
  type CreateMembreFamilleData,
  type UpdateMembreFamilleData,
  type CreateDroitFamilleData,
  type UpdateDroitFamilleData,
  type TypeDroitFamille,
} from "@/services/familles-foncieres.service";

export default function FamilleFonciereDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [famille, setFamille] =
    useState<FamilleFonciere | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showMembreForm, setShowMembreForm] =
    useState(false);

  const [showDroitForm, setShowDroitForm] =
    useState(false);

  const [editingMembre, setEditingMembre] =
    useState<MembreFamilleFonciere | null>(null);

  const [editingDroit, setEditingDroit] =
    useState<DroitFamilleFonciere | null>(null);

  async function loadFamille() {
    try {
      setLoading(true);
      setError("");

      const data = await getFamilleFonciere(id);

      setFamille(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger la famille foncière.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(id)) {
      loadFamille();
    }
  }, [id]);

  async function handleDeleteFamille() {
    if (!famille) {
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la famille « ${famille.nom} » ?\n\nCette opération supprimera également ses membres et ses droits associés.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteFamilleFonciere(famille.id);

      router.push("/familles-foncieres");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer la famille.",
      );
    }
  }

  async function handleDeleteMembre(
    membre: MembreFamilleFonciere,
  ) {
    const confirmed = window.confirm(
      `Voulez-vous supprimer le membre « ${membre.prenom} ${membre.nom} » ?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteMembreFamille(membre.id);

      await loadFamille();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le membre.",
      );
    }
  }

  async function handleDeleteDroit(
    droit: DroitFamilleFonciere,
  ) {
    const confirmed = window.confirm(
      "Voulez-vous supprimer ce droit ?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteDroitFamille(droit.id);

      await loadFamille();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le droit.",
      );
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-72 rounded-lg bg-slate-200" />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 rounded-xl bg-slate-200" />
            <div className="h-32 rounded-xl bg-slate-200" />
            <div className="h-32 rounded-xl bg-slate-200" />
          </div>

          <div className="h-64 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!famille) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />

            <p>
              Famille foncière introuvable.
            </p>
          </div>

          <Link
            href="/familles-foncieres"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium underline"
          >
            <ArrowLeft size={16} />
            Retour aux familles foncières
          </Link>
        </div>
      </div>
    );
  }

  const membres = famille.membres ?? [];
  const droits = famille.droits ?? [];

  const droitsActifs = droits.filter(
    (droit) => droit.actif,
  );

  const droitsVendre = droitsActifs.filter(
    (droit) => droit.type === "VENDRE",
  ).length;

  const droitsDonner = droitsActifs.filter(
    (droit) => droit.type === "DONNER",
  ).length;

  const droitsAutres = droitsActifs.filter(
    (droit) => droit.type === "AUTRE",
  ).length;

  return (
    <div className="p-6">
      {/* EN-TÊTE */}

      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <Link
            href="/familles-foncieres"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Retour aux familles foncières
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Users size={22} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {famille.nom}
                </h1>

                {famille.estPrincipale && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    PRINCIPALE
                  </span>
                )}

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    famille.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {famille.active
                    ? "ACTIVE"
                    : "INACTIVE"}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Gestion de la famille foncière et de
                ses droits
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/familles-foncieres/${famille.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Edit size={16} />
            Modifier
          </Link>

          <button
            type="button"
            onClick={handleDeleteFamille}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50"
          >
            <Trash2 size={16} />
            Supprimer
          </button>
        </div>
      </div>

      {/* ERREUR */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p>{error}</p>
        </div>
      )}

      {/* INFORMATIONS GENERALES */}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Terrain
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                {famille.terrain?.reference ??
                  `Terrain #${famille.terrainId}`}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <MapPin size={20} />
            </div>
          </div>

          {famille.terrain?.nom && (
            <p className="mt-2 text-xs text-slate-500">
              {famille.terrain.nom}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Membres
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {membres.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Droits actifs
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {droitsActifs.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <ShieldCheck size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}

      {famille.description && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Description
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {famille.description}
          </p>
        </div>
      )}

      {/* MEMBRES */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Membres de la famille
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Personnes appartenant à cette famille
              foncière
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingMembre(null);
              setShowMembreForm(true);
              setError("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <Plus size={16} />
            Ajouter un membre
          </button>
        </div>

        {membres.length === 0 ? (
          <div className="p-10 text-center">
            <Users
              size={32}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-700">
              Aucun membre enregistré
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Ajoutez les membres de cette famille
              foncière.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {membres.map((membre) => (
              <div
                key={membre.id}
                className="p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <UserRound size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {membre.prenom}{" "}
                        {membre.nom}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {membre.qualite}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        {membre.telephone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone size={13} />
                            {membre.telephone}
                          </span>
                        )}

                        {membre.email && (
                          <span className="inline-flex items-center gap-1.5">
                            <Mail size={13} />
                            {membre.email}
                          </span>
                        )}

                        {membre.adresse && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={13} />
                            {membre.adresse}
                          </span>
                        )}
                      </div>

                      {membre.observations && (
                        <p className="mt-3 text-sm text-slate-500">
                          {membre.observations}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMembre(membre);
                        setShowMembreForm(true);
                        setError("");
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Edit size={14} />
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteMembre(membre)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DROITS */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Droits de la famille
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Droits accordés aux membres pour vendre,
              donner ou exercer d'autres prérogatives
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingDroit(null);
              setShowDroitForm(true);
              setError("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <Plus size={16} />
            Ajouter un droit
          </button>
        </div>

        <div className="grid gap-4 border-b border-slate-200 p-5 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Vente
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {droitsVendre}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Donation
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {droitsDonner}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Autres
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {droitsAutres}
            </p>
          </div>
        </div>

        {droits.length === 0 ? (
          <div className="p-10 text-center">
            <KeyRound
              size={32}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-700">
              Aucun droit enregistré
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Ajoutez les droits accordés à la famille
              ou à ses membres.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {droits.map((droit) => (
              <div
                key={droit.id}
                className="p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <KeyRound size={18} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {droit.type}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            droit.actif
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {droit.actif ? (
                            <CircleCheck size={13} />
                          ) : (
                            <CircleX size={13} />
                          )}

                          {droit.actif
                            ? "Actif"
                            : "Inactif"}
                        </span>
                      </div>

                      {droit.membre && (
                        <p className="mt-2 text-sm text-slate-700">
                          <span className="font-medium">
                            Membre :
                          </span>{" "}
                          {droit.membre.prenom}{" "}
                          {droit.membre.nom}

                          {droit.membre.qualite && (
                            <span className="text-slate-500">
                              {" "}
                              —{" "}
                              {droit.membre.qualite}
                            </span>
                          )}
                        </p>
                      )}

                      {!droit.membre && (
                        <p className="mt-2 text-sm text-slate-600">
                          <span className="font-medium">
                            Bénéficiaire :
                          </span>{" "}
                          Toute la famille
                        </p>
                      )}

                      {droit.description && (
                        <p className="mt-2 text-sm text-slate-500">
                          {droit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDroit(droit);
                        setShowDroitForm(true);
                        setError("");
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Edit size={14} />
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteDroit(droit)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FORMULAIRE MEMBRE */}

      {showMembreForm && (
        <MembreForm
          familleId={famille.id}
          membre={editingMembre}
          onClose={() => {
            setShowMembreForm(false);
            setEditingMembre(null);
          }}
          onSaved={async () => {
            setShowMembreForm(false);
            setEditingMembre(null);
            await loadFamille();
          }}
          onError={setError}
        />
      )}

      {/* FORMULAIRE DROIT */}

      {showDroitForm && (
        <DroitForm
          familleId={famille.id}
          membres={membres}
          droit={editingDroit}
          onClose={() => {
            setShowDroitForm(false);
            setEditingDroit(null);
          }}
          onSaved={async () => {
            setShowDroitForm(false);
            setEditingDroit(null);
            await loadFamille();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

/* ============================================================
   FORMULAIRE MEMBRE
============================================================ */

interface MembreFormProps {
  familleId: number;
  membre: MembreFamilleFonciere | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (message: string) => void;
}

function MembreForm({
  familleId,
  membre,
  onClose,
  onSaved,
  onError,
}: MembreFormProps) {
  const [nom, setNom] = useState(
    membre?.nom ?? "",
  );

  const [prenom, setPrenom] = useState(
    membre?.prenom ?? "",
  );

  const [telephone, setTelephone] = useState(
    membre?.telephone ?? "",
  );

  const [email, setEmail] = useState(
    membre?.email ?? "",
  );

  const [adresse, setAdresse] = useState(
    membre?.adresse ?? "",
  );

  const [qualite, setQualite] = useState(
    membre?.qualite ?? "",
  );

  const [observations, setObservations] =
    useState(membre?.observations ?? "");

  const [saving, setSaving] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!nom.trim() || !prenom.trim()) {
      onError(
        "Le nom et le prénom du membre sont obligatoires.",
      );
      return;
    }

    if (!qualite.trim()) {
      onError(
        "La qualité du membre dans la famille est obligatoire.",
      );
      return;
    }

    try {
      setSaving(true);

      const data: CreateMembreFamilleData = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone:
          telephone.trim() || undefined,
        email: email.trim() || undefined,
        adresse: adresse.trim() || undefined,
        qualite: qualite.trim(),
        observations:
          observations.trim() || undefined,
      };

      if (membre) {
        const updateData: UpdateMembreFamilleData =
          data;

        await updateMembreFamille(
          membre.id,
          updateData,
        );
      } else {
        await createMembreFamille(
          familleId,
          data,
        );
      }

      await onSaved();
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer le membre.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {membre
              ? "Modifier le membre"
              : "Ajouter un membre"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Informations sur le membre de la famille
            foncière.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Prénom"
              value={prenom}
              onChange={setPrenom}
              required
            />

            <FormField
              label="Nom"
              value={nom}
              onChange={setNom}
              required
            />

            <FormField
              label="Qualité dans la famille"
              value={qualite}
              onChange={setQualite}
              placeholder="Ex. Fils, Oncle, Neveu..."
              required
            />

            <FormField
              label="Téléphone"
              value={telephone}
              onChange={setTelephone}
            />

            <FormField
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
            />

            <FormField
              label="Adresse"
              value={adresse}
              onChange={setAdresse}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Observations
            </label>

            <textarea
              value={observations}
              onChange={(event) =>
                setObservations(
                  event.target.value,
                )
              }
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {saving
                ? "Enregistrement..."
                : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   FORMULAIRE DROIT
============================================================ */

interface DroitFormProps {
  familleId: number;
  membres: MembreFamilleFonciere[];
  droit: DroitFamilleFonciere | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (message: string) => void;
}

function DroitForm({
  familleId,
  membres,
  droit,
  onClose,
  onSaved,
  onError,
}: DroitFormProps) {
  const [type, setType] =
    useState<TypeDroitFamille>(
      droit?.type ?? "VENDRE",
    );

  const [description, setDescription] =
    useState(droit?.description ?? "");

  const [actif, setActif] = useState(
    droit?.actif ?? true,
  );

  const [membreId, setMembreId] =
    useState<string>(
      droit?.membreId
        ? String(droit.membreId)
        : "",
    );

  const [saving, setSaving] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);

      const parsedMembreId = membreId
        ? Number(membreId)
        : undefined;

      if (droit) {
        const data: UpdateDroitFamilleData = {
          type,
          description:
            description.trim() || undefined,
          actif,
        };

        await updateDroitFamille(
          droit.id,
          data,
        );
      } else {
        const data: CreateDroitFamilleData = {
          type,
          description:
            description.trim() || undefined,
          membreId: parsedMembreId,
        };

        await createDroitFamille(
          familleId,
          data,
        );
      }

      await onSaved();
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer le droit.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {droit
              ? "Modifier le droit"
              : "Ajouter un droit"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Définissez le droit accordé à la famille
            ou à l'un de ses membres.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Type de droit
            </label>

            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target
                    .value as TypeDroitFamille,
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="VENDRE">
                Vendre
              </option>

              <option value="DONNER">
                Donner
              </option>

              <option value="AUTRE">
                Autre
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Membre concerné
            </label>

            <select
              value={membreId}
              onChange={(event) =>
                setMembreId(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">
                Toute la famille
              </option>

              {membres.map((membre) => (
                <option
                  key={membre.id}
                  value={membre.id}
                >
                  {membre.prenom} {membre.nom} —{" "}
                  {membre.qualite}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={4}
              placeholder="Précisez éventuellement l'étendue ou les conditions du droit..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3">
            <input
              type="checkbox"
              checked={actif}
              onChange={(event) =>
                setActif(event.target.checked)
              }
              className="h-4 w-4 rounded border-slate-300"
            />

            <span>
              <span className="block text-sm font-medium text-slate-700">
                Droit actif
              </span>

              <span className="block text-xs text-slate-500">
                Ce droit peut actuellement être
                utilisé.
              </span>
            </span>
          </label>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {saving
                ? "Enregistrement..."
                : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   CHAMP FORMULAIRE
============================================================ */

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}