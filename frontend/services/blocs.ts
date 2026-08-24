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

export interface Bloc {
  id: number;
  reference: string;
  superficie: number;
  nombreParcelles: number;
  terrainId: number;
  terrain?: Terrain;
  parcelles?: Parcelle[];

  statistiques?: BlocStatistiques;
}

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
}

export interface CreateBlocData {
  reference: string;
  superficie: number;
  nombreParcelles: number;
  terrainId: number;
}

export interface UpdateBlocData {
  reference?: string;
  superficie?: number;
  terrainId?: number;
}

export interface BlocStatisticsResponse {
  blocId: number;
  reference: string;
  superficie: number;
  nombreDeclareDansBloc: number;
  nombreReelParcelles: number;
  anomalie: {
    existe: boolean;
    difference?: number;
    message?: string;
  };
  parcellesAttribuees: number;
  parcellesDisponibles: number;
  tauxOccupation: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export async function getBlocs(): Promise<Bloc[]> {
  const response = await fetch(
    `${API_URL}/blocs`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de charger les blocs.",
    );
  }

  return response.json();
}

export async function getBloc(
  id: number,
): Promise<Bloc> {
  const response = await fetch(
    `${API_URL}/blocs/${id}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de charger le bloc.",
    );
  }

  return response.json();
}

export async function getBlocStatistics(
  id: number,
): Promise<BlocStatisticsResponse> {
  const response = await fetch(
    `${API_URL}/blocs/${id}/statistiques`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de charger les statistiques du bloc.",
    );
  }

  return response.json();
}

export async function createBloc(
  data: CreateBlocData,
): Promise<Bloc> {
  const response = await fetch(
    `${API_URL}/blocs/complet`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      message ||
        "Impossible de créer le bloc.",
    );
  }

  return response.json();
}

export async function updateBloc(
  id: number,
  data: UpdateBlocData,
): Promise<Bloc> {
  const response = await fetch(
    `${API_URL}/blocs/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      message ||
        "Impossible de modifier le bloc.",
    );
  }

  return response.json();
}

export async function deleteBloc(
  id: number,
): Promise<Bloc> {
  const response = await fetch(
    `${API_URL}/blocs/${id}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      message ||
        "Impossible de supprimer le bloc.",
    );
  }

  return response.json();
}

export async function ajouterParcelles(
  id: number,
  nombre: number,
): Promise<Bloc> {
  const response = await fetch(
    `${API_URL}/blocs/${id}/ajouter-parcelles/${nombre}`,
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      message ||
        "Impossible d'ajouter les parcelles.",
    );
  }

  return response.json();
}

export async function reduireParcelles(
  id: number,
  nombre: number,
): Promise<Bloc> {
  const response = await fetch(
    `${API_URL}/blocs/${id}/reduire-parcelles/${nombre}`,
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      message ||
        "Impossible de réduire les parcelles.",
    );
  }

  return response.json();
}

export async function getTerrains(): Promise<
  Terrain[]
> {
  const response = await fetch(
    `${API_URL}/terrains`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de charger les terrains.",
    );
  }

  return response.json();
}