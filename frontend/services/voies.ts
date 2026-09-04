import api from "@/lib/api";

export type TypeVoie = "AVENUE" | "RUELLE" | "RUE" | "AUTRE";

export type PositionVoie =
  | "HAUT"
  | "BAS"
  | "GAUCHE"
  | "DROITE"
  | "AUTRE";

export interface BlocVoie {
  id: number;
  blocId: number;
  voieId: number;
  position: PositionVoie;
  createdAt?: string;
  updatedAt?: string;

  bloc?: {
    id: number;
    reference: string;
    statut?: string;
    section?: {
      id: number;
      reference: string;
      terrainId: number;
    };
  };
}

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
  };

  blocs: BlocVoie[];

  createdAt?: string;
  updatedAt?: string;
}

export interface VoieBlocInput {
  blocId: number;
  position: PositionVoie;
}

export interface CreateVoieData {
  reference: string;
  type: TypeVoie;
  largeur: number;
  longueur: number;
  terrainId: number;
  blocs?: VoieBlocInput[];
}

export interface UpdateVoieData {
  reference?: string;
  type?: TypeVoie;
  largeur?: number;
  longueur?: number;
  blocs?: VoieBlocInput[];
}

/**
 * Récupérer toutes les voies.
 */
export async function getVoies(): Promise<Voie[]> {
  const response = await api.get("/voies");

  return response.data;
}

/**
 * Récupérer une voie par son identifiant.
 */
export async function getVoie(
  id: number,
): Promise<Voie> {
  const response = await api.get(`/voies/${id}`);

  return response.data;
}

/**
 * Récupérer les voies d'un terrain.
 */
export async function getVoiesByTerrain(
  terrainId: number,
): Promise<Voie[]> {
  const response = await api.get(
    `/voies/terrain/${terrainId}`,
  );

  return response.data;
}

/**
 * Créer une voie physique.
 *
 * Une même voie peut être associée à plusieurs blocs.
 */
export async function createVoie(
  data: CreateVoieData,
): Promise<Voie> {
  const response = await api.post(
    "/voies",
    data,
  );

  return response.data;
}

/**
 * Modifier une voie.
 *
 * Si `blocs` est fourni, les associations sont
 * remplacées par celles envoyées.
 */
export async function updateVoie(
  id: number,
  data: UpdateVoieData,
): Promise<Voie> {
  const response = await api.patch(
    `/voies/${id}`,
    data,
  );

  return response.data;
}

/**
 * Supprimer une voie physique.
 */
export async function deleteVoie(
  id: number,
): Promise<void> {
  await api.delete(`/voies/${id}`);
}