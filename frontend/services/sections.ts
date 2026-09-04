export interface Terrain {
  id: number;
  reference: string;
  nom: string;
  superficie: number;
}

export interface Parcelle {
  id: number;
  reference?: string;
  numero?: string;
  superficie?: number;
  blocId?: number;
  proprietaireId?: number | null;
}

export interface Bloc {
  id: number;
  reference: string;
  superficie: number;
  nombreParcelles: number;
  parcelles?: Parcelle[];
}

export interface Section {
  id: number;
  reference: string;
  nom: string;
  superficie: number;
  terrainId: number;
  terrain?: Terrain;
  blocs?: Bloc[];
  statistiques?: SectionStatistiques;
}

export interface SectionStatistiques {
  superficieSection: number;
  superficieBlocs: number;
  superficieRestante: number;
  nombreBlocs: number;
  nombreParcelles: number;
  nombreParcellesDeclarees: number;
  ecartParcelles: number;
  tauxOccupation: number;
}

export interface CreateSectionData {
  reference: string;
  nom: string;
  superficie: number;
  terrainId: number;
}

export interface UpdateSectionData {
  reference?: string;
  nom?: string;
  superficie?: number;
  terrainId?: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

export async function getSections(): Promise<Section[]> {
  const response = await fetch(
    `${API_URL}/sections`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de charger les sections.",
    );
  }

  return response.json();
}

export async function getSectionsByTerrain(
  terrainId: number,
): Promise<Section[]> {
  const response = await fetch(
    `${API_URL}/sections/terrain/${terrainId}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de charger les sections du terrain.",
    );
  }

  return response.json();
}

export async function getSection(
  id: number,
): Promise<Section> {
  const response = await fetch(
    `${API_URL}/sections/${id}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de charger la section.",
    );
  }

  return response.json();
}

export async function createSection(
  data: CreateSectionData,
): Promise<Section> {
  const response = await fetch(
    `${API_URL}/sections`,
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
        "Impossible de créer la section.",
    );
  }

  return response.json();
}

export async function updateSection(
  id: number,
  data: UpdateSectionData,
): Promise<Section> {
  const response = await fetch(
    `${API_URL}/sections/${id}`,
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
        "Impossible de modifier la section.",
    );
  }

  return response.json();
}

export async function deleteSection(
  id: number,
): Promise<Section> {
  const response = await fetch(
    `${API_URL}/sections/${id}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de supprimer la section.",
    );
  }

  return response.json();
}