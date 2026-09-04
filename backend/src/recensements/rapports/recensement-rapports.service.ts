import { Injectable, NotFoundException } from '@nestjs/common';
import { SituationRecensement } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { ComparaisonRecensementService } from '../comparaison/comparaison-recensement.service';

@Injectable()
export class RecensementRapportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly comparaisonService: ComparaisonRecensementService,
  ) {}

  /**
   * Synthèse générale du recensement.
   */
  async synthese(terrainId?: number) {
    const where = terrainId
      ? {
          parcelle: {
            bloc: {
              section: {
                terrainId,
              },
            },
          },
        }
      : {};

    const recensements = await this.prisma.recensement.findMany({
      where,
      include: {
        parcelle: {
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = recensements.length;

    const parSituation = {
      vendues: recensements.filter(
        (r) => r.situation === SituationRecensement.VENDUE,
      ).length,

      donnees: recensements.filter(
        (r) => r.situation === SituationRecensement.DONNEE,
      ).length,

      prisesAnarchiquement: recensements.filter(
        (r) => r.situation === SituationRecensement.PRISE_ANARCHIQUEMENT,
      ).length,

      aVerifier: recensements.filter(
        (r) => r.situation === SituationRecensement.A_VERIFIER,
      ).length,

      autres: recensements.filter(
        (r) => r.situation === SituationRecensement.AUTRE,
      ).length,
    };

    const cooperation = {
      cooperatives: recensements.filter((r) => r.cooperative).length,
      nonCooperatives: recensements.filter((r) => !r.cooperative).length,
    };

    const montantTotal = recensements.reduce(
      (total, recensement) =>
        total + Number(recensement.montantTotal ?? 0),
      0,
    );

    const montantPaye = recensements.reduce(
      (total, recensement) =>
        total + Number(recensement.montantPaye ?? 0),
      0,
    );

    return {
      terrainId: terrainId ?? null,
      totalRecensements: total,

      situations: parSituation,

      cooperation,

      finances: {
        montantTotal,
        montantPaye,
        resteAPayer: montantTotal - montantPaye,
      },

      parcelles: recensements.map((recensement) => ({
        recensementId: recensement.id,
        parcelleId: recensement.parcelle.id,
        reference: recensement.parcelle.reference,
        numero: recensement.parcelle.numero,
        superficie: recensement.parcelle.superficie,
        situation: recensement.situation,
        occupantNom: recensement.occupantNom,
        occupantPrenom: recensement.occupantPrenom,
        terrain: {
          id: recensement.parcelle.bloc.section.terrain.id,
          reference: recensement.parcelle.bloc.section.terrain.reference,
          nom: recensement.parcelle.bloc.section.terrain.nom,
        },
      })),
    };
  }

  /**
   * Rapport des ventes recensées par famille foncière.
   */
  async ventesParFamille(terrainId?: number) {
    const where = {
      situation: SituationRecensement.VENDUE,
      ...(terrainId
        ? {
            parcelle: {
              bloc: {
                section: {
                  terrainId,
                },
              },
            },
          }
        : {}),
    };

    const recensements = await this.prisma.recensement.findMany({
      where,
      include: {
        parcelle: {
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
          },
        },
        famille: true,
        vendeurDonateurMembre: {
          include: {
            famille: true,
          },
        },
        documents: true,
        signataires: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const familles = new Map<
      number,
      {
        familleId: number;
        famille: string;
        terrain: {
          id: number;
          reference: string;
          nom: string;
        };
        nombreVentes: number;
        montantTotal: number;
        montantPaye: number;
        resteAPayer: number;
        ventes: Array<{
          recensementId: number;
          parcelle: {
            id: number;
            reference: string;
            numero: string;
            superficie: number;
          };
          occupant: {
            nom: string | null;
            prenom: string | null;
            telephone: string | null;
          };
          vendeur: {
            id: number | null;
            nom: string | null;
            prenom: string | null;
            qualite: string | null;
          };
          montantTotal: number;
          montantPaye: number;
          resteAPayer: number;
          nombreDocuments: number;
          nombreSignataires: number;
        }>;
      }
    >();

    for (const recensement of recensements) {
      const famille = recensement.famille;

      if (!famille) {
        continue;
      }

      const terrain = recensement.parcelle.bloc.section.terrain;

      const montantTotal = Number(recensement.montantTotal ?? 0);
      const montantPaye = Number(recensement.montantPaye ?? 0);
      const resteAPayer = montantTotal - montantPaye;

      if (!familles.has(famille.id)) {
        familles.set(famille.id, {
          familleId: famille.id,
          famille: famille.nom,
          terrain: {
            id: terrain.id,
            reference: terrain.reference,
            nom: terrain.nom,
          },
          nombreVentes: 0,
          montantTotal: 0,
          montantPaye: 0,
          resteAPayer: 0,
          ventes: [],
        });
      }

      const rapportFamille = familles.get(famille.id)!;

      rapportFamille.nombreVentes += 1;
      rapportFamille.montantTotal += montantTotal;
      rapportFamille.montantPaye += montantPaye;
      rapportFamille.resteAPayer += resteAPayer;

      rapportFamille.ventes.push({
        recensementId: recensement.id,

        parcelle: {
          id: recensement.parcelle.id,
          reference: recensement.parcelle.reference,
          numero: recensement.parcelle.numero,
          superficie: recensement.parcelle.superficie,
        },

        occupant: {
          nom: recensement.occupantNom,
          prenom: recensement.occupantPrenom,
          telephone: recensement.occupantTelephone,
        },

        vendeur: {
          id: recensement.vendeurDonateurMembreId ?? null,
          nom:
            recensement.vendeurDonateurMembre?.nom ??
            recensement.vendeurDonateurNom ??
            null,
          prenom:
            recensement.vendeurDonateurMembre?.prenom ??
            recensement.vendeurDonateurPrenom ??
            null,
          qualite:
            recensement.vendeurDonateurMembre?.qualite ??
            recensement.vendeurDonateurQualite ??
            null,
        },

        montantTotal,
        montantPaye,
        resteAPayer,

        nombreDocuments: recensement.documents.length,
        nombreSignataires: recensement.signataires.length,
      });
    }

    return {
      terrainId: terrainId ?? null,
      nombreFamilles: familles.size,
      familles: Array.from(familles.values()),
    };
  }

  /**
   * Rapport des dons par famille foncière.
   */
  async donsParFamille(terrainId?: number) {
    const where = {
      situation: SituationRecensement.DONNEE,
      ...(terrainId
        ? {
            parcelle: {
              bloc: {
                section: {
                  terrainId,
                },
              },
            },
          }
        : {}),
    };

    const recensements = await this.prisma.recensement.findMany({
      where,
      include: {
        parcelle: {
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
          },
        },
        famille: true,
        vendeurDonateurMembre: true,
        documents: true,
        signataires: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      terrainId: terrainId ?? null,
      nombreDons: recensements.length,

      dons: recensements.map((recensement) => ({
        recensementId: recensement.id,

        famille: recensement.famille
          ? {
              id: recensement.famille.id,
              nom: recensement.famille.nom,
              estPrincipale: recensement.famille.estPrincipale,
            }
          : null,

        terrain: {
          id: recensement.parcelle.bloc.section.terrain.id,
          reference: recensement.parcelle.bloc.section.terrain.reference,
          nom: recensement.parcelle.bloc.section.terrain.nom,
        },

        parcelle: {
          id: recensement.parcelle.id,
          reference: recensement.parcelle.reference,
          numero: recensement.parcelle.numero,
          superficie: recensement.parcelle.superficie,
        },

        occupant: {
          nom: recensement.occupantNom,
          prenom: recensement.occupantPrenom,
          telephone: recensement.occupantTelephone,
        },

        donateur: {
          id: recensement.vendeurDonateurMembreId ?? null,
          nom:
            recensement.vendeurDonateurMembre?.nom ??
            recensement.vendeurDonateurNom ??
            null,
          prenom:
            recensement.vendeurDonateurMembre?.prenom ??
            recensement.vendeurDonateurPrenom ??
            null,
          qualite:
            recensement.vendeurDonateurMembre?.qualite ??
            recensement.vendeurDonateurQualite ??
            null,
        },

        nombreDocuments: recensement.documents.length,
        nombreSignataires: recensement.signataires.length,

        observations: recensement.observations,
      })),
    };
  }

  /**
   * Rapport des occupations anarchiques.
   */
  async prisesAnarchiques(terrainId?: number) {
    const where = {
      situation: SituationRecensement.PRISE_ANARCHIQUEMENT,
      ...(terrainId
        ? {
            parcelle: {
              bloc: {
                section: {
                  terrainId,
                },
              },
            },
          }
        : {}),
    };

    const recensements = await this.prisma.recensement.findMany({
      where,
      include: {
        parcelle: {
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
          },
        },
        famille: true,
        documents: true,
        signataires: true,
        autorites: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      terrainId: terrainId ?? null,
      nombrePrisesAnarchiques: recensements.length,

      occupations: recensements.map((recensement) => ({
        recensementId: recensement.id,

        terrain: {
          id: recensement.parcelle.bloc.section.terrain.id,
          reference: recensement.parcelle.bloc.section.terrain.reference,
          nom: recensement.parcelle.bloc.section.terrain.nom,
        },

        parcelle: {
          id: recensement.parcelle.id,
          reference: recensement.parcelle.reference,
          numero: recensement.parcelle.numero,
          superficie: recensement.parcelle.superficie,
          statutLandis: recensement.parcelle.statut,
        },

        occupant: {
          nom: recensement.occupantNom,
          prenom: recensement.occupantPrenom,
          telephone: recensement.occupantTelephone,
          adresse: recensement.occupantAdresse,
        },

        famille: recensement.famille
          ? {
              id: recensement.famille.id,
              nom: recensement.famille.nom,
            }
          : null,

        droitRevendique: recensement.droitRevendique,

        cooperative: recensement.cooperative,

        nombreDocuments: recensement.documents.length,
        nombreSignataires: recensement.signataires.length,
        nombreAutoritesEtat: recensement.autorites.length,

        observations: recensement.observations,
      })),
    };
  }

  /**
   * Rapport des documents, signataires et autorités de l'État.
   */
  async piecesEtAutorites(terrainId?: number) {
    const where = terrainId
      ? {
          parcelle: {
            bloc: {
              section: {
                terrainId,
              },
            },
          },
        }
      : {};

    const recensements = await this.prisma.recensement.findMany({
      where,
      include: {
        parcelle: {
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
          },
        },
        famille: true,
        documents: true,
        signataires: true,
        autorites: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      terrainId: terrainId ?? null,

      recensements: recensements.map((recensement) => ({
        recensementId: recensement.id,

        terrain: {
          id: recensement.parcelle.bloc.section.terrain.id,
          reference: recensement.parcelle.bloc.section.terrain.reference,
          nom: recensement.parcelle.bloc.section.terrain.nom,
        },

        parcelle: {
          id: recensement.parcelle.id,
          reference: recensement.parcelle.reference,
          numero: recensement.parcelle.numero,
        },

        situation: recensement.situation,

        famille: recensement.famille
          ? {
              id: recensement.famille.id,
              nom: recensement.famille.nom,
            }
          : null,

        documents: recensement.documents,

        signataires: recensement.signataires,

        autorites: recensement.autorites,
      })),
    };
  }

  /**
   * Rapport des anomalies entre le recensement et LANDIS.
   */
  async anomalies(terrainId?: number) {
    const where = terrainId
      ? {
          parcelle: {
            bloc: {
              section: {
                terrainId,
              },
            },
          },
        }
      : {};

    const recensements = await this.prisma.recensement.findMany({
      where,
      select: {
        id: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const resultats: Array<{
      recensementId: number;
      niveau: string;
      anomalies: string[];
      avertissements: string[];
      observations: string[];
    }> = [];

    for (const recensement of recensements) {
      const comparaison =
        await this.comparaisonService.comparerRecensement(
          recensement.id,
        );

      if (
        comparaison.comparaison.niveau === 'ANOMALIE' ||
        comparaison.comparaison.niveau === 'A_VERIFIER'
      ) {
        resultats.push({
          recensementId: recensement.id,
          niveau: comparaison.comparaison.niveau,
          anomalies: comparaison.comparaison.anomalies,
          avertissements: comparaison.comparaison.avertissements,
          observations: comparaison.comparaison.observations,
        });
      }
    }

    return {
      terrainId: terrainId ?? null,
      nombreProblemes: resultats.length,
      resultats,
    };
  }

  /**
   * Rapport global regroupant les principaux rapports.
   */
  async global(terrainId?: number) {
    const [
      synthese,
      ventes,
      dons,
      prisesAnarchiques,
      piecesEtAutorites,
      anomalies,
    ] = await Promise.all([
      this.synthese(terrainId),
      this.ventesParFamille(terrainId),
      this.donsParFamille(terrainId),
      this.prisesAnarchiques(terrainId),
      this.piecesEtAutorites(terrainId),
      this.anomalies(terrainId),
    ]);

    return {
      terrainId: terrainId ?? null,
      genereLe: new Date().toISOString(),

      synthese,
      ventesParFamille: ventes,
      donsParFamille: dons,
      prisesAnarchiques,
      piecesEtAutorites,
      anomalies,
    };
  }

  /**
   * Vérifie qu'un terrain existe avant de générer
   * un rapport explicitement demandé sur ce terrain.
   */
  async verifierTerrain(terrainId: number) {
    const terrain = await this.prisma.terrain.findUnique({
      where: {
        id: terrainId,
      },
      select: {
        id: true,
        reference: true,
        nom: true,
      },
    });

    if (!terrain) {
      throw new NotFoundException(
        `Terrain ${terrainId} introuvable`,
      );
    }

    return terrain;
  }
}