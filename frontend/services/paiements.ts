import { apiRequest } from "./api";

export interface Paiement {
  id: number;
  numeroRecu: string;
  transactionId: number;
  montant: number;
  modePaiement: string;
  reference?: string | null;
  commentaire?: string | null;
  datePaiement: string;
  createdAt: string;
  updatedAt: string;
  transaction?: any;
}

export interface CreatePaiementData {
  transactionId: number;
  montant: number;
  modePaiement: string;
  reference?: string;
  commentaire?: string;
}

export async function getPaiements(): Promise<Paiement[]> {
  return apiRequest("/paiements", {
    method: "GET",
  });
}

export async function getPaiement(
  id: number,
): Promise<Paiement> {
  return apiRequest(`/paiements/${id}`, {
    method: "GET",
  });
}

export async function getPaiementsByTransaction(
  transactionId: number,
) {
  return apiRequest(
    `/paiements/transaction/${transactionId}`,
    {
      method: "GET",
    },
  );
}

export async function createPaiement(
  data: CreatePaiementData,
) {
  return apiRequest("/paiements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePaiement(
  id: number,
  data: Partial<CreatePaiementData>,
) {
  return apiRequest(`/paiements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deletePaiement(
  id: number,
) {
  return apiRequest(`/paiements/${id}`, {
    method: "DELETE",
  });
}

export function getPaiementPdfUrl(id: number) {
  return `${process.env.NEXT_PUBLIC_API_URL}/paiements/${id}/pdf`;
}