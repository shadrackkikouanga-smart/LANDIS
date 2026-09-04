const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/* ============================================================
 * TYPES
 * ============================================================ */

export type NiveauComparaison =
  | "COHERENT"
  | "A_VERIFIER"
  | "ANOMALIE";

export type SituationRecensement =
  | "VENDUE"
  | "DONNEE"
  | "PRISE_ANARCHIQUEMENT"
  | "A_VERIFIER"
  | "AUTRE";

export type StatutTransaction =
  | "EN_ATTENTE"
  | "VALIDEE"
  | string;

export interface ComparaisonOccupant {
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  adresse: string | null;
}

export interface ComparaisonFamille {
  id: number;
  nom: string;
  estPrincipale: boolean;
}

export interface ComparaisonVendeurDonateur {
  id: number | null;
  nom: string;
  prenom: string | null;
  qualite: string | null;
}

export interface ComparaisonRecensementData {
  id: number;
  situation: SituationRecensement;
  cooperative: boolean;

  occupant: ComparaisonOccupant;

  famille: ComparaisonFamille | null;

  vendeurDonateur:
    | ComparaisonVendeurDonateur
    | null;

  montantTotal: number | null;
  montantPaye: number | null;
}

export interface ComparaisonParcelle {
  id: number;
  reference: string;
  numero: string | null;
  superficie: number;
  statut: string;
  proprietaire: number | null;
}

export interface ComparaisonAcquereur {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
}

export interface ComparaisonTransactionActive {
  existe: boolean;
  transactionId: number | null;
  statut: StatutTransaction | null;
  type: string | null;

  acquereur: ComparaisonAcquereur | null;

  prix: number | null;
  totalPaye: number;
  resteAPayer: number;
}

export interface ComparaisonTransactions {
  nombre: number;
  nombreValidees: number;

  transactionActive:
    | ComparaisonTransactionActive
    | null;
}

export interface ComparaisonLandis {
  parcelle: ComparaisonParcelle;

  transactions: ComparaisonTransactions;
}

export interface ComparaisonResultat {
  niveau: NiveauComparaison;

  anomalies: string[];

  avertissements: string[];

  observations: string[];
}

export interface ComparaisonDocument {
  id: number;
  recensementId: number;
  typeDocument: string;
  reference: string | null;
  dateDocument: string | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComparaisonDocuments {
  nombre: number;
  documents: ComparaisonDocument[];
}

export interface ComparaisonSignataire {
  id: number;
  recensementId: number;
  nom: string;
  prenom: string;
  qualite: string | null;
  fonction: string | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComparaisonSignataires {
  nombre: number;
  signataires: ComparaisonSignataire[];
}

export interface ComparaisonAutoriteEtat {
  id: number;
  recensementId: number;
  nom: string;
  prenom: string | null;
  fonction: string;
  institution: string | null;
  telephone: string | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComparaisonAutorites {
  nombre: number;
  autorites: ComparaisonAutoriteEtat[];
}

export interface ComparaisonRecensement {
  recensement: ComparaisonRecensementData;

  landis: ComparaisonLandis;

  comparaison: ComparaisonResultat;

  documents: ComparaisonDocuments;

  signataires: ComparaisonSignataires;

  autorites: ComparaisonAutorites;
}

/* ============================================================
 * GESTION DES RÉPONSES HTTP
 * ============================================================ */

async function handleResponse<T>(
  response: Response,
): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    let message =
      `Erreur HTTP ${response.status}`;

    if (text) {
      try {
        const data = JSON.parse(text);

        if (typeof data?.message === "string") {
          message = data.message;
        } else if (Array.isArray(data?.message)) {
          message = data.message.join(", ");
        } else if (typeof data === "string") {
          message = data;
        }
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      "La réponse du serveur n'est pas un JSON valide.",
    );
  }
}

/* ============================================================
 * COMPARER TOUS LES RECENSEMENTS
 * ============================================================ */

/**
 * Compare tous les recensements avec les données
 * commerciales et foncières de LANDIS.
 */
export async function getComparaisonsRecensements(): Promise<
  ComparaisonRecensement[]
> {
  const response = await fetch(
    `${API_URL}/recensements/comparaison`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<
    ComparaisonRecensement[]
  >(response);
}

/* ============================================================
 * COMPARER UN RECENSEMENT
 * ============================================================ */

/**
 * Compare un recensement précis avec les données LANDIS.
 */
export async function getComparaisonRecensement(
  recensementId: number,
): Promise<ComparaisonRecensement> {
  if (
    !Number.isInteger(recensementId) ||
    recensementId <= 0
  ) {
    throw new Error(
      "Identifiant de recensement invalide.",
    );
  }

  const response = await fetch(
    `${API_URL}/recensements/${recensementId}/comparaison`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<ComparaisonRecensement>(
    response,
  );
}

/* ============================================================
 * COMPARER LE DERNIER RECENSEMENT D'UNE PARCELLE
 * ============================================================ */

/**
 * Compare le dernier recensement enregistré
 * pour une parcelle donnée.
 */
export async function getComparaisonParcelle(
  parcelleId: number,
): Promise<ComparaisonRecensement> {
  if (
    !Number.isInteger(parcelleId) ||
    parcelleId <= 0
  ) {
    throw new Error(
      "Identifiant de parcelle invalide.",
    );
  }

  const response = await fetch(
    `${API_URL}/recensements/comparaison/parcelle/${parcelleId}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<ComparaisonRecensement>(
    response,
  );
}