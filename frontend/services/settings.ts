import { apiRequest } from "./api";

export interface Setting {
  id: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryUser {
  id: number;
  name: string;
  email?: string;
  role?: string;
}

export interface HistoryItem {
  id: number;
  action: string;
  module: string;
  description: string;
  utilisateurId: number | null;
  createdAt: string;
  User: HistoryUser | null;
}

export async function getSetting(
  key: string,
): Promise<Setting> {
  return apiRequest(`/settings/${key}`);
}

export async function updateSetting(
  key: string,
  value: string,
): Promise<Setting> {
  return apiRequest(`/settings/${key}`, {
    method: "PATCH",
    body: JSON.stringify({
      value,
    }),
  });
}

export async function getHistory(): Promise<HistoryItem[]> {
  return apiRequest("/settings/history");
}

export async function getRecentHistory(
  limit = 20,
): Promise<HistoryItem[]> {
  return apiRequest(
    `/settings/history/recent?limit=${limit}`,
  );
}