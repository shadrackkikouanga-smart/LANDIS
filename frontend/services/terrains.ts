import { apiRequest } from "./api";

export async function getTerrains() {
  return apiRequest("/terrains", {
    method: "GET",
  });
}

export async function getTerrain(id: number) {
  return apiRequest(`/terrains/${id}`, {
    method: "GET",
  });
}

export async function createTerrain(data: {
  reference: string;
  nom: string;
  superficie: number;
  localisation?: string;
  statut?: string;
  projectId: number;
}) {
  return apiRequest("/terrains", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTerrain(
  id: number,
  data: {
    reference?: string;
    nom?: string;
    superficie?: number;
    localisation?: string;
    statut?: string;
    projectId?: number;
  },
) {
  return apiRequest(`/terrains/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTerrain(id: number) {
  return apiRequest(`/terrains/${id}`, {
    method: "DELETE",
  });
}