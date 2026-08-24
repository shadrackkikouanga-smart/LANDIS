import { apiRequest } from "./api";


export interface Organization {

  id: number;

  name: string;

  email: string | null;

  telephone: string | null;

  adresse: string | null;

  ville: string | null;

  pays: string | null;

  logo: string | null;

  createdAt: string;

  updatedAt: string;

}



export async function getOrganization(): Promise<Organization> {

  return apiRequest(
    "/organization",
  );

}



export async function updateOrganization(
  data: Partial<Organization>,
): Promise<Organization> {

  return apiRequest(
    "/organization",
    {
      method: "PATCH",

      body: JSON.stringify(data),
    },
  );

}