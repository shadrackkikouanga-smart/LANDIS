import { apiRequest } from "./api";

export interface HistoriqueUser {
  id: number;
  name: string;
  role?: string | null;
}

export interface Historique {
  id: number;
  action: string;
  module: string;
  description: string;
  createdAt: string;
  User?: HistoriqueUser | null;
}

export async function getRecentHistorique(
  limit = 10,
): Promise<Historique[]> {
  return apiRequest(
    `/settings/history/recent?limit=${limit}`,
  );
}