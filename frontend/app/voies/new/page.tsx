"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Plus,
  Route,
  Trash2,
} from "lucide-react";

import {
  createVoie,
  TypeVoie,
  PositionVoie,
  VoieBlocInput,
} from "@/services/voies";

import { getTerrains } from "@/services/terrains";
import { getBlocs } from "@/services/blocs";

interface Terrain {
  id: number;
  reference: string;
  nom: string;
  superficie: number;
}

interface Bloc {
  id: number;
  reference: string;
  superficie: number;
  nombreParcelles: number;
  sectionId?: number;

  section?: {
    id: number;
    reference: string;
    terrainId: number;
  };
}

interface AssociationBloc {
  blocId: number;
  position: PositionVoie;
}

const POSITIONS: PositionVoie[] = [
  "HAUT",
  "BAS",
  "GAUCHE",
  "DROITE",
];

const POSITION_LABELS: Record<
  PositionVoie,
  string
> = {
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

const TYPE_LABELS: Record<
  TypeVoie,
  string
> = {
  AVENUE: "Avenue",
  RUELLE: "Ruelle",
  RUE: "Rue",
  AUTRE: "Autre",
};

export default function NewVoiePage() {
  const [terrains, setTerrains] =
    useState<Terrain[]>([]);

  const [blocs, setBlocs] =
    useState<Bloc[]>([]);

  const [reference, setReference] =
    useState("");

  const [type, setType] =
    useState<TypeVoie>("RUELLE");

  const [largeur, setLargeur] =
    useState("");

  const [longueur, setLongueur] =
    useState("");

  const [terrainId, setTerrainId] =
    useState("");

  const [associations, setAssociations] =
    useState<AssociationBloc[]>([]);

  const [blocSelectionne, setBlocSelectionne] =
    useState("");

  const [positionSelectionnee, setPositionSelectionnee] =
    useState<PositionVoie>("HAUT");

  const [loadingTerrains, setLoadingTerrains] =
    useState(true);

  const [loadingBlocs, setLoadingBlocs] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ============================================================
     CHARGEMENT DES TERRAINS
     ============================================================ */

  useEffect(() => {
    async function loadTerrains() {
      try {
        setLoadingTerrains(true);
        setError("");

        const data = await getTerrains();

        setTerrains(data);
      } catch (error) {
        console.error(
          "Erreur chargement terrains :",
          error,
        );

        setError(
          "Impossible de charger les terrains.",
        );
      } finally {
        setLoadingTerrains(false);
      }
    }

    loadTerrains();
  }, []);

  /* ============================================================
     CHARGEMENT DES BLOCS
     ============================================================ */

  useEffect(() => {
    async function loadBlocs() {
      if (!terrainId) {
        setBlocs([]);
        setAssociations([]);
        setBlocSelectionne("");
        return;
      }

      try {
        setLoadingBlocs(true);
        setError("");

        setAssociations([]);
        setBlocSelectionne("");

        const data = await getBlocs();

        const blocsDuTerrain =
          data.filter(
            (bloc: Bloc) =>
              bloc.section?.terrainId ===
              Number(terrainId),
          );

        setBlocs(blocsDuTerrain);
      } catch (error) {
        console.error(
          "Erreur chargement blocs :",
          error,
        );

        setError(
          "Impossible de charger les blocs du terrain.",
        );

        setBlocs([]);
      } finally {
        setLoadingBlocs(false);
      }
    }

    loadBlocs();
  }, [terrainId]);

  /* ============================================================
     TYPE AUTOMATIQUE SELON LA POSITION
     ============================================================ */

  useEffect(() => {
    const typeAutomatique =
      POSITION_TYPES[
        positionSelectionnee
      ];

    if (typeAutomatique) {
      setType(typeAutomatique);
    }
  }, [positionSelectionnee]);

  /* ============================================================
     POSITIONS DÉJÀ UTILISÉES POUR LE BLOC
     ============================================================ */

  const positionsUtiliseesPourBloc =
    useMemo(() => {
      if (!blocSelectionne) {
        return new Set<PositionVoie>();
      }

      return new Set(
        associations
          .filter(
            (association) =>
              association.blocId ===
              Number(blocSelectionne),
          )
          .map(
            (association) =>
              association.position,
          ),
      );
    }, [
      associations,
      blocSelectionne,
    ]);

  /* ============================================================
     AJOUT D'UNE ASSOCIATION
     ============================================================ */

  function ajouterAssociation() {
    setError("");

    if (!blocSelectionne) {
      setError(
        "Veuillez sélectionner un bloc.",
      );
      return;
    }

    if (
      positionsUtiliseesPourBloc.has(
        positionSelectionnee,
      )
    ) {
      setError(
        `La position ${POSITION_LABELS[positionSelectionnee]} est déjà associée à ce bloc.`,
      );
      return;
    }

    const nouvelleAssociation: AssociationBloc =
      {
        blocId: Number(blocSelectionne),
        position: positionSelectionnee,
      };

    setAssociations((current) => [
      ...current,
      nouvelleAssociation,
    ]);

    setBlocSelectionne("");
    setPositionSelectionnee("HAUT");
  }

  /* ============================================================
     SUPPRESSION D'UNE ASSOCIATION
     ============================================================ */

  function supprimerAssociation(
    index: number,
  ) {
    setAssociations((current) =>
      current.filter(
        (_, currentIndex) =>
          currentIndex !== index,
      ),
    );
  }

  /* ============================================================
     CRÉATION
     ============================================================ */

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!reference.trim()) {
      setError(
        "La référence de la voie est obligatoire.",
      );
      return;
    }

    if (!terrainId) {
      setError(
        "Veuillez sélectionner un terrain.",
      );
      return;
    }

    if (
      !largeur ||
      Number(largeur) <= 0
    ) {
      setError(
        "La largeur doit être supérieure à 0.",
      );
      return;
    }

    if (
      !longueur ||
      Number(longueur) <= 0
    ) {
      setError(
        "La longueur doit être supérieure à 0.",
      );
      return;
    }

    /*
     * Vérification supplémentaire côté frontend
     * des règles métier.
     */
    for (const association of associations) {
      const typeAttendu =
        POSITION_TYPES[
          association.position
        ];

      if (
        typeAttendu &&
        type !== typeAttendu
      ) {
        setError(
          `La position ${POSITION_LABELS[association.position]} nécessite une ${TYPE_LABELS[typeAttendu]}.`,
        );
        return;
      }
    }

    try {
      setLoading(true);

      const blocs: VoieBlocInput[] =
        associations.map(
          (association) => ({
            blocId:
              association.blocId,
            position:
              association.position,
          }),
        );

      await createVoie({
        reference:
          reference.trim(),

        type,

        largeur:
          Number(largeur),

        longueur:
          Number(longueur),

        terrainId:
          Number(terrainId),

        blocs,
      });

      setSuccess(
        "La voie a été créée avec succès.",
      );

      setReference("");
      setType("RUELLE");
      setLargeur("");
      setLongueur("");
      setTerrainId("");
      setBlocs([]);
      setAssociations([]);
      setBlocSelectionne("");
      setPositionSelectionnee("HAUT");
    } catch (error: any) {
      console.error(
        "Erreur création voie :",
        error,
      );

      let message =
        error?.response?.data?.message ||
        error?.message ||
        "Impossible de créer la voie.";

      if (Array.isArray(message)) {
        message =
          message.join(", ");
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     CALCUL SUPERFICIE
     ============================================================ */

  const superficie =
    Number(largeur) > 0 &&
    Number(longueur) > 0
      ? Number(largeur) *
        Number(longueur)
      : 0;

  /* ============================================================
     RENDU
     ============================================================ */

  return (
    <div className="space-y-8">
      {/* RETOUR */}

      <Link
        href="/voies"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />

        Retour aux voies
      </Link>

      {/* EN-TÊTE */}

      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-slate-900 p-3 text-white">
          <Route size={26} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Nouvelle voie
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Enregistrez une voie physique et
            indiquez les blocs qu'elle borde.
          </p>
        </div>
      </div>

      {/* FORMULAIRE */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6">
            {/* ERREUR */}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* SUCCÈS */}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* TERRAIN */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Terrain *
              </label>

              <select
                value={terrainId}
                onChange={(event) =>
                  setTerrainId(
                    event.target.value,
                  )
                }
                disabled={
                  loadingTerrains
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingTerrains
                    ? "Chargement des terrains..."
                    : "Sélectionner un terrain"}
                </option>

                {terrains.map(
                  (terrain) => (
                    <option
                      key={terrain.id}
                      value={terrain.id}
                    >
                      {terrain.reference} —{" "}
                      {terrain.nom}
                    </option>
                  ),
                )}
              </select>

              {!loadingTerrains &&
                terrains.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    Aucun terrain disponible.
                    Créez d'abord un terrain.
                  </p>
                )}
            </div>

            {/* RÉFÉRENCE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Référence *
              </label>

              <input
                type="text"
                value={reference}
                onChange={(event) =>
                  setReference(
                    event.target.value,
                  )
                }
                placeholder="Ex. VOIE-005"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* TYPE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Type de voie *
              </label>

              <select
                value={type}
                onChange={(event) =>
                  setType(
                    event.target
                      .value as TypeVoie,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="AVENUE">
                  Avenue
                </option>

                <option value="RUE">
                  Rue
                </option>

                <option value="RUELLE">
                  Ruelle
                </option>

                <option value="AUTRE">
                  Autre
                </option>
              </select>

              <p className="mt-2 text-xs text-slate-500">
                HAUT et BAS correspondent aux
                avenues. GAUCHE et DROITE
                correspondent aux ruelles.
              </p>
            </div>

            {/* LARGEUR + LONGUEUR */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Largeur (m) *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={largeur}
                  onChange={(event) =>
                    setLargeur(
                      event.target.value,
                    )
                  }
                  placeholder="Ex. 7"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Longueur (m) *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={longueur}
                  onChange={(event) =>
                    setLongueur(
                      event.target.value,
                    )
                  }
                  placeholder="Ex. 100"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            {/* SUPERFICIE */}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Superficie calculée
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Largeur × Longueur
                  </p>
                </div>

                <p className="text-2xl font-bold text-slate-900">
                  {superficie.toLocaleString(
                    "fr-FR",
                  )}{" "}
                  m²
                </p>
              </div>
            </div>

            {/* ==================================================
                BLOCS BORDÉS
               ================================================== */}

            <div className="rounded-2xl border border-slate-200">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Blocs bordés
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Une même voie physique peut
                      border plusieurs blocs voisins.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    {associations.length}{" "}
                    association
                    {associations.length !==
                    1
                      ? "s"
                      : ""}
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                {/* AJOUT */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Bloc
                    </label>

                    <select
                      value={
                        blocSelectionne
                      }
                      onChange={(event) =>
                        setBlocSelectionne(
                          event.target
                            .value,
                        )
                      }
                      disabled={
                        !terrainId ||
                        loadingBlocs
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                    >
                      <option value="">
                        {!terrainId
                          ? "Sélectionnez d'abord un terrain"
                          : loadingBlocs
                            ? "Chargement..."
                            : blocs.length ===
                                0
                              ? "Aucun bloc disponible"
                              : "Sélectionner un bloc"}
                      </option>

                      {blocs.map(
                        (bloc) => (
                          <option
                            key={bloc.id}
                            value={bloc.id}
                          >
                            {
                              bloc.reference
                            }{" "}
                            —{" "}
                            {Number(
                              bloc.superficie,
                            ).toLocaleString(
                              "fr-FR",
                            )}{" "}
                            m²
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Position
                    </label>

                    <select
                      value={
                        positionSelectionnee
                      }
                      onChange={(event) =>
                        setPositionSelectionnee(
                          event.target
                            .value as PositionVoie,
                        )
                      }
                      disabled={
                        !blocSelectionne
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                    >
                      {POSITIONS.map(
                        (position) => {
                          const utilisee =
                            positionsUtiliseesPourBloc.has(
                              position,
                            );

                          return (
                            <option
                              key={position}
                              value={
                                position
                              }
                              disabled={
                                utilisee
                              }
                            >
                              {
                                POSITION_LABELS[
                                  position
                                ]
                              }{" "}
                              —{" "}
                              {
                                TYPE_LABELS[
                                  POSITION_TYPES[
                                    position
                                  ]!
                                ]
                              }
                              {utilisee
                                ? " — déjà utilisée"
                                : ""}
                            </option>
                          );
                        },
                      )}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={
                      ajouterAssociation
                    }
                    disabled={
                      !blocSelectionne
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={17} />

                    Ajouter
                  </button>
                </div>

                {/* LISTE DES ASSOCIATIONS */}

                {associations.length >
                0 ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <span>
                        Bloc
                      </span>

                      <span>
                        Position
                      </span>

                      <span className="text-right">
                        Action
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200">
                      {associations.map(
                        (
                          association,
                          index,
                        ) => {
                          const bloc =
                            blocs.find(
                              (item) =>
                                item.id ===
                                association.blocId,
                            );

                          return (
                            <div
                              key={`${association.blocId}-${association.position}-${index}`}
                              className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 px-4 py-3"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {bloc?.reference ||
                                    `Bloc #${association.blocId}`}
                                </p>

                                {bloc && (
                                  <p className="text-xs text-slate-400">
                                    {Number(
                                      bloc.superficie,
                                    ).toLocaleString(
                                      "fr-FR",
                                    )}{" "}
                                    m²
                                  </p>
                                )}
                              </div>

                              <div>
                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                  {
                                    POSITION_LABELS[
                                      association
                                        .position
                                    ]
                                  }
                                </span>
                              </div>

                              <div className="text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    supprimerAssociation(
                                      index,
                                    )
                                  }
                                  className="inline-flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-50"
                                  title="Supprimer l'association"
                                >
                                  <Trash2
                                    size={
                                      17
                                    }
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 px-5 py-6 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      Aucun bloc associé
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Vous pouvez créer une voie au
                      niveau du terrain uniquement,
                      ou lui associer un ou plusieurs
                      blocs.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* INFORMATION MÉTIER */}

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
              <p className="text-sm font-semibold text-blue-900">
                Règle de quadrillage
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Pour compléter le quadrillage d'un
                bloc, les quatre positions doivent être
                couvertes : <strong>Haut</strong> et{" "}
                <strong>Bas</strong> par des avenues,
                <strong> Gauche</strong> et{" "}
                <strong>Droite</strong> par des
                ruelles.
              </p>

              <p className="mt-2 text-xs leading-5 text-blue-700">
                Une même voie peut être partagée entre
                deux blocs voisins. Par exemple, une
                ruelle peut être <strong>Droite</strong>{" "}
                du bloc A et <strong>Gauche</strong> du
                bloc B.
              </p>
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Link
              href="/voies"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={
                loading ||
                loadingTerrains ||
                terrains.length === 0
              }
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Création..."
                : "Créer la voie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}