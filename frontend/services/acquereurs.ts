import api from "@/lib/api";

export interface Transaction {
  id: number;
  parcelleId: number;
  acquereurId: number;
  montant?: number;
  statut?: string;
  parcelle?: {
    id: number;
    reference: string;
    numero: string;
    superficie: number;
    statut: string;
  };
}

export interface Acquereur {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse?: string;
  createdAt?: string;
  updatedAt?: string;
  transactions?: Transaction[];
}

export interface CreateAcquereurData {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse?: string;
}

export type UpdateAcquereurData =
  Partial<CreateAcquereurData>;

export async function getAcquereurs(): Promise<
  Acquereur[]
> {
  const response =
    await api.get<Acquereur[]>("/acquereurs");

  return response.data;
}

export async function getAcquereur(
  id: number,
): Promise<Acquereur> {
  const response =
    await api.get<Acquereur>(
      `/acquereurs/${id}`,
    );

  return response.data;
}

export async function createAcquereur(
  data: CreateAcquereurData,
): Promise<Acquereur> {
  const response =
    await api.post<Acquereur>(
      "/acquereurs",
      data,
    );

  return response.data;
}

export async function updateAcquereur(
  id: number,
  data: UpdateAcquereurData,
): Promise<Acquereur> {
  const response =
    await api.patch<Acquereur>(
      `/acquereurs/${id}`,
      data,
    );

  return response.data;
}

export async function deleteAcquereur(
  id: number,
): Promise<void> {
  await api.delete(`/acquereurs/${id}`);
}