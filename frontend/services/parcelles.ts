import api from "@/lib/api";

export interface Parcelle {
  id: number;
  reference: string;
  numero: string;
  superficie: number;
  statut: string;

  latitude?: number | null;
  longitude?: number | null;

  blocId: number;

  proprietaireId?: number | null;
  dateAttribution?: string | null;

  bloc?: {
    id: number;
    reference: string;
    superficie: number;
    nombreParcelles: number;
    terrainId: number;
  };

  proprietaire?: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    adresse?: string;
  } | null;
}

export interface CreateParcelleData {
  reference: string;
  numero: string;
  superficie: number;
  blocId: number;

  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateParcelleData {
  reference?: string;
  numero?: string;
  superficie?: number;
  blocId?: number;

  latitude?: number | null;
  longitude?: number | null;
}

export interface ParcellesPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ParcellesPaginatedResponse {
  data: Parcelle[];
  meta: ParcellesPagination;
}

export async function getParcelles(
  page = 1,
  limit = 20,
): Promise<ParcellesPaginatedResponse> {
  const response = await api.get(
    "/parcelles",
    {
      params: {
        page,
        limit,
      },
    },
  );

  return response.data;
}

export async function getParcelle(
  id: number,
): Promise<Parcelle> {
  const response = await api.get(
    `/parcelles/${id}`,
  );

  return response.data;
}

export async function createParcelle(
  data: CreateParcelleData,
): Promise<Parcelle> {
  const response = await api.post(
    "/parcelles",
    data,
  );

  return response.data;
}

export async function updateParcelle(
  id: number,
  data: UpdateParcelleData,
): Promise<Parcelle> {
  const response = await api.patch(
    `/parcelles/${id}`,
    data,
  );

  return response.data;
}

export async function deleteParcelle(
  id: number,
) {
  const response = await api.delete(
    `/parcelles/${id}`,
  );

  return response.data;
}

export async function attribuerParcelle(
  parcelleId: number,
  proprietaireId: number,
): Promise<Parcelle> {
  const response = await api.patch(
    `/parcelles/${parcelleId}/attribuer/${proprietaireId}`,
  );

  return response.data;
}

export async function updateParcelleCoordinates(
  id: number,
  latitude: number,
  longitude: number,
): Promise<Parcelle> {
  const response = await api.patch(
    `/parcelles/${id}/coordinates`,
    {
      latitude,
      longitude,
    },
  );

  return response.data;
}