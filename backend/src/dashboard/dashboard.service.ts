import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const projets = await this.prisma.project.count();

    // AJUSTEMENT DE L'INCLUSION PRISMA POUR PASSER PAR LES SECTIONS
    const terrains = await this.prisma.terrain.findMany({
      include: {
        sections: {
          include: {
            blocs: {
              include: {
                parcelles: true,
              },
            },
          },
        },
      },
    });

    const nombreTerrains = terrains.length;

    const superficieTotale = terrains.reduce(
      (total, terrain) => total + terrain.superficie,
      0,
    );

    // ADAPTATION DU FLATMAP POUR TRAVERSER LES SECTIONS ET RECONSTRUIRE LE TABLEAU DE BLOCS
    const sections = terrains.flatMap(terrain => terrain.sections || []);
    const blocs = sections.flatMap(section => section.blocs || []);

    const nombreBlocsReels = blocs.length;
    const nombreBlocsDeclares = blocs.length;
    const ecartBlocs = nombreBlocsDeclares - nombreBlocsReels;

    const parcelles = blocs.flatMap(bloc => bloc.parcelles || []);

    const nombreParcellesReelles = parcelles.length;
    const nombreParcellesDeclarees = blocs.reduce(
      (total, bloc) => total + bloc.nombreParcelles,
      0,
    );

    const ecartParcelles = nombreParcellesDeclarees - nombreParcellesReelles;

    const parcellesAttribuees = parcelles.filter(
      parcelle => parcelle.proprietaireId !== null,
    ).length;

    const parcellesDisponibles = nombreParcellesReelles - parcellesAttribuees;

    const proprietaires = await this.prisma.proprietaire.count();
    const acquereurs = await this.prisma.acquereur.count();

    const transactions = await this.prisma.transaction.findMany({
      include: {
        paiements: true,
      },
    });

    const paiements = await this.prisma.paiement.findMany();

    const montantTotal = paiements.reduce(
      (total, paiement) => total + paiement.montant,
      0,
    );

    return {
      projets,
      terrains: {
        nombre: nombreTerrains,
        superficieTotale,
      },
      blocs: {
        nombreDeclares: nombreBlocsDeclares,
        nombreReels: nombreBlocsReels,
        ecart: ecartBlocs,
      },
      parcelles: {
        nombreDeclarees: nombreParcellesDeclarees,
        nombreReelles: nombreParcellesReelles,
        ecart: ecartParcelles,
        disponibles: parcellesDisponibles,
        attribuees: parcellesAttribuees,
      },
      proprietaires,
      acquereurs,
      transactions: {
        total: transactions.length,
      },
      finances: {
        montantTotal,
      },
    };
  }
}
