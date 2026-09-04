import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

/* ============================================================
   TYPES DE RÉSULTATS
============================================================ */

export type TypeRecherche =
  | 'PARCELLE'
  | 'TERRAIN'
  | 'BLOC'
  | 'SECTION'
  | 'FAMILLE_FONCIERE'
  | 'ACQUEREUR'
  | 'PROPRIETAIRE';

export interface ResultatRecherche {
  id: number;
  type: TypeRecherche;
  titre: string;
  sousTitre?: string;
  description?: string;
  url: string;
}

/* ============================================================
   SERVICE
============================================================ */

@Injectable()
export class RechercheService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================
  // GARANTIT TOUJOURS UNE CHAÎNE POUR LES TITRES
  // ============================================================

  private titreSecurise(
    valeur: string | null | undefined,
    valeurSecours: string,
  ): string {
    const texte = valeur?.trim();

    return texte || valeurSecours;
  }

  // ============================================================
  // RECHERCHE GLOBALE
  // ============================================================

  async rechercher(
    terme: string,
  ): Promise<ResultatRecherche[]> {
    const recherche = terme?.trim();

    if (
      !recherche ||
      recherche.length < 2
    ) {
      return [];
    }

    const limiteParCategorie = 10;

    // ==========================================================
    // PARCELLES
    // ==========================================================

    const parcelles =
      await this.prisma.parcelle.findMany({
        where: {
          OR: [
            {
              reference: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              numero: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
          ],
        },

        include: {
          bloc: {
            include: {
              section: {
                include: {
                  terrain: true,
                },
              },
            },
          },

          proprietaire: true,
        },

        take: limiteParCategorie,

        orderBy: {
          reference: 'asc',
        },
      });

    // ==========================================================
    // TERRAINS
    // ==========================================================

    const terrains =
      await this.prisma.terrain.findMany({
        where: {
          OR: [
            {
              reference: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              nom: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              localisation: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
          ],
        },

        take: limiteParCategorie,

        orderBy: {
          reference: 'asc',
        },
      });

    // ==========================================================
    // BLOCS
    // ==========================================================

    const blocs =
      await this.prisma.bloc.findMany({
        where: {
          reference: {
            contains: recherche,
            mode: 'insensitive',
          },
        },

        include: {
          section: {
            include: {
              terrain: true,
            },
          },
        },

        take: limiteParCategorie,

        orderBy: {
          reference: 'asc',
        },
      });

    // ==========================================================
    // SECTIONS
    // ==========================================================

    const sections =
      await this.prisma.section.findMany({
        where: {
          OR: [
            {
              reference: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              nom: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
          ],
        },

        include: {
          terrain: true,
        },

        take: limiteParCategorie,

        orderBy: {
          reference: 'asc',
        },
      });

    // ==========================================================
    // FAMILLES FONCIÈRES
    // ==========================================================

    const familles =
      await this.prisma.familleFonciere.findMany({
        where: {
          OR: [
            {
              nom: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              membres: {
                some: {
                  OR: [
                    {
                      nom: {
                        contains: recherche,
                        mode: 'insensitive',
                      },
                    },
                    {
                      prenom: {
                        contains: recherche,
                        mode: 'insensitive',
                      },
                    },
                    {
                      telephone: {
                        contains: recherche,
                        mode: 'insensitive',
                      },
                    },
                    {
                      email: {
                        contains: recherche,
                        mode: 'insensitive',
                      },
                    },
                    {
                      qualite: {
                        contains: recherche,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
            },
          ],
        },

        include: {
          terrain: true,

          membres: {
            orderBy: {
              nom: 'asc',
            },
          },
        },

        take: limiteParCategorie,

        orderBy: [
          {
            estPrincipale: 'desc',
          },
          {
            nom: 'asc',
          },
        ],
      });

    // ==========================================================
    // ACQUÉREURS
    // ==========================================================

    const acquereurs =
      await this.prisma.acquereur.findMany({
        where: {
          OR: [
            {
              nom: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              prenom: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              telephone: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              adresse: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
          ],
        },

        take: limiteParCategorie,

        orderBy: [
          {
            nom: 'asc',
          },
          {
            prenom: 'asc',
          },
        ],
      });

    // ==========================================================
    // PROPRIÉTAIRES
    // ==========================================================

    const proprietaires =
      await this.prisma.proprietaire.findMany({
        where: {
          OR: [
            {
              nom: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              prenom: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              telephone: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
            {
              adresse: {
                contains: recherche,
                mode: 'insensitive',
              },
            },
          ],
        },

        take: limiteParCategorie,

        orderBy: [
          {
            nom: 'asc',
          },
          {
            prenom: 'asc',
          },
        ],
      });

    // ==========================================================
    // CONSTRUCTION DES RÉSULTATS
    // ==========================================================

    const resultats: ResultatRecherche[] = [];

    // ==========================================================
    // PARCELLES
    // ==========================================================

    for (const parcelle of parcelles) {
      const bloc = parcelle.bloc;
      const section = bloc?.section;
      const terrain = section?.terrain;

      let sousTitre =
        `Parcelle ${parcelle.reference}`;

      if (bloc) {
        sousTitre +=
          ` • Bloc ${bloc.reference}`;
      }

      if (section) {
        sousTitre +=
          ` • Section ${section.reference}`;
      }

      if (terrain) {
        sousTitre +=
          ` • Terrain ${terrain.reference}`;
      }

      const proprietaire =
        parcelle.proprietaire;

      const nomProprietaire =
        proprietaire
          ? `${proprietaire.prenom ?? ''} ${proprietaire.nom ?? ''}`.trim()
          : '';

      resultats.push({
        id: parcelle.id,
        type: 'PARCELLE',
        titre: this.titreSecurise(
          parcelle.reference,
          `Parcelle ${parcelle.id}`,
        ),
        sousTitre,
        description:
          nomProprietaire
            ? `Propriétaire : ${nomProprietaire}`
            : 'Parcelle non attribuée',
        url:
          `/parcelles/${parcelle.id}`,
      });
    }

    // ==========================================================
    // TERRAINS
    // ==========================================================

    for (const terrain of terrains) {
      resultats.push({
        id: terrain.id,
        type: 'TERRAIN',
        titre: this.titreSecurise(
          terrain.nom,
          terrain.reference ||
            `Terrain ${terrain.id}`,
        ),
        sousTitre:
          terrain.reference,
        description:
          terrain.localisation ||
          `Superficie : ${terrain.superficie} m²`,
        url:
          `/terrains/${terrain.id}`,
      });
    }

    // ==========================================================
    // BLOCS
    // ==========================================================

    for (const bloc of blocs) {
      const section =
        bloc.section;

      const terrain =
        section?.terrain;

      let sousTitre:
        string | undefined =
        section
          ? `Section ${section.reference}`
          : undefined;

      if (terrain) {
        sousTitre =
          `${sousTitre ?? ''} • Terrain ${terrain.reference}`.trim();
      }

      resultats.push({
        id: bloc.id,
        type: 'BLOC',
        titre: this.titreSecurise(
          bloc.reference,
          `Bloc ${bloc.id}`,
        ),
        sousTitre,
        description:
          `${bloc.nombreParcelles} parcelle(s) • ${bloc.superficie} m²`,
        url:
          `/blocs/${bloc.id}`,
      });
    }

    // ==========================================================
    // SECTIONS
    // ==========================================================

    for (const section of sections) {
      resultats.push({
        id: section.id,
        type: 'SECTION',
        titre: this.titreSecurise(
          section.nom,
          section.reference ||
            `Section ${section.id}`,
        ),
        sousTitre:
          section.reference,
        description:
          section.terrain
            ? `Terrain : ${section.terrain.reference} • ${section.superficie} m²`
            : `${section.superficie} m²`,
        url:
          `/sections/${section.id}`,
      });
    }

    // ==========================================================
    // FAMILLES FONCIÈRES
    // ==========================================================

    for (const famille of familles) {
      const nombreMembres =
        famille.membres.length;

      const membresTexte =
        nombreMembres === 1
          ? '1 membre'
          : `${nombreMembres} membres`;

      resultats.push({
        id: famille.id,
        type:
          'FAMILLE_FONCIERE',
        titre: this.titreSecurise(
          famille.nom,
          `Famille ${famille.id}`,
        ),
        sousTitre:
          famille.estPrincipale
            ? 'Famille principale'
            : 'Famille foncière',
        description:
          famille.terrain
            ? `${membresTexte} • Terrain : ${famille.terrain.reference}`
            : membresTexte,
        url:
          `/familles-foncieres/${famille.id}`,
      });
    }

    // ==========================================================
    // ACQUÉREURS
    // ==========================================================

    for (const acquereur of acquereurs) {
      const prenom =
        acquereur.prenom ?? '';

      const nom =
        acquereur.nom ?? '';

      const nomComplet =
        `${prenom} ${nom}`.trim();

      resultats.push({
        id: acquereur.id,
        type:
          'ACQUEREUR',
        titre: this.titreSecurise(
          nomComplet,
          `Acquéreur ${acquereur.id}`,
        ),
        sousTitre:
          'Acquéreur',
        description:
          acquereur.telephone ||
          acquereur.email ||
          acquereur.adresse ||
          undefined,
        url:
          `/acquereurs/${acquereur.id}`,
      });
    }

    // ==========================================================
    // PROPRIÉTAIRES
    // ==========================================================

    for (const proprietaire of proprietaires) {
      const prenom =
        proprietaire.prenom ?? '';

      const nom =
        proprietaire.nom ?? '';

      const nomComplet =
        `${prenom} ${nom}`.trim();

      resultats.push({
        id: proprietaire.id,
        type:
          'PROPRIETAIRE',
        titre: this.titreSecurise(
          nomComplet,
          `Propriétaire ${proprietaire.id}`,
        ),
        sousTitre:
          'Propriétaire',
        description:
          proprietaire.telephone ||
          proprietaire.email ||
          proprietaire.adresse ||
          undefined,
        url:
          `/proprietaires/${proprietaire.id}`,
      });
    }

    // ==========================================================
    // LIMITE GLOBALE
    // ==========================================================

    return resultats.slice(
      0,
      20,
    );
  }
}