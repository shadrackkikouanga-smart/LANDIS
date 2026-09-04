const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SituationRecensement =
  | "VENDUE"
  | "DONNEE"
  | "PRISE_ANARCHIQUEMENT"
  | "A_VERIFIER"
  | "AUTRE";

export type NiveauAnomalie =
  | "COHERENT"
  | "A_VERIFIER"
  | "ANOMALIE"
  | string;

export interface RapportTerrain {
  id: number;
  reference: string;
  nom: string;
}

export interface RapportParcelle {
  id: number;
  reference: string;
  numero: string | null;
  superficie: number;
  situation?: SituationRecensement;
  statutLandis?: string;
}

export interface RapportOccupant {
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  adresse?: string | null;
}

export interface RapportVendeur {
  id: number | null;
  nom: string | null;
  prenom: string | null;
  qualite: string | null;
}

export interface RapportFamille {
  id: number;
  nom: string;
  estPrincipale?: boolean;
}

export interface RapportVente {
  recensementId: number;
  parcelle: RapportParcelle;
  occupant: RapportOccupant;
  vendeur: RapportVendeur;
  montantTotal: number;
  montantPaye: number;
  resteAPayer: number;
  nombreDocuments: number;
  nombreSignataires: number;
}

export interface RapportVentesFamille {
  familleId: number;
  famille: string;
  terrain: RapportTerrain;
  nombreVentes: number;
  montantTotal: number;
  montantPaye: number;
  resteAPayer: number;
  ventes: RapportVente[];
}

export interface RapportDon {
  recensementId: number;
  famille: RapportFamille | null;
  terrain: RapportTerrain;
  parcelle: RapportParcelle;
  occupant: RapportOccupant;
  donateur: RapportVendeur;
  nombreDocuments: number;
  nombreSignataires: number;
  observations: string | null;
}

export interface RapportPriseAnarchique {
  recensementId: number;
  terrain: RapportTerrain;
  parcelle: RapportParcelle;
  occupant: RapportOccupant;
  famille: {
    id: number;
    nom: string;
  } | null;
  droitRevendique: string | null;
  cooperative: boolean;
  nombreDocuments: number;
  nombreSignataires: number;
  nombreAutoritesEtat: number;
  observations: string | null;
}

export interface RapportDocument {
  id: number;
  recensementId: number;
  typeDocument: string;
  reference: string | null;
  dateDocument: string | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RapportSignataire {
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

export interface RapportAutoriteEtat {
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

export interface RapportPiecesRecensement {
  recensementId: number;
  terrain: RapportTerrain;
  parcelle: {
    id: number;
    reference: string;
    numero: string | null;
  };
  situation: SituationRecensement;
  famille: {
    id: number;
    nom: string;
  } | null;
  documents: RapportDocument[];
  signataires: RapportSignataire[];
  autorites: RapportAutoriteEtat[];
}

export interface RapportAnomalie {
  recensementId: number;
  niveau: NiveauAnomalie;
  anomalies: string[];
  avertissements: string[];
  observations: string[];
}

export interface RapportSynthese {
  terrainId: number | null;
  totalRecensements: number;

  situations: {
    vendues: number;
    donnees: number;
    prisesAnarchiquement: number;
    aVerifier: number;
    autres: number;
  };

  cooperation: {
    cooperatives: number;
    nonCooperatives: number;
  };

  finances: {
    montantTotal: number;
    montantPaye: number;
    resteAPayer: number;
  };

  parcelles: Array<{
    recensementId: number;
    parcelleId: number;
    reference: string;
    numero: string | null;
    superficie: number;
    situation: SituationRecensement;
    occupantNom: string | null;
    occupantPrenom: string | null;
    terrain: RapportTerrain;
  }>;
}

export interface RapportVentes {
  terrainId: number | null;
  nombreFamilles: number;
  familles: RapportVentesFamille[];
}

export interface RapportDons {
  terrainId: number | null;
  nombreDons: number;
  dons: RapportDon[];
}

export interface RapportPrisesAnarchiques {
  terrainId: number | null;
  nombrePrisesAnarchiques: number;
  occupations: RapportPriseAnarchique[];
}

export interface RapportPiecesEtAutorites {
  terrainId: number | null;
  recensements: RapportPiecesRecensement[];
}

export interface RapportAnomalies {
  terrainId: number | null;
  nombreProblemes: number;
  resultats: RapportAnomalie[];
}

export interface RapportGlobal {
  terrainId: number | null;
  genereLe: string;

  synthese: RapportSynthese;
  ventesParFamille: RapportVentes;
  donsParFamille: RapportDons;
  prisesAnarchiques: RapportPrisesAnarchiques;
  piecesEtAutorites: RapportPiecesEtAutorites;
  anomalies: RapportAnomalies;
}

/* -------------------------------------------------------------------------- */
/* Utilitaires                                                                */
/* -------------------------------------------------------------------------- */

async function handleResponse<T>(
  response: Response,
): Promise<T> {
  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || `Erreur HTTP ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

function buildUrl(
  endpoint: string,
  terrainId?: number,
) {
  const url = new URL(
    `${API_URL}${endpoint}`,
  );

  if (
    terrainId !== undefined &&
    terrainId !== null
  ) {
    url.searchParams.set(
      "terrainId",
      String(terrainId),
    );
  }

  return url.toString();
}

/* -------------------------------------------------------------------------- */
/* Rapports                                                                   */
/* -------------------------------------------------------------------------- */

export async function getRapportSynthese(
  terrainId?: number,
): Promise<RapportSynthese> {
  const response = await fetch(
    buildUrl(
      "/recensements/rapports/synthese",
      terrainId,
    ),
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<RapportSynthese>(
    response,
  );
}

export async function getRapportVentes(
  terrainId?: number,
): Promise<RapportVentes> {
  const response = await fetch(
    buildUrl(
      "/recensements/rapports/ventes",
      terrainId,
    ),
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<RapportVentes>(
    response,
  );
}

export async function getRapportDons(
  terrainId?: number,
): Promise<RapportDons> {
  const response = await fetch(
    buildUrl(
      "/recensements/rapports/dons",
      terrainId,
    ),
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<RapportDons>(
    response,
  );
}

export async function getRapportPrisesAnarchiques(
  terrainId?: number,
): Promise<RapportPrisesAnarchiques> {
  const response = await fetch(
    buildUrl(
      "/recensements/rapports/prises-anarchiques",
      terrainId,
    ),
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<RapportPrisesAnarchiques>(
    response,
  );
}

export async function getRapportPiecesEtAutorites(
  terrainId?: number,
): Promise<RapportPiecesEtAutorites> {
  const response = await fetch(
    buildUrl(
      "/recensements/rapports/pieces",
      terrainId,
    ),
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<RapportPiecesEtAutorites>(
    response,
  );
}

export async function getRapportAnomalies(
  terrainId?: number,
): Promise<RapportAnomalies> {
  const response = await fetch(
    buildUrl(
      "/recensements/rapports/anomalies",
      terrainId,
    ),
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<RapportAnomalies>(
    response,
  );
}

export async function getRapportGlobal(
  terrainId?: number,
): Promise<RapportGlobal> {
  const response = await fetch(
    buildUrl(
      "/recensements/rapports/global",
      terrainId,
    ),
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<RapportGlobal>(
    response,
  );
}

export async function verifierTerrainRapport(
  terrainId: number,
): Promise<RapportTerrain> {
  const response = await fetch(
    `${API_URL}/recensements/rapports/terrain/${terrainId}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return handleResponse<RapportTerrain>(
    response,
  );
}