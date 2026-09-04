"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  FileText,
  Handshake,
  MapPin,
  Plus,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  createRecensement,
  type CreateRecensementAutoriteData,
  type CreateRecensementDocumentData,
  type CreateRecensementSignataireData,
  type SituationRecensement,
} from "@/services/recensements.service";

import {
  getFamillesFoncieresByTerrain,
  getFamilleFonciere,
  type FamilleFonciere,
  type MembreFamilleFonciere,
} from "@/services/familles-foncieres.service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

const situations: Array<{
  value: SituationRecensement;
  label: string;
  description: string;
}> = [
  {
    value: "VENDUE",
    label: "Vendue",
    description:
      "L'occupant déclare avoir acquis la parcelle.",
  },
  {
    value: "DONNEE",
    label: "Donnée",
    description:
      "L'occupant déclare avoir reçu la parcelle.",
  },
  {
    value: "PRISE_ANARCHIQUEMENT",
    label: "Prise anarchiquement",
    description:
      "Occupation sans vente ou donation reconnue.",
  },
  {
    value: "A_VERIFIER",
    label: "À vérifier",
    description:
      "La situation nécessite des vérifications complémentaires.",
  },
  {
    value: "AUTRE",
    label: "Autre",
    description:
      "Une situation qui ne correspond pas aux autres catégories.",
  },
];

interface TerrainApi {
  id: number;
  reference: string;
  nom: string;
  superficie: number;
}

interface SectionApi {
  id: number;
  reference: string;
  nom?: string | null;
  terrain?: TerrainApi | null;
}

interface BlocApi {
  id: number;
  reference: string;
  superficie: number;
  section?: SectionApi | null;
}

interface ParcelleApi {
  id: number;
  reference: string;
  numero: string;
  superficie: number;
  statut: string;
  bloc?: BlocApi | null;
}

interface DocumentForm extends CreateRecensementDocumentData {
  localId: string;
}

interface SignataireForm extends CreateRecensementSignataireData {
  localId: string;
}

interface AutoriteForm extends CreateRecensementAutoriteData {
  localId: string;
}

function createLocalId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

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

function InputLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
    />
  );
}

export default function NouveauRecensementPage() {
  const [parcelles, setParcelles] = useState<
    ParcelleApi[]
  >([]);

  const [familles, setFamilles] = useState<
    FamilleFonciere[]
  >([]);

  const [membres, setMembres] = useState<
    MembreFamilleFonciere[]
  >([]);

  const [selectedParcelleId, setSelectedParcelleId] =
    useState("");

  const [situation, setSituation] =
    useState<SituationRecensement>("VENDUE");

  const [occupantNom, setOccupantNom] = useState("");
  const [occupantPrenom, setOccupantPrenom] =
    useState("");
  const [occupantTelephone, setOccupantTelephone] =
    useState("");
  const [occupantAdresse, setOccupantAdresse] =
    useState("");

  const [familleId, setFamilleId] = useState("");

  const [
    vendeurDonateurMembreId,
    setVendeurDonateurMembreId,
  ] = useState("");

  const [
    vendeurDonateurNom,
    setVendeurDonateurNom,
  ] = useState("");

  const [
    vendeurDonateurPrenom,
    setVendeurDonateurPrenom,
  ] = useState("");

  const [
    vendeurDonateurQualite,
    setVendeurDonateurQualite,
  ] = useState("");

  const [montantTotal, setMontantTotal] =
    useState("");

  const [montantPaye, setMontantPaye] =
    useState("");

  const [droitRevendique, setDroitRevendique] =
    useState("");

  const [cooperative, setCooperative] =
    useState(true);

  const [observations, setObservations] =
    useState("");

  const [documents, setDocuments] = useState<
    DocumentForm[]
  >([]);

  const [signataires, setSignataires] = useState<
    SignataireForm[]
  >([]);

  const [autorites, setAutorites] = useState<
    AutoriteForm[]
  >([]);

  const [loadingParcelles, setLoadingParcelles] =
    useState(true);

  const [loadingFamilles, setLoadingFamilles] =
    useState(false);

  const [loadingMembres, setLoadingMembres] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [success, setSuccess] = useState(false);

  const selectedParcelle = useMemo(
    () =>
      parcelles.find(
        (parcelle) =>
          parcelle.id ===
          Number(selectedParcelleId),
      ) ?? null,
    [parcelles, selectedParcelleId],
  );

  const selectedFamille = useMemo(
    () =>
      familles.find(
        (famille) =>
          famille.id === Number(familleId),
      ) ?? null,
    [familles, familleId],
  );

  const selectedMembre = useMemo(
    () =>
      membres.find(
        (membre) =>
          membre.id ===
          Number(vendeurDonateurMembreId),
      ) ?? null,
    [membres, vendeurDonateurMembreId],
  );

  /*
   * IMPORTANT :
   *
   * La réponse de /parcelles suit maintenant :
   *
   * parcelle
   *   -> bloc
   *      -> section
   *         -> terrain
   *
   * Le terrain n'est donc PAS directement dans
   * selectedParcelle.terrain.
   */
  const selectedTerrain =
    selectedParcelle?.bloc?.section?.terrain ??
    null;

  const selectedTerrainId =
    selectedTerrain?.id ?? null;

  async function loadParcelles() {
    try {
      setLoadingParcelles(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/parcelles`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
            `Erreur HTTP ${response.status}`,
        );
      }

      const data = await response.json();

      const normalized: ParcelleApi[] =
        Array.isArray(data) ? data : [];

      setParcelles(normalized);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les parcelles.",
      );
    } finally {
      setLoadingParcelles(false);
    }
  }

  async function loadFamilles(
    terrainId: number,
  ) {
    try {
      setLoadingFamilles(true);
      setError(null);

      const data =
        await getFamillesFoncieresByTerrain(
          terrainId,
        );

      setFamilles(
        Array.isArray(data) ? data : [],
      );
    } catch (err) {
      setFamilles([]);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les familles foncières.",
      );
    } finally {
      setLoadingFamilles(false);
    }
  }

  async function loadMembres(id: number) {
    try {
      setLoadingMembres(true);
      setError(null);

      const famille =
        await getFamilleFonciere(id);

      setMembres(
        Array.isArray(famille.membres)
          ? famille.membres
          : [],
      );
    } catch (err) {
      setMembres([]);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les membres de la famille.",
      );
    } finally {
      setLoadingMembres(false);
    }
  }

  useEffect(() => {
    loadParcelles();
  }, []);

  /*
   * Quand la parcelle change :
   *
   * 1. on vide la famille précédente ;
   * 2. on vide le membre précédent ;
   * 3. on récupère le terrain via :
   *    parcelle -> bloc -> section -> terrain ;
   * 4. on charge les familles de ce terrain.
   */
  useEffect(() => {
    setFamilleId("");
    setVendeurDonateurMembreId("");
    setFamilles([]);
    setMembres([]);

    if (!selectedTerrainId) {
      setLoadingFamilles(false);
      return;
    }

    loadFamilles(selectedTerrainId);
  }, [selectedTerrainId]);

  /*
   * Quand la famille change :
   *
   * 1. on vide le membre précédent ;
   * 2. on charge les membres de la famille sélectionnée.
   */
  useEffect(() => {
    setVendeurDonateurMembreId("");
    setMembres([]);

    if (!familleId) {
      setLoadingMembres(false);
      return;
    }

    loadMembres(Number(familleId));
  }, [familleId]);

  /*
   * Quand un membre est sélectionné, ses informations
   * remplissent automatiquement les champs vendeur/donateur.
   */
  useEffect(() => {
    if (!selectedMembre) {
      return;
    }

    setVendeurDonateurNom(
      selectedMembre.nom,
    );

    setVendeurDonateurPrenom(
      selectedMembre.prenom,
    );

    setVendeurDonateurQualite(
      selectedMembre.qualite,
    );
  }, [selectedMembre]);

  function addDocument() {
    setDocuments((current) => [
      ...current,
      {
        localId: createLocalId(),
        typeDocument: "",
        reference: "",
        dateDocument: "",
        observations: "",
      },
    ]);
  }

  function removeDocument(
    localId: string,
  ) {
    setDocuments((current) =>
      current.filter(
        (document) =>
          document.localId !== localId,
      ),
    );
  }

  function updateDocument(
    localId: string,
    field: keyof CreateRecensementDocumentData,
    value: string,
  ) {
    setDocuments((current) =>
      current.map((document) =>
        document.localId === localId
          ? {
              ...document,
              [field]: value,
            }
          : document,
      ),
    );
  }

  function addSignataire() {
    setSignataires((current) => [
      ...current,
      {
        localId: createLocalId(),
        nom: "",
        prenom: "",
        qualite: "",
        fonction: "",
        observations: "",
      },
    ]);
  }

  function removeSignataire(
    localId: string,
  ) {
    setSignataires((current) =>
      current.filter(
        (signataire) =>
          signataire.localId !== localId,
      ),
    );
  }

  function updateSignataire(
    localId: string,
    field: keyof CreateRecensementSignataireData,
    value: string,
  ) {
    setSignataires((current) =>
      current.map((signataire) =>
        signataire.localId === localId
          ? {
              ...signataire,
              [field]: value,
            }
          : signataire,
      ),
    );
  }

  function addAutorite() {
    setAutorites((current) => [
      ...current,
      {
        localId: createLocalId(),
        nom: "",
        prenom: "",
        fonction: "",
        institution: "",
        telephone: "",
        observations: "",
      },
    ]);
  }

  function removeAutorite(
    localId: string,
  ) {
    setAutorites((current) =>
      current.filter(
        (autorite) =>
          autorite.localId !== localId,
      ),
    );
  }

  function updateAutorite(
    localId: string,
    field: keyof CreateRecensementAutoriteData,
    value: string,
  ) {
    setAutorites((current) =>
      current.map((autorite) =>
        autorite.localId === localId
          ? {
              ...autorite,
              [field]: value,
            }
          : autorite,
      ),
    );
  }

  function validateForm() {
    if (!selectedParcelleId) {
      return "Veuillez sélectionner une parcelle.";
    }

    if (!occupantNom.trim()) {
      return "Le nom de l'occupant est obligatoire.";
    }

    if (!occupantPrenom.trim()) {
      return "Le prénom de l'occupant est obligatoire.";
    }

    if (
      situation === "VENDUE" ||
      situation === "DONNEE"
    ) {
      if (!familleId) {
        return "Veuillez sélectionner la famille foncière concernée.";
      }

      if (!vendeurDonateurNom.trim()) {
        return "Le nom du vendeur ou donateur est obligatoire.";
      }

      if (!vendeurDonateurPrenom.trim()) {
        return "Le prénom du vendeur ou donateur est obligatoire.";
      }

      if (!vendeurDonateurQualite.trim()) {
        return "La qualité du vendeur ou donateur est obligatoire.";
      }
    }

    if (
      situation === "PRISE_ANARCHIQUEMENT"
    ) {
      if (!droitRevendique.trim()) {
        return "Veuillez préciser le droit revendiqué.";
      }
    }

    const total = Number(montantTotal);
    const paye = Number(montantPaye);

    if (
      montantTotal &&
      (!Number.isFinite(total) || total < 0)
    ) {
      return "Le montant total est invalide.";
    }

    if (
      montantPaye &&
      (!Number.isFinite(paye) || paye < 0)
    ) {
      return "Le montant payé est invalide.";
    }

    if (
      montantTotal &&
      montantPaye &&
      paye > total
    ) {
      return "Le montant payé ne peut pas être supérieur au montant total.";
    }

    for (const document of documents) {
      if (!document.typeDocument.trim()) {
        return "Chaque document doit avoir un type.";
      }
    }

    for (const signataire of signataires) {
      if (
        !signataire.nom.trim() ||
        !signataire.prenom.trim()
      ) {
        return "Chaque signataire doit avoir un nom et un prénom.";
      }
    }

    for (const autorite of autorites) {
      if (
        !autorite.nom.trim() ||
        !autorite.fonction.trim()
      ) {
        return "Chaque autorité doit avoir un nom et une fonction.";
      }
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSaving(true);

      const data = {
        parcelleId: Number(
          selectedParcelleId,
        ),

        situation,

        occupantNom:
          occupantNom.trim() || undefined,

        occupantPrenom:
          occupantPrenom.trim() ||
          undefined,

        occupantTelephone:
          occupantTelephone.trim() ||
          undefined,

        occupantAdresse:
          occupantAdresse.trim() ||
          undefined,

        familleId:
          familleId &&
          Number(familleId) > 0
            ? Number(familleId)
            : undefined,

        vendeurDonateurNom:
          vendeurDonateurNom.trim() ||
          undefined,

        vendeurDonateurPrenom:
          vendeurDonateurPrenom.trim() ||
          undefined,

        vendeurDonateurMembreId:
          vendeurDonateurMembreId &&
          Number(
            vendeurDonateurMembreId,
          ) > 0
            ? Number(
                vendeurDonateurMembreId,
              )
            : undefined,

        vendeurDonateurQualite:
          vendeurDonateurQualite.trim() ||
          undefined,

        montantTotal:
          montantTotal !== ""
            ? Number(montantTotal)
            : undefined,

        montantPaye:
          montantPaye !== ""
            ? Number(montantPaye)
            : undefined,

        droitRevendique:
          droitRevendique.trim() ||
          undefined,

        cooperative,

        observations:
          observations.trim() ||
          undefined,

        documents: documents.map(
          ({
            localId: _localId,
            ...document
          }) => ({
            ...document,

            reference:
              document.reference?.trim() ||
              undefined,

            dateDocument:
              document.dateDocument ||
              undefined,

            observations:
              document.observations?.trim() ||
              undefined,
          }),
        ),

        signataires: signataires.map(
          ({
            localId: _localId,
            ...signataire
          }) => ({
            ...signataire,

            nom:
              signataire.nom.trim(),

            prenom:
              signataire.prenom.trim(),

            qualite:
              signataire.qualite?.trim() ||
              undefined,

            fonction:
              signataire.fonction?.trim() ||
              undefined,

            observations:
              signataire.observations?.trim() ||
              undefined,
          }),
        ),

        autorites: autorites.map(
          ({
            localId: _localId,
            ...autorite
          }) => ({
            ...autorite,

            nom:
              autorite.nom.trim(),

            prenom:
              autorite.prenom?.trim() ||
              undefined,

            fonction:
              autorite.fonction.trim(),

            institution:
              autorite.institution?.trim() ||
              undefined,

            telephone:
              autorite.telephone?.trim() ||
              undefined,

            observations:
              autorite.observations?.trim() ||
              undefined,
          }),
        ),
      };

      await createRecensement(data);

      setSuccess(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer le recensement.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6 lg:p-8"
      >
        {/* En-tête */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/recensements"
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux recensements
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-3 text-white">
                <ClipboardIcon />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Nouveau recensement
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Enregistrer une constatation de terrain
                  concernant une parcelle.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Enregistrement...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Enregistrer le recensement
              </>
            )}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="font-medium text-red-900">
                  Vérification nécessaire
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="font-medium text-emerald-900">
                  Recensement enregistré
                </p>

                <p className="mt-1 text-sm text-emerald-700">
                  Le constat de terrain a été enregistré
                  avec ses informations associées.
                </p>

                <Link
                  href="/recensements"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Voir les recensements
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Parcelle */}
        <SectionCard
          icon={MapPin}
          title="Parcelle concernée"
          description="Sélectionnez la parcelle faisant l'objet du constat."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <InputLabel required>
                Parcelle
              </InputLabel>

              <select
                value={selectedParcelleId}
                onChange={(event) =>
                  setSelectedParcelleId(
                    event.target.value,
                  )
                }
                disabled={loadingParcelles}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
              >
                <option value="">
                  {loadingParcelles
                    ? "Chargement des parcelles..."
                    : "Sélectionner une parcelle"}
                </option>

                {parcelles.map(
                  (parcelle) => (
                    <option
                      key={parcelle.id}
                      value={parcelle.id}
                    >
                      {parcelle.reference}
                      {parcelle.numero
                        ? ` — N° ${parcelle.numero}`
                        : ""}
                    </option>
                  ),
                )}
              </select>
            </div>

            {selectedParcelle && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">
                      Référence
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {
                        selectedParcelle.reference
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Superficie
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {formatNumber(
                        selectedParcelle.superficie,
                      )}{" "}
                      m²
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Bloc
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedParcelle.bloc
                        ?.reference || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Terrain
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedTerrain
                        ? `${selectedTerrain.reference} — ${selectedTerrain.nom}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Situation */}
        <SectionCard
          icon={AlertTriangle}
          title="Situation constatée"
          description="Indiquez ce qui a été constaté sur le terrain. Cette information ne modifie pas automatiquement le statut LANDIS."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {situations.map((item) => {
              const selected =
                situation === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setSituation(item.value)
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {item.label}
                    </span>

                    {selected && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>

                  <p
                    className={`mt-2 text-xs leading-5 ${
                      selected
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Occupant */}
        <SectionCard
          icon={UserRound}
          title="Occupant"
          description="Personne rencontrée ou occupant constaté sur la parcelle."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <InputLabel required>
                Nom
              </InputLabel>

              <TextInput
                value={occupantNom}
                onChange={setOccupantNom}
                placeholder="Nom de l'occupant"
              />
            </div>

            <div>
              <InputLabel required>
                Prénom
              </InputLabel>

              <TextInput
                value={occupantPrenom}
                onChange={setOccupantPrenom}
                placeholder="Prénom de l'occupant"
              />
            </div>

            <div>
              <InputLabel>
                Téléphone
              </InputLabel>

              <TextInput
                value={occupantTelephone}
                onChange={
                  setOccupantTelephone
                }
                placeholder="Téléphone"
              />
            </div>

            <div>
              <InputLabel>
                Adresse
              </InputLabel>

              <TextInput
                value={occupantAdresse}
                onChange={
                  setOccupantAdresse
                }
                placeholder="Adresse de l'occupant"
              />
            </div>
          </div>
        </SectionCard>

        {/* Famille / vendeur */}
        {(situation === "VENDUE" ||
          situation === "DONNEE") && (
          <SectionCard
            icon={Users}
            title={
              situation === "VENDUE"
                ? "Famille foncière et vendeur"
                : "Famille foncière et donateur"
            }
            description="Rattachez la déclaration à la famille foncière et, si possible, à son membre."
          >
            <div className="space-y-5">
              <div>
                <InputLabel required>
                  Famille foncière
                </InputLabel>

                <select
                  value={familleId}
                  onChange={(event) => {
                    setError(null);
                    setFamilleId(
                      event.target.value,
                    );
                  }}
                  disabled={
                    loadingFamilles ||
                    !selectedTerrainId
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                >
                  <option value="">
                    {loadingFamilles
                      ? "Chargement des familles..."
                      : !selectedTerrainId
                        ? "Sélectionnez d'abord une parcelle"
                        : familles.length === 0
                          ? "Aucune famille pour ce terrain"
                          : "Sélectionner une famille"}
                  </option>

                  {familles
                    .filter(
                      (famille) =>
                        famille.active,
                    )
                    .map(
                      (famille) => (
                        <option
                          key={famille.id}
                          value={famille.id}
                        >
                          {famille.nom}
                          {famille.estPrincipale
                            ? " — principale"
                            : ""}
                        </option>
                      ),
                    )}
                </select>
              </div>

              {selectedFamille && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">
                    {selectedFamille.nom}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Famille{" "}
                    {selectedFamille.estPrincipale
                      ? "principale"
                      : "rattachée"}{" "}
                    du terrain.
                  </p>
                </div>
              )}

              <div>
                <InputLabel>
                  Membre de la famille
                </InputLabel>

                <select
                  value={
                    vendeurDonateurMembreId
                  }
                  onChange={(event) => {
                    setError(null);

                    setVendeurDonateurMembreId(
                      event.target.value,
                    );
                  }}
                  disabled={
                    loadingMembres ||
                    !familleId
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                >
                  <option value="">
                    {loadingMembres
                      ? "Chargement des membres..."
                      : !familleId
                        ? "Sélectionnez d'abord une famille"
                        : membres.length === 0
                          ? "Aucun membre pour cette famille"
                          : "Sélectionner un membre"}
                  </option>

                  {membres.map(
                    (membre) => (
                      <option
                        key={membre.id}
                        value={membre.id}
                      >
                        {membre.prenom}{" "}
                        {membre.nom}
                        {" — "}
                        {membre.qualite}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <InputLabel required>
                    Nom
                  </InputLabel>

                  <TextInput
                    value={
                      vendeurDonateurNom
                    }
                    onChange={
                      setVendeurDonateurNom
                    }
                    placeholder="Nom"
                  />
                </div>

                <div>
                  <InputLabel required>
                    Prénom
                  </InputLabel>

                  <TextInput
                    value={
                      vendeurDonateurPrenom
                    }
                    onChange={
                      setVendeurDonateurPrenom
                    }
                    placeholder="Prénom"
                  />
                </div>

                <div>
                  <InputLabel required>
                    Qualité
                  </InputLabel>

                  <TextInput
                    value={
                      vendeurDonateurQualite
                    }
                    onChange={
                      setVendeurDonateurQualite
                    }
                    placeholder="Ex. Fils, Oncle..."
                  />
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-medium">
                  Contrôle du droit familial
                </p>

                <p className="mt-1 text-xs leading-5">
                  Lorsque vous sélectionnez un membre
                  de la famille, LANDIS pourra vérifier
                  que son droit actif correspond à la
                  situation déclarée :{" "}
                  <strong>
                    VENDRE
                  </strong>{" "}
                  pour une vente ou{" "}
                  <strong>
                    DONNER
                  </strong>{" "}
                  pour une donation.
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Prise anarchique */}
        {situation ===
          "PRISE_ANARCHIQUEMENT" && (
          <SectionCard
            icon={AlertTriangle}
            title="Droit revendiqué"
            description="Enregistrez ce que l'occupant affirme comme fondement de son occupation."
          >
            <div>
              <InputLabel required>
                Droit revendiqué
              </InputLabel>

              <TextArea
                value={droitRevendique}
                onChange={
                  setDroitRevendique
                }
                placeholder="Ex. Droit coutumier, autorisation familiale, occupation ancienne..."
              />
            </div>
          </SectionCard>
        )}

        {/* Montants */}
        {situation === "VENDUE" && (
          <SectionCard
            icon={Handshake}
            title="Informations financières"
            description="Montants déclarés lors du recensement. Ils ne constituent pas automatiquement une transaction LANDIS."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <InputLabel>
                  Montant total
                </InputLabel>

                <div className="relative">
                  <TextInput
                    value={montantTotal}
                    onChange={
                      setMontantTotal
                    }
                    placeholder="0"
                    type="number"
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    FCFA
                  </span>
                </div>
              </div>

              <div>
                <InputLabel>
                  Montant payé
                </InputLabel>

                <div className="relative">
                  <TextInput
                    value={montantPaye}
                    onChange={
                      setMontantPaye
                    }
                    placeholder="0"
                    type="number"
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    FCFA
                  </span>
                </div>
              </div>
            </div>

            {montantTotal &&
              montantPaye &&
              Number(montantTotal) >=
                Number(montantPaye) && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Reste déclaré
                    </span>

                    <span className="font-semibold text-slate-900">
                      {formatNumber(
                        Number(
                          montantTotal,
                        ) -
                          Number(
                            montantPaye,
                          ),
                      )}{" "}
                      FCFA
                    </span>
                  </div>
                </div>
              )}
          </SectionCard>
        )}

        {/* Coopération */}
        <SectionCard
          icon={Handshake}
          title="Coopération"
          description="Indiquez si l'occupant ou les personnes rencontrées coopèrent au recensement."
        >
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
            <input
              type="checkbox"
              checked={cooperative}
              onChange={(event) =>
                setCooperative(
                  event.target.checked,
                )
              }
              className="h-4 w-4 rounded border-slate-300"
            />

            <div>
              <p className="text-sm font-medium text-slate-900">
                Personne coopérative
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Les personnes rencontrées acceptent de
                participer au recensement et de fournir
                les informations disponibles.
              </p>
            </div>
          </label>
        </SectionCard>

        {/* Documents */}
        <SectionCard
          icon={FileText}
          title="Documents présentés"
          description="Enregistrez les pièces qui ont été présentées lors du recensement."
        >
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                <FileText className="mx-auto h-6 w-6 text-slate-400" />

                <p className="mt-2 text-sm text-slate-500">
                  Aucun document ajouté.
                </p>
              </div>
            ) : (
              documents.map(
                (document, index) => (
                  <div
                    key={document.localId}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">
                        Document{" "}
                        {index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeDocument(
                            document.localId,
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <InputLabel required>
                          Type
                        </InputLabel>

                        <TextInput
                          value={
                            document.typeDocument
                          }
                          onChange={(value) =>
                            updateDocument(
                              document.localId,
                              "typeDocument",
                              value,
                            )
                          }
                          placeholder="Ex. Acte de vente"
                        />
                      </div>

                      <div>
                        <InputLabel>
                          Référence
                        </InputLabel>

                        <TextInput
                          value={
                            document.reference ||
                            ""
                          }
                          onChange={(value) =>
                            updateDocument(
                              document.localId,
                              "reference",
                              value,
                            )
                          }
                          placeholder="Référence du document"
                        />
                      </div>

                      <div>
                        <InputLabel>
                          Date
                        </InputLabel>

                        <TextInput
                          value={
                            document.dateDocument ||
                            ""
                          }
                          onChange={(value) =>
                            updateDocument(
                              document.localId,
                              "dateDocument",
                              value,
                            )
                          }
                          type="date"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <InputLabel>
                        Observations
                      </InputLabel>

                      <TextArea
                        value={
                          document.observations ||
                          ""
                        }
                        onChange={(value) =>
                          updateDocument(
                            document.localId,
                            "observations",
                            value,
                          )
                        }
                        placeholder="Observations sur cette pièce..."
                        rows={3}
                      />
                    </div>
                  </div>
                ),
              )
            )}

            <button
              type="button"
              onClick={addDocument}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter un document
            </button>
          </div>
        </SectionCard>

        {/* Signataires */}
        <SectionCard
          icon={Users}
          title="Signataires"
          description="Personnes ayant signé ou participé à la constatation."
        >
          <div className="space-y-4">
            {signataires.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                <Users className="mx-auto h-6 w-6 text-slate-400" />

                <p className="mt-2 text-sm text-slate-500">
                  Aucun signataire ajouté.
                </p>
              </div>
            ) : (
              signataires.map(
                (signataire, index) => (
                  <div
                    key={signataire.localId}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">
                        Signataire{" "}
                        {index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeSignataire(
                            signataire.localId,
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <InputLabel required>
                          Nom
                        </InputLabel>

                        <TextInput
                          value={
                            signataire.nom
                          }
                          onChange={(value) =>
                            updateSignataire(
                              signataire.localId,
                              "nom",
                              value,
                            )
                          }
                          placeholder="Nom"
                        />
                      </div>

                      <div>
                        <InputLabel required>
                          Prénom
                        </InputLabel>

                        <TextInput
                          value={
                            signataire.prenom
                          }
                          onChange={(value) =>
                            updateSignataire(
                              signataire.localId,
                              "prenom",
                              value,
                            )
                          }
                          placeholder="Prénom"
                        />
                      </div>

                      <div>
                        <InputLabel>
                          Qualité
                        </InputLabel>

                        <TextInput
                          value={
                            signataire.qualite ||
                            ""
                          }
                          onChange={(value) =>
                            updateSignataire(
                              signataire.localId,
                              "qualite",
                              value,
                            )
                          }
                          placeholder="Qualité"
                        />
                      </div>

                      <div>
                        <InputLabel>
                          Fonction
                        </InputLabel>

                        <TextInput
                          value={
                            signataire.fonction ||
                            ""
                          }
                          onChange={(value) =>
                            updateSignataire(
                              signataire.localId,
                              "fonction",
                              value,
                            )
                          }
                          placeholder="Fonction"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <InputLabel>
                        Observations
                      </InputLabel>

                      <TextArea
                        value={
                          signataire.observations ||
                          ""
                        }
                        onChange={(value) =>
                          updateSignataire(
                            signataire.localId,
                            "observations",
                            value,
                          )
                        }
                        placeholder="Observations..."
                        rows={2}
                      />
                    </div>
                  </div>
                ),
              )
            )}

            <button
              type="button"
              onClick={addSignataire}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter un signataire
            </button>
          </div>
        </SectionCard>

        {/* Autorités */}
        <SectionCard
          icon={Users}
          title="Autorités de l'État"
          description="Personnes représentant une autorité publique présentes ou intervenant dans le constat."
        >
          <div className="space-y-4">
            {autorites.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                <Users className="mx-auto h-6 w-6 text-slate-400" />

                <p className="mt-2 text-sm text-slate-500">
                  Aucune autorité ajoutée.
                </p>
              </div>
            ) : (
              autorites.map(
                (autorite, index) => (
                  <div
                    key={autorite.localId}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">
                        Autorité{" "}
                        {index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeAutorite(
                            autorite.localId,
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <InputLabel required>
                          Nom
                        </InputLabel>

                        <TextInput
                          value={
                            autorite.nom
                          }
                          onChange={(value) =>
                            updateAutorite(
                              autorite.localId,
                              "nom",
                              value,
                            )
                          }
                          placeholder="Nom"
                        />
                      </div>

                      <div>
                        <InputLabel>
                          Prénom
                        </InputLabel>

                        <TextInput
                          value={
                            autorite.prenom ||
                            ""
                          }
                          onChange={(value) =>
                            updateAutorite(
                              autorite.localId,
                              "prenom",
                              value,
                            )
                          }
                          placeholder="Prénom"
                        />
                      </div>

                      <div>
                        <InputLabel required>
                          Fonction
                        </InputLabel>

                        <TextInput
                          value={
                            autorite.fonction
                          }
                          onChange={(value) =>
                            updateAutorite(
                              autorite.localId,
                              "fonction",
                              value,
                            )
                          }
                          placeholder="Ex. Chef de quartier"
                        />
                      </div>

                      <div>
                        <InputLabel>
                          Institution
                        </InputLabel>

                        <TextInput
                          value={
                            autorite.institution ||
                            ""
                          }
                          onChange={(value) =>
                            updateAutorite(
                              autorite.localId,
                              "institution",
                              value,
                            )
                          }
                          placeholder="Institution"
                        />
                      </div>

                      <div>
                        <InputLabel>
                          Téléphone
                        </InputLabel>

                        <TextInput
                          value={
                            autorite.telephone ||
                            ""
                          }
                          onChange={(value) =>
                            updateAutorite(
                              autorite.localId,
                              "telephone",
                              value,
                            )
                          }
                          placeholder="Téléphone"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <InputLabel>
                        Observations
                      </InputLabel>

                      <TextArea
                        value={
                          autorite.observations ||
                          ""
                        }
                        onChange={(value) =>
                          updateAutorite(
                            autorite.localId,
                            "observations",
                            value,
                          )
                        }
                        placeholder="Observations..."
                        rows={2}
                      />
                    </div>
                  </div>
                ),
              )
            )}

            <button
              type="button"
              onClick={addAutorite}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter une autorité
            </button>
          </div>
        </SectionCard>

        {/* Observations */}
        <SectionCard
          icon={FileText}
          title="Observations générales"
          description="Informations complémentaires relevées lors du recensement."
        >
          <TextArea
            value={observations}
            onChange={setObservations}
            placeholder="Décrivez les observations faites sur le terrain..."
            rows={6}
          />
        </SectionCard>

        {/* Récapitulatif */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Prêt à enregistrer
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Vérifiez les informations avant de
                valider le constat.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                {documents.length} document
                {documents.length > 1
                  ? "s"
                  : ""}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                {signataires.length} signataire
                {signataires.length > 1
                  ? "s"
                  : ""}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                {autorites.length} autorité
                {autorites.length > 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/recensements"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              {saving
                ? "Enregistrement..."
                : "Enregistrer le recensement"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function ClipboardIcon() {
  return (
    <div className="relative h-6 w-6">
      <div className="absolute inset-x-1 top-1.5 bottom-0 rounded-md border-2 border-white" />

      <div className="absolute left-2 top-0 h-2 w-4 rounded-sm border-2 border-white bg-slate-900" />

      <div className="absolute left-2.5 top-4 h-0.5 w-3 rounded-full bg-white" />

      <div className="absolute left-2.5 top-6 h-0.5 w-2 rounded-full bg-white" />
    </div>
  );
}