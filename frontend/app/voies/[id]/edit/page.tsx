"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Route,
  Plus,
  Trash2,
  Blocks,
  AlertCircle,
} from "lucide-react";

import {
  getVoie,
  updateVoie,
  Voie,
  PositionVoie,
  TypeVoie,
  VoieBlocInput,
} from "@/services/voies";

import { getTerrains } from "@/services/terrains";
import { getBlocs } from "@/services/blocs";

interface Terrain {
  id: number;
  reference: string;
}

interface Bloc {
  id: number;
  reference: string;
  statut?: string;
  section?: {
    id: number;
    reference: string;
    terrainId: number;
  };
}

interface AssociationForm {
  blocId: number;
  position: PositionVoie;
}

const POSITIONS: PositionVoie[] = [
  "HAUT",
  "BAS",
  "GAUCHE",
  "DROITE",
];

const POSITION_LABELS: Record<PositionVoie, string> = {
  HAUT: "Haut",
  BAS: "Bas",
  GAUCHE: "Gauche",
  DROITE: "Droite",
  AUTRE: "Autre",
};

const POSITION_TYPES: Record<
  PositionVoie,
  TypeVoie | null
> = {
  HAUT: "AVENUE",
  BAS: "AVENUE",
  GAUCHE: "RUELLE",
  DROITE: "RUELLE",
  AUTRE: null,
};

function formatType(type: string) {
  switch (type) {
    case "AVENUE":
      return "Avenue";

    case "RUE":
      return "Rue";

    case "RUELLE":
      return "Ruelle";

    case "AUTRE":
      return "Autre";

    default:
      return type;
  }
}

export default function EditVoiePage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [voie, setVoie] = useState<Voie | null>(null);

  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [blocs, setBlocs] = useState<Bloc[]>([]);

  const [reference, setReference] = useState("");
  const [type, setType] = useState<TypeVoie>("AVENUE");
  const [largeur, setLargeur] = useState("");
  const [longueur, setLongueur] = useState("");

  const [terrainId, setTerrainId] = useState<number | null>(
    null,
  );

  const [associations, setAssociations] = useState<
    AssociationForm[]
  >([]);

  const [blocSelectionne, setBlocSelectionne] =
    useState("");

  const [positionSelectionnee, setPositionSelectionnee] =
    useState<PositionVoie | "">("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Chargement initial
   */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        if (!id || Number.isNaN(id)) {
          setError("Identifiant de voie invalide.");
          return;
        }

        const [voieData, terrainsData, blocsData] =
          await Promise.all([
            getVoie(id),
            getTerrains(),
            getBlocs(),
          ]);

        setVoie(voieData);
        setTerrains(terrainsData);
        setBlocs(blocsData);

        setReference(voieData.reference);
        setType(voieData.type);
        setLargeur(String(voieData.largeur));
        setLongueur(String(voieData.longueur));
        setTerrainId(voieData.terrainId);

        setAssociations(
          (voieData.blocs || []).map((association) => ({
            blocId: association.blocId,
            position: association.position,
          })),
        );
      } catch (err: any) {
        console.error(
          "Erreur chargement modification voie :",
          err,
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Impossible de charger les données de la voie.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  /*
   * Blocs disponibles pour le terrain de la voie
   */

  const blocsDuTerrain = useMemo(() => {
    if (!terrainId) {
      return [];
    }

    return blocs.filter(
      (bloc) =>
        bloc.section?.terrainId === terrainId,
    );
  }, [blocs, terrainId]);

  /*
   * Positions déjà utilisées dans le bloc sélectionné
   */

  const positionsUtiliseesPourBloc = useMemo(() => {
    if (!blocSelectionne) {
      return [];
    }

    const blocId = Number(blocSelectionne);

    return associations
      .filter(
        (association) =>
          association.blocId === blocId,
      )
      .map(
        (association) => association.position,
      );
  }, [associations, blocSelectionne]);

  /*
   * Position sélectionnée
   *
   * On limite les positions obligatoires.
   */

  const positionsDisponibles = POSITIONS.filter(
    (position) =>
      !positionsUtiliseesPourBloc.includes(position),
  );

  /*
   * Changement de position
   *
   * HAUT/BAS => AVENUE
   * GAUCHE/DROITE => RUELLE
   */

  function handlePositionChange(
    position: PositionVoie | "",
  ) {
    setPositionSelectionnee(position);

    if (position) {
      const typeAssocie =
        POSITION_TYPES[position];

      if (typeAssocie) {
        setType(typeAssocie);
      }
    }
  }

  /*
   * Ajout d'une association bloc / position
   */

  function handleAddAssociation() {
    setError("");

    if (!blocSelectionne) {
      setError("Sélectionnez un bloc.");
      return;
    }

    if (!positionSelectionnee) {
      setError("Sélectionnez une position.");
      return;
    }

    const blocId = Number(blocSelectionne);

    if (!blocId || Number.isNaN(blocId)) {
      setError("Bloc invalide.");
      return;
    }

    const existe = associations.some(
      (association) =>
        association.blocId === blocId &&
        association.position ===
          positionSelectionnee,
    );

    if (existe) {
      setError(
        "Cette position est déjà associée à ce bloc.",
      );
      return;
    }

    const typeRequis =
      POSITION_TYPES[positionSelectionnee];

    if (
      typeRequis &&
      type !== typeRequis
    ) {
      setError(
        `La position "${POSITION_LABELS[positionSelectionnee]}" nécessite une voie de type "${formatType(typeRequis)}".`,
      );
      return;
    }

    setAssociations((current) => [
      ...current,
      {
        blocId,
        position: positionSelectionnee,
      },
    ]);

    setBlocSelectionne("");
    setPositionSelectionnee("");
  }

  /*
   * Suppression d'une association
   */

  function handleRemoveAssociation(
    index: number,
  ) {
    setAssociations((current) =>
      current.filter(
        (_, currentIndex) =>
          currentIndex !== index,
      ),
    );
  }

  /*
   * Validation du formulaire
   */

  function validateForm() {
    if (!reference.trim()) {
      return "La référence de la voie est obligatoire.";
    }

    const largeurNumber = Number(largeur);
    const longueurNumber = Number(longueur);

    if (
      !Number.isFinite(largeurNumber) ||
      largeurNumber <= 0
    ) {
      return "La largeur doit être supérieure à 0.";
    }

    if (
      !Number.isFinite(longueurNumber) ||
      longueurNumber <= 0
    ) {
      return "La longueur doit être supérieure à 0.";
    }

    if (!terrainId) {
      return "Le terrain est obligatoire.";
    }

    /*
     * Vérification des associations
     */

    const positionsParBloc =
      new Map<number, PositionVoie[]>();

    for (const association of associations) {
      const positions =
        positionsParBloc.get(
          association.blocId,
        ) || [];

      if (
        positions.includes(
          association.position,
        )
      ) {
        return `La position "${POSITION_LABELS[association.position]}" est présente plusieurs fois pour le même bloc.`;
      }

      positions.push(association.position);

      positionsParBloc.set(
        association.blocId,
        positions,
      );

      const typeRequis =
        POSITION_TYPES[association.position];

      if (
        typeRequis &&
        type !== typeRequis
      ) {
        return `La position "${POSITION_LABELS[association.position]}" nécessite une voie de type "${formatType(typeRequis)}".`;
      }
    }

    /*
     * Vérification que les blocs appartiennent
     * bien au terrain de la voie.
     */

    for (const association of associations) {
      const bloc = blocs.find(
        (item) =>
          item.id === association.blocId,
      );

      if (
        !bloc ||
        bloc.section?.terrainId !== terrainId
      ) {
        return "Tous les blocs associés doivent appartenir au terrain de cette voie.";
      }
    }

    return null;
  }

  /*
   * Enregistrement
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!terrainId) {
      setError("Le terrain est obligatoire.");
      return;
    }

    try {
      setSaving(true);

      const data: {
        reference: string;
        type: TypeVoie;
        largeur: number;
        longueur: number;
        blocs: VoieBlocInput[];
      } = {
        reference: reference.trim(),
        type,
        largeur: Number(largeur),
        longueur: Number(longueur),
        blocs: associations.map(
          (association) => ({
            blocId: association.blocId,
            position: association.position,
          }),
        ),
      };

      const updated = await updateVoie(
        id,
        data,
      );

      setVoie(updated);

      setSuccess(
        "La voie a été modifiée avec succès.",
      );

      setTimeout(() => {
        router.push(`/voies/${id}`);
      }, 800);
    } catch (err: any) {
      console.error(
        "Erreur modification voie :",
        err,
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Impossible de modifier la voie.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * Écran de chargement
   */

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-100" />

        <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />

        <div className="h-[600px] animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  /*
   * Erreur de chargement
   */

  if (!voie) {
    return (
      <div className="space-y-6 p-6">
        <Link
          href="/voies"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />

          Retour aux voies
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
          {error || "Voie introuvable."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* RETOUR */}

      <Link
        href={`/voies/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />

        Retour à la voie
      </Link>

      {/* EN-TÊTE */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-slate-900 p-3 text-white">
            <Route size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Modifier la voie
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Modification de{" "}
              <strong className="text-slate-700">
                {voie.reference}
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* MESSAGES */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* FORMULAIRE */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* INFORMATIONS DE LA VOIE */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Route size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Informations de la voie
              </h2>

              <p className="text-xs text-slate-500">
                Caractéristiques physiques de la voie
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* RÉFÉRENCE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Référence
              </label>

              <input
                type="text"
                value={reference}
                onChange={(event) =>
                  setReference(event.target.value)
                }
                placeholder="Ex. VOIE-001"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* TYPE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Type
              </label>

              <select
                value={type}
                onChange={(event) =>
                  setType(
                    event.target
                      .value as TypeVoie,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              >
                <option value="AVENUE">
                  Avenue
                </option>

                <option value="RUELLE">
                  Ruelle
                </option>

                <option value="RUE">
                  Rue
                </option>

                <option value="AUTRE">
                  Autre
                </option>
              </select>
            </div>

            {/* LARGEUR */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Largeur (m)
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={largeur}
                onChange={(event) =>
                  setLargeur(event.target.value)
                }
                placeholder="Ex. 7"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* LONGUEUR */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Longueur (m)
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={longueur}
                onChange={(event) =>
                  setLongueur(event.target.value)
                }
                placeholder="Ex. 250"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* TERRAIN */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Terrain
              </label>

              <select
                value={terrainId ?? ""}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                <option value="">
                  Sélectionnez un terrain
                </option>

                {terrains.map((terrain) => (
                  <option
                    key={terrain.id}
                    value={terrain.id}
                  >
                    {terrain.reference}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-slate-500">
                Le terrain d'une voie existante ne peut
                pas être modifié depuis cette page.
              </p>
            </div>
          </div>
        </div>

        {/* ASSOCIATIONS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                <Blocks size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Blocs bordés
                </h2>

                <p className="text-xs text-slate-500">
                  Gérez les blocs utilisant cette voie
                  comme limite
                </p>
              </div>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {associations.length} association
              {associations.length > 1
                ? "s"
                : ""}
            </span>
          </div>

          {/* AJOUT */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Ajouter un bloc
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Une même voie peut border plusieurs blocs.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto]">
              {/* BLOC */}

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">
                  Bloc
                </label>

                <select
                  value={blocSelectionne}
                  onChange={(event) =>
                    setBlocSelectionne(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="">
                    Sélectionner un bloc
                  </option>

                  {blocsDuTerrain.map((bloc) => (
                    <option
                      key={bloc.id}
                      value={bloc.id}
                    >
                      {bloc.reference}
                      {bloc.section
                        ? ` — ${bloc.section.reference}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* POSITION */}

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">
                  Position
                </label>

                <select
                  value={positionSelectionnee}
                  onChange={(event) =>
                    handlePositionChange(
                      event.target
                        .value as
                        | PositionVoie
                        | "",
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="">
                    Sélectionner une position
                  </option>

                  {positionsDisponibles.map(
                    (position) => (
                      <option
                        key={position}
                        value={position}
                      >
                        {POSITION_LABELS[position]}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* AJOUTER */}

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={
                    handleAddAssociation
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 md:w-auto"
                >
                  <Plus size={17} />

                  Ajouter
                </button>
              </div>
            </div>

            {blocsDuTerrain.length === 0 && (
              <p className="mt-4 text-xs text-amber-600">
                Aucun bloc disponible sur le terrain de
                cette voie.
              </p>
            )}
          </div>

          {/* LISTE DES ASSOCIATIONS */}

          {associations.length > 0 ? (
            <div className="mt-5 space-y-3">
              {associations.map(
                (association, index) => {
                  const bloc = blocs.find(
                    (item) =>
                      item.id ===
                      association.blocId,
                  );

                  return (
                    <div
                      key={`${association.blocId}-${association.position}-${index}`}
                      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                          <Blocks size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {bloc?.reference ||
                              `Bloc #${association.blocId}`}
                          </p>

                          {bloc?.section && (
                            <p className="mt-0.5 text-xs text-slate-500">
                              Section{" "}
                              {
                                bloc.section
                                  .reference
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                          {
                            POSITION_LABELS[
                              association
                                .position
                            ]
                          }
                        </span>

                        <button
                          type="button"
                          title="Retirer cette association"
                          onClick={() =>
                            handleRemoveAssociation(
                              index,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <Blocks
                size={32}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="font-medium text-slate-500">
                Aucun bloc associé.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Cette voie sera enregistrée sans
                association avec un bloc.
              </p>
            </div>
          )}

          {/* RÈGLES */}

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-900">
              Règles du quadrillage
            </p>

            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-blue-700">
              <li>
                • Haut et Bas nécessitent une
                <strong> Avenue</strong>.
              </li>

              <li>
                • Gauche et Droite nécessitent une
                <strong> Ruelle</strong>.
              </li>

              <li>
                • Une même voie physique peut border
                plusieurs blocs.
              </li>

              <li>
                • Une position ne peut être occupée
                qu'une seule fois pour un même bloc.
              </li>
            </ul>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href={`/voies/${id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={17} />

            {saving
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}