import { apiRequest } from "./api";

export async function getProjects() {
  return apiRequest("/projects", {
    method: "GET",
  });
}

export async function getProject(id: number) {
  return apiRequest(`/projects/${id}`, {
    method: "GET",
  });
}

export async function createProject(data: {
  name: string;
  reference: string;
  description?: string;
  location?: string;
  area: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  return apiRequest("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProject(
  id: number,
  data: {
    name?: string;
    reference?: string;
    description?: string;
    location?: string;
    area?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  },
) {
  return apiRequest(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: number) {
  return apiRequest(`/projects/${id}`, {
    method: "DELETE",
  });
}