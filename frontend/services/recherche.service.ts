const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

/* ============================================================
   TYPES
============================================================ */

export type TypeRecherche =
  | "PARCELLE"
  | "TERRAIN"
  | "BLOC"
  | "SECTION"
  | "FAMILLE_FONCIERE"
  | "ACQUEREUR"
  | "PROPRIETAIRE";

export interface RechercheResultat {
  id: number;
  type: TypeRecherche;
  titre: string;
  sousTitre?: string;
  description?: string;
  url: string;
}

/* ============================================================
   RECHERCHE GLOBALE
============================================================ */

export async function rechercher(
  terme: string,
): Promise<RechercheResultat[]> {
  const query =
    terme.trim();

  if (
    !query ||
    query.length < 2
  ) {
    return [];
  }

  const response =
    await fetch(
      `${API_URL}/recherche?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      message ||
        `Erreur HTTP ${response.status}`,
    );
  }

  const data =
    await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "Réponse de recherche invalide.",
    );
  }

  return data as RechercheResultat[];
}