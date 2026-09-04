import api from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

export interface Terrain {
  id: number;
  reference: string;
  nom: string;
  superficie: number;
  localisation?: string;
  statut: string;
}

export interface Parcelle {
  id: number;
  reference: string;
  numero: string;
  superficie: number;
  blocId: number;
  proprietaireId?: number | null;
}

/* =========================================================
   VOIES
========================================================= */

export type PositionVoie =
  | "HAUT"
  | "BAS"
  | "GAUCHE"
  | "DROITE"
  | "AUTRE";

export type TypeVoie =
  | "AVENUE"
  | "RUELLE"
  | "RUE"
  | "AUTRE";

export interface Voie {
  id: number;
  reference: string;
  type: TypeVoie;
  largeur: number;
  longueur: number;
  superficie: number;
  terrainId: number;

  terrain?: {
    id: number;
    reference: string;
    nom?: string;
  };
}

export interface BlocVoie {
  id: number;
  blocId: number;
  voieId: number;
  position: PositionVoie;

  voie: Voie;

  createdAt?: string;
  updatedAt?: string;
}

/* =========================================================
   STATISTIQUES
========================================================= */

export interface BlocStatistiques {
  nombreParcellesDeclarees: number;
  nombreParcellesReelles: number;
  ecartParcelles: number;

  etatBloc: string;

  parcellesDisponibles: number;
  parcellesAttribuees: number;

  surfaceTotaleBloc: number;
  surfaceOccupee: number;
  surfaceDisponible: number;
  tauxOccupation: number;

  nombreVoies?: number;
  nombreVoiesPrincipales?: number;
  superficieVoies?: number;
  voiesManquantes?: PositionVoie[];
  quadrillageComplet?: boolean;
}

/* =========================================================
   BLOC
========================================================= */

export interface Bloc {
  id: number;
  reference: string;
  superficie: number;
  nombreParcelles: number;

  sectionId: number;
  terrainId?: number;

  terrain?: Terrain;

  parcelles?: Parcelle[];

  statut: "EN_COURS" | "TERMINE";

  statistiques?: BlocStatistiques;

  /*
   * Anciennes propriétés conservées temporairement
   * afin de ne pas casser le formulaire existant.
   *
   * Le backend actuel utilise désormais bloc.voies.
   */
  voieHautType: string;
  voieHautLargeur: number;

  voieBasType: string;
  voieBasLargeur: number;

  voieGaucheType: string;
  voieGaucheLargeur: number;

  voieDroiteType: string;
  voieDroiteLargeur: number;

  /*
   * Nouveau système de voies partagées.
   */
  voies?: BlocVoie[];
}

/* =========================================================
   DONNÉES DE CRÉATION
========================================================= */

export interface CreateBlocData {
  reference: string;
  superficie: number;
  nombreParcelles: number;
  sectionId: number;

  voieHautType?: string;
  voieHautLargeur?: number;

  voieBasType?: string;
  voieBasLargeur?: number;

  voieGaucheType?: string;
  voieGaucheLargeur?: number;

  voieDroiteType?: string;
  voieDroiteLargeur?: number;
}

/* =========================================================
   DONNÉES DE MODIFICATION
========================================================= */

export interface UpdateBlocData {
  reference?: string;
  superficie?: number;
  nombreParcelles?: number;
  sectionId?: number;

  voieHautType?: string;
  voieHautLargeur?: number;

  voieBasType?: string;
  voieBasLargeur?: number;

  voieGaucheType?: string;
  voieGaucheLargeur?: number;

  voieDroiteType?: string;
  voieDroiteLargeur?: number;
}

/* =========================================================
   RÉCUPÉRATION DES BLOCS
========================================================= */

export async function getBlocs(): Promise<Bloc[]> {
  const response = await api.get("/blocs");
  return response.data;
}

/* =========================================================
   RÉCUPÉRER UN BLOC
========================================================= */

export async function getBloc(id: number): Promise<Bloc> {
  const response = await api.get(`/blocs/${id}`);
  return response.data;
}

/* =========================================================
   STATISTIQUES D'UN BLOC
========================================================= */

export async function getBlocStatistics(
  id: number
): Promise<BlocStatistiques> {
  const response = await api.get(`/blocs/${id}/statistiques`);
  return response.data;
}

/* =========================================================
   CRÉER UN BLOC
========================================================= */

export async function createBloc(
  data: CreateBlocData
): Promise<Bloc> {
  const response = await api.post("/blocs/complet", data);
  return response.data;
}

/* =========================================================
   MODIFIER UN BLOC
========================================================= */

export async function updateBloc(
  id: number,
  data: UpdateBlocData
): Promise<Bloc> {
  const response = await api.patch(`/blocs/${id}`, data);
  return response.data;
}

/* =========================================================
   SUPPRIMER UN BLOC
========================================================= */

export async function deleteBloc(id: number): Promise<void> {
  await api.delete(`/blocs/${id}`);
}

/* =========================================================
   AJOUTER DES PARCELLES
========================================================= */

export async function ajouterParcelles(
  blocId: number,
  quantite: number
): Promise<Bloc> {
  const response = await api.post(
    `/blocs/${blocId}/parcelles/ajouter`,
    {
      quantite,
    }
  );

  return response.data;
}

/* =========================================================
   RÉDUIRE DES PARCELLES
========================================================= */

export async function reduireParcelles(
  blocId: number,
  quantite: number
): Promise<Bloc> {
  const response = await api.post(
    `/blocs/${blocId}/parcelles/reduire`,
    {
      quantite,
    }
  );

  return response.data;
}