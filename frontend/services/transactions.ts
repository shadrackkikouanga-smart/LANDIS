import api from "@/lib/api";

export type TypeTransaction =
  | "VENTE"
  | "LOCATION"
  | "RESERVATION";

export type StatutTransaction =
  | "EN_ATTENTE"
  | "VALIDEE"
  | "ANNULEE";

export type StatutPaiement =
  | "NON_PAYE"
  | "PARTIEL"
  | "PAYE";

export interface ParcelleTransaction {
  id: number;
  reference: string;
  numero: string;
  superficie: number;
  statut: string;
}

export interface AcquereurTransaction {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string | null;
  adresse?: string | null;
}

export interface PaiementTransaction {
  id: number;
  numeroRecu: string;
  transactionId: number;
  montant: number;
  modePaiement: string;
  datePaiement?: string;
}

export interface Transaction {
  id: number;

  parcelleId: number;
  acquereurId: number;

  type: TypeTransaction;

  statut: StatutTransaction;

  statutPaiement: StatutPaiement;

  prix: number | null;

  dateTransaction: string;

  createdAt: string;
  updatedAt: string;

  parcelle: ParcelleTransaction;
  acquereur: AcquereurTransaction;

  paiements: PaiementTransaction[];

  totalPaye: number;
  resteAPayer: number;
}

export interface CreateTransactionData {
  parcelleId: number;
  acquereurId: number;
  type: TypeTransaction;
  prix?: number;
}

export interface UpdateTransactionData {
  parcelleId?: number;
  acquereurId?: number;
  type?: TypeTransaction;
  prix?: number;
  statut?: StatutTransaction;
}

export async function getTransactions(): Promise<Transaction[]> {
  const response = await api.get("/transactions");

  return response.data;
}

export async function getTransaction(
  id: number,
): Promise<Transaction> {
  const response = await api.get(`/transactions/${id}`);

  return response.data;
}

export async function createTransaction(
  data: CreateTransactionData,
): Promise<Transaction> {
  const response = await api.post(
    "/transactions",
    data,
  );

  return response.data;
}

export async function updateTransaction(
  id: number,
  data: UpdateTransactionData,
): Promise<Transaction> {
  const response = await api.patch(
    `/transactions/${id}`,
    data,
  );

  return response.data;
}

export async function deleteTransaction(
  id: number,
): Promise<void> {
  await api.delete(`/transactions/${id}`);
}