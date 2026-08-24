import api from "@/lib/api";

export interface Parcelle {
  id: number;
  reference: string;
  numero: string;
  superficie: number;
  statut: string;
  blocId: number;
  proprietaireId: number | null;
}

export interface Proprietaire {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string | null;
  adresse?: string | null;
  createdAt?: string;
  updatedAt?: string;
  parcelles?: Parcelle[];
}

export interface CreateProprietaireData {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse?: string;
}

export interface UpdateProprietaireData {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}

export async function getProprietaires(): Promise<Proprietaire[]> {
  const response = await api.get("/proprietaires");

  return response.data;
}

export async function getProprietaire(
  id: number,
): Promise<Proprietaire> {
  const response = await api.get(
    `/proprietaires/${id}`,
  );

  return response.data;
}

export async function createProprietaire(
  data: CreateProprietaireData,
): Promise<Proprietaire> {
  const response = await api.post(
    "/proprietaires",
    data,
  );

  return response.data;
}

export async function updateProprietaire(
  id: number,
  data: UpdateProprietaireData,
): Promise<Proprietaire> {
  const response = await api.patch(
    `/proprietaires/${id}`,
    data,
  );

  return response.data;
}

export async function deleteProprietaire(
  id: number,
): Promise<void> {
  await api.delete(`/proprietaires/${id}`);
}