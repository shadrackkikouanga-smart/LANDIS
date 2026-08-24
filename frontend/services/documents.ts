import { apiRequest } from "./api";

export async function getDocuments() {
  return apiRequest("/documents");
}

export async function getDocument(id: number) {
  return apiRequest(`/documents/${id}`);
}

export async function getDocumentsByTransaction(
  transactionId: number,
) {
  return apiRequest(
    `/documents/transaction/${transactionId}`,
  );
}

export async function deleteDocument(
  id: number,
) {
  return apiRequest(
    `/documents/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function createDocument(
  data: {
    type: string;
    transactionId: number;
    nomFichier: string;
    chemin?: string;
  },
) {
  return apiRequest(
    "/documents",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function getContractPdfUrl(
  transactionId: number,
) {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

  return `${API_URL}/documents/contrat/${transactionId}/pdf`;
}