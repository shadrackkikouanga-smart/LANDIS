export type TypeDroitFamille =
  | "VENDRE"
  | "DONNER"
  | "AUTRE";

export interface Terrain {
  id: number;
  reference: string;
  nom: string;
  superficie: number;
}

export interface MembreFamilleFonciere {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  qualite: string;
  observations?: string | null;
  familleId: number;
  createdAt?: string;
  updatedAt?: string;
  famille?: FamilleFonciere;
  droits?: DroitFamilleFonciere[];
}

export interface DroitFamilleFonciere {
  id: number;
  type: TypeDroitFamille;
  description?: string | null;
  actif: boolean;
  familleId: number;
  membreId?: number | null;
  createdAt?: string;
  updatedAt?: string;
  famille?: FamilleFonciere;
  membre?: MembreFamilleFonciere | null;
}

export interface FamilleFonciere {
  id: number;
  nom: string;
  description?: string | null;
  estPrincipale: boolean;
  active: boolean;
  terrainId: number;
  terrain?: Terrain;
  membres?: MembreFamilleFonciere[];
  droits?: DroitFamilleFonciere[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFamilleFonciereData {
  nom: string;
  description?: string;
  estPrincipale?: boolean;
  active?: boolean;
  terrainId: number;
}

export interface UpdateFamilleFonciereData {
  nom?: string;
  description?: string;
  estPrincipale?: boolean;
  active?: boolean;
  terrainId?: number;
}

export interface CreateMembreFamilleData {
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  qualite: string;
  observations?: string;
}

export interface UpdateMembreFamilleData {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  qualite?: string;
  observations?: string;
}

export interface CreateDroitFamilleData {
  type: TypeDroitFamille;
  description?: string;
  actif?: boolean;
  membreId?: number;
}

export interface UpdateDroitFamilleData {
  type?: TypeDroitFamille;
  description?: string;
  actif?: boolean;
  membreId?: number | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

/**
 * Récupère toutes les familles foncières.
 */
export async function getFamillesFoncieres(): Promise<
  FamilleFonciere[]
> {
  const response = await fetch(
    `${API_URL}/familles-foncieres`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de charger les familles foncières.",
    );
  }

  return response.json();
}

/**
 * Récupère les familles foncières d'un terrain.
 */
export async function getFamillesFoncieresByTerrain(
  terrainId: number,
): Promise<FamilleFonciere[]> {
  const response = await fetch(
    `${API_URL}/familles-foncieres/terrain/${terrainId}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de charger les familles foncières du terrain.",
    );
  }

  return response.json();
}

/**
 * Récupère une famille foncière.
 */
export async function getFamilleFonciere(
  id: number,
): Promise<FamilleFonciere> {
  const response = await fetch(
    `${API_URL}/familles-foncieres/${id}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de charger la famille foncière.",
    );
  }

  return response.json();
}

/**
 * Crée une famille foncière.
 */
export async function createFamilleFonciere(
  data: CreateFamilleFonciereData,
): Promise<FamilleFonciere> {
  const response = await fetch(
    `${API_URL}/familles-foncieres`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Impossible de créer la famille foncière.",
    );
  }

  return response.json();
}

/**
 * Modifie une famille foncière.
 */
export async function updateFamilleFonciere(
  id: number,
  data: UpdateFamilleFonciereData,
): Promise<FamilleFonciere> {
  const response = await fetch(
    `${API_URL}/familles-foncieres/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Impossible de modifier la famille foncière.",
    );
  }

  return response.json();
}

/**
 * Supprime une famille foncière.
 */
export async function deleteFamilleFonciere(
  id: number,
): Promise<FamilleFonciere> {
  const response = await fetch(
    `${API_URL}/familles-foncieres/${id}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de supprimer la famille foncière.",
    );
  }

  return response.json();
}

/**
 * Ajoute un membre à une famille foncière.
 */
export async function createMembreFamille(
  familleId: number,
  data: CreateMembreFamilleData,
): Promise<MembreFamilleFonciere> {
  const response = await fetch(
    `${API_URL}/familles-foncieres/${familleId}/membres`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Impossible d'ajouter le membre à la famille.",
    );
  }

  return response.json();
}

/**
 * Modifie un membre d'une famille foncière.
 */
export async function updateMembreFamille(
  membreId: number,
  data: UpdateMembreFamilleData,
): Promise<MembreFamilleFonciere> {
  const response = await fetch(
    `${API_URL}/familles-foncieres/membres/${membreId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Impossible de modifier le membre.",
    );
  }

  return response.json();
}

/**
 * Supprime un membre d'une famille foncière.
 */
export async function deleteMembreFamille(
  membreId: number,
): Promise<MembreFamilleFonciere> {
  const response = await fetch(
    `${API_URL}/familles-foncieres/membres/${membreId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de supprimer le membre.",
    );
  }

  return response.json();
}

/**
 * Ajoute un droit à une famille foncière.
 *
 * Le membreId est facultatif :
 * - absent : droit général de la famille ;
 * - présent : droit attribué à un membre précis.
 */
export async function createDroitFamille(
  familleId: number,
  data: CreateDroitFamilleData,
): Promise<DroitFamilleFonciere> {
  const response = await fetch(
    `${API_URL}/familles-foncieres/${familleId}/droits`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Impossible d'ajouter le droit à la famille.",
    );
  }

  return response.json();
}

/**
 * Modifie un droit d'une famille foncière.
 */
export async function updateDroitFamille(
  droitId: number,
  data: UpdateDroitFamilleData,
): Promise<DroitFamilleFonciere> {
  const response = await fetch(
    `${API_URL}/familles-foncieres/droits/${droitId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message ||
        "Impossible de modifier le droit.",
    );
  }

  return response.json();
}

/**
 * Supprime un droit d'une famille foncière.
 */
export async function deleteDroitFamille(
  droitId: number,
): Promise<DroitFamilleFonciere> {
  const response = await fetch(
    `${API_URL}/familles-foncieres/droits/${droitId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de supprimer le droit.",
    );
  }

  return response.json();
}