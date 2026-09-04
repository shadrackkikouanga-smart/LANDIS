export type SituationRecensement =
  | "VENDUE"
  | "DONNEE"
  | "PRISE_ANARCHIQUEMENT"
  | "A_VERIFIER"
  | "AUTRE";

export interface RecensementDocument {
  id: number;
  recensementId: number;
  typeDocument: string;
  reference?: string | null;
  dateDocument?: string | null;
  observations?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecensementSignataire {
  id: number;
  recensementId: number;
  nom: string;
  prenom: string;
  qualite?: string | null;
  fonction?: string | null;
  observations?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecensementAutoriteEtat {
  id: number;
  recensementId: number;
  nom: string;
  prenom?: string | null;
  fonction: string;
  institution?: string | null;
  telephone?: string | null;
  observations?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FamilleFonciere {
  id: number;
  nom: string;
  description?: string | null;
  estPrincipale: boolean;
  active: boolean;
  terrainId: number;
}

export interface MembreFamilleFonciere {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  qualite: string;
  observations?: string | null;
  familleId: number;
}

export interface ParcelleRecensement {
  id: number;
  reference: string;
  numero: string;
  superficie: number;
  statut: string;

  bloc?: {
    id: number;
    reference: string;
    superficie: number;
  } | null;

  section?: {
    id: number;
    reference: string;
    nom?: string | null;
  } | null;

  terrain?: {
    id: number;
    reference: string;
    nom: string;
    superficie: number;
  } | null;
}

export interface Recensement {
  id: number;

  parcelleId: number;
  parcelle?: ParcelleRecensement | null;

  situation: SituationRecensement;

  occupantNom?: string | null;
  occupantPrenom?: string | null;
  occupantTelephone?: string | null;
  occupantAdresse?: string | null;

  familleId?: number | null;
  famille?: FamilleFonciere | null;

  vendeurDonateurNom?: string | null;
  vendeurDonateurPrenom?: string | null;

  vendeurDonateurMembreId?: number | null;
  vendeurDonateurMembre?: MembreFamilleFonciere | null;

  vendeurDonateurQualite?: string | null;

  montantTotal?: number | string | null;
  montantPaye?: number | string | null;

  droitRevendique?: string | null;

  cooperative: boolean;

  observations?: string | null;

  documents?: RecensementDocument[];
  signataires?: RecensementSignataire[];
  autorites?: RecensementAutoriteEtat[];

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRecensementDocumentData {
  typeDocument: string;
  reference?: string;
  dateDocument?: string;
  observations?: string;
}

export interface CreateRecensementSignataireData {
  nom: string;
  prenom: string;
  qualite?: string;
  fonction?: string;
  observations?: string;
}

export interface CreateRecensementAutoriteData {
  nom: string;
  prenom?: string;
  fonction: string;
  institution?: string;
  telephone?: string;
  observations?: string;
}

export interface CreateRecensementData {
  parcelleId: number;
  situation: SituationRecensement;

  occupantNom?: string;
  occupantPrenom?: string;
  occupantTelephone?: string;
  occupantAdresse?: string;

  familleId?: number;

  vendeurDonateurNom?: string;
  vendeurDonateurPrenom?: string;
  vendeurDonateurMembreId?: number;
  vendeurDonateurQualite?: string;

  montantTotal?: number;
  montantPaye?: number;

  droitRevendique?: string;

  cooperative?: boolean;

  observations?: string;

  documents?: CreateRecensementDocumentData[];
  signataires?: CreateRecensementSignataireData[];
  autorites?: CreateRecensementAutoriteData[];
}

export interface UpdateRecensementData {
  parcelleId?: number;
  situation?: SituationRecensement;

  occupantNom?: string;
  occupantPrenom?: string;
  occupantTelephone?: string;
  occupantAdresse?: string;

  familleId?: number | null;

  vendeurDonateurNom?: string;
  vendeurDonateurPrenom?: string;
  vendeurDonateurMembreId?: number | null;
  vendeurDonateurQualite?: string;

  montantTotal?: number;
  montantPaye?: number;

  droitRevendique?: string;

  cooperative?: boolean;

  observations?: string;

  documents?: CreateRecensementDocumentData[];
  signataires?: CreateRecensementSignataireData[];
  autorites?: CreateRecensementAutoriteData[];
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || `Erreur HTTP ${response.status}`,
    );
  }

  return response.json();
}

/**
 * Récupérer tous les recensements.
 */
export async function getRecensements(): Promise<Recensement[]> {
  const response = await fetch(
    `${API_URL}/recensements`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<Recensement[]>(response);
}

/**
 * Récupérer les recensements d'une parcelle.
 */
export async function getRecensementsByParcelle(
  parcelleId: number,
): Promise<Recensement[]> {
  const response = await fetch(
    `${API_URL}/recensements/parcelle/${parcelleId}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<Recensement[]>(response);
}

/**
 * Récupérer un recensement.
 */
export async function getRecensement(
  id: number,
): Promise<Recensement> {
  const response = await fetch(
    `${API_URL}/recensements/${id}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<Recensement>(response);
}

/**
 * Créer un recensement.
 */
export async function createRecensement(
  data: CreateRecensementData,
): Promise<Recensement> {
  const response = await fetch(
    `${API_URL}/recensements`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  return handleResponse<Recensement>(response);
}

/**
 * Modifier un recensement.
 */
export async function updateRecensement(
  id: number,
  data: UpdateRecensementData,
): Promise<Recensement> {
  const response = await fetch(
    `${API_URL}/recensements/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  return handleResponse<Recensement>(response);
}

/**
 * Supprimer un recensement.
 */
export async function deleteRecensement(
  id: number,
): Promise<Recensement> {
  const response = await fetch(
    `${API_URL}/recensements/${id}`,
    {
      method: "DELETE",
    },
  );

  return handleResponse<Recensement>(response);
}