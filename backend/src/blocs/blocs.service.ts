import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HistoriqueService } from '../historique/historique.service';

import { CreateBlocDto } from './dto/create-bloc.dto';
import { UpdateBlocDto } from './dto/update-bloc.dto';


@Injectable()
export class BlocsService {

  constructor(
    private prisma: PrismaService,

    private historiqueService: HistoriqueService,
  ) {}


  // ============================================================
  // CREATION D'UN BLOC
  // ============================================================

  async create(
    createBlocDto: CreateBlocDto,
  ) {

    // Vérifier que le terrain existe

    const terrain =
      await this.prisma.terrain.findUnique({

        where: {
          id: createBlocDto.terrainId,
        },

      });


    if (!terrain) {

      throw new NotFoundException(
        'Terrain introuvable',
      );

    }


    // Calcul de la superficie déjà utilisée
    // par les autres blocs du terrain

    const blocsExistants =
      await this.prisma.bloc.aggregate({

        where: {
          terrainId:
            createBlocDto.terrainId,
        },

        _sum: {
          superficie: true,
        },

      });


    const superficieDejaUtilisee =
      blocsExistants._sum.superficie ?? 0;


    const nouvelleSuperficie =
      createBlocDto.superficie;


    const superficieApresAjout =
      superficieDejaUtilisee +
      nouvelleSuperficie;


    // Vérification du dépassement

    if (
      superficieApresAjout >
      terrain.superficie
    ) {

      const superficieDisponible =
        terrain.superficie -
        superficieDejaUtilisee;


      throw new BadRequestException(
        `Impossible de créer ce bloc. ` +
        `Le terrain "${terrain.reference}" ` +
        `possède une superficie de ${terrain.superficie} m². ` +
        `Il reste seulement ${superficieDisponible.toFixed(2)} m² disponibles.`,
      );

    }


    // Création du bloc

    const bloc =
      await this.prisma.bloc.create({

        data: createBlocDto,

      });


    // Calcul de la superficie de chaque parcelle

    const superficieParcelle =
      bloc.superficie /
      bloc.nombreParcelles;


    const parcelles: {
      reference: string;
      numero: string;
      superficie: number;
      blocId: number;
    }[] = [];


    for (
      let i = 1;
      i <= bloc.nombreParcelles;
      i++
    ) {

      parcelles.push({

        reference:
          `${bloc.reference}-P${i}`,

        numero:
          String(i),

        superficie:
          superficieParcelle,

        blocId:
          bloc.id,

      });

    }


    // Création automatique des parcelles

    await this.prisma.parcelle.createMany({

      data: parcelles,

    });


    const resultat =
      await this.findOne(bloc.id);


    await this.historiqueService.create(
      'CREATION',
      'BLOCS',
      `Bloc "${bloc.reference}" créé avec ${bloc.nombreParcelles} parcelles`,
    );


    return resultat;

  }


  // ============================================================
  // CREATION D'UN BLOC COMPLET
  // ============================================================

  async createBlocComplet(
    createBlocDto: CreateBlocDto,
  ) {

    return this.create(createBlocDto);

  }


  // ============================================================
  // LISTE DES BLOCS
  // ============================================================

  findAll() {

    return this.prisma.bloc.findMany({

      include: {

        terrain: true,

        parcelles: true,

      },

    });

  }


  // ============================================================
  // DETAIL D'UN BLOC
  // ============================================================

  async findOne(
    id: number,
  ) {

    const bloc =
      await this.prisma.bloc.findUnique({

        where: {
          id,
        },

        include: {

          terrain: true,

          parcelles: true,

        },

      });


    if (!bloc) {

      throw new NotFoundException(
        'Bloc introuvable',
      );

    }


    const nombreParcellesReelles =
      bloc.parcelles.length;


    const ecartParcelles =
      bloc.nombreParcelles -
      nombreParcellesReelles;


    const etatBloc =
      ecartParcelles === 0
        ? 'COMPLET'
        : 'INCOMPLET';


    const parcellesAttribuees =
      bloc.parcelles.filter(
        (p) =>
          p.proprietaireId !== null,
      );


    const nombreParcellesAttribuees =
      parcellesAttribuees.length;


    const nombreParcellesDisponibles =
      nombreParcellesReelles -
      nombreParcellesAttribuees;


    const surfaceOccupee =
      parcellesAttribuees.reduce(
        (total, parcelle) =>
          total + parcelle.superficie,
        0,
      );


    const surfaceDisponible =
      bloc.superficie -
      surfaceOccupee;


    const tauxOccupation =
      bloc.superficie === 0
        ? 0
        :
        Number(
          (
            (surfaceOccupee /
              bloc.superficie) *
            100
          ).toFixed(2),
        );


    return {

      ...bloc,

      statistiques: {

        nombreParcellesDeclarees:
          bloc.nombreParcelles,

        nombreParcellesReelles,

        ecartParcelles,

        etatBloc,

        parcellesDisponibles:
          nombreParcellesDisponibles,

        parcellesAttribuees:
          nombreParcellesAttribuees,

        surfaceTotaleBloc:
          bloc.superficie,

        surfaceOccupee:
          Number(
            surfaceOccupee.toFixed(2),
          ),

        surfaceDisponible:
          Number(
            surfaceDisponible.toFixed(2),
          ),

        tauxOccupation,

      },

    };

  }


  // ============================================================
  // STATISTIQUES
  // ============================================================

  async statistiques(
    id: number,
  ) {

    const bloc =
      await this.prisma.bloc.findUnique({

        where: {
          id,
        },

        include: {
          parcelles: true,
        },

      });


    if (!bloc) {

      throw new NotFoundException(
        'Bloc introuvable',
      );

    }


    const totalReel =
      bloc.parcelles.length;


    const parcellesAttribuees =
      bloc.parcelles.filter(

        p =>
          p.proprietaireId !== null,

      ).length;


    const parcellesDisponibles =
      totalReel -
      parcellesAttribuees;


    const tauxOccupation =
      totalReel === 0
        ? 0
        :
        Number(
          (
            (parcellesAttribuees /
              totalReel) *
            100
          ).toFixed(2),
        );


    const difference =
      bloc.nombreParcelles -
      totalReel;


    return {

      blocId:
        bloc.id,

      reference:
        bloc.reference,

      superficie:
        bloc.superficie,

      nombreDeclareDansBloc:
        bloc.nombreParcelles,

      nombreReelParcelles:
        totalReel,

      anomalie:

        difference !== 0
          ? {

              existe: true,

              difference,

              message:
                'Le nombre de parcelles du bloc ne correspond pas aux parcelles enregistrées.',

            }
          : {

              existe: false,

            },

      parcellesAttribuees,

      parcellesDisponibles,

      tauxOccupation,

    };

  }


  // ============================================================
  // MODIFICATION D'UN BLOC
  // ============================================================

  async update(
    id: number,

    updateBlocDto: UpdateBlocDto,
  ) {

    const bloc =
      await this.findOne(id);


    // Terrain cible

    const terrainId =
      updateBlocDto.terrainId ??
      bloc.terrainId;


    // Nouvelle superficie

    const superficie =
      updateBlocDto.superficie ??
      bloc.superficie;


    // Vérifier que le terrain cible existe

    const terrain =
      await this.prisma.terrain.findUnique({

        where: {
          id: terrainId,
        },

      });


    if (!terrain) {

      throw new NotFoundException(
        'Terrain introuvable',
      );

    }


    // Calculer la superficie des autres blocs
    // en excluant le bloc actuellement modifié

    const autresBlocs =
      await this.prisma.bloc.aggregate({

        where: {

          terrainId,

          id: {
            not: id,
          },

        },

        _sum: {
          superficie: true,
        },

      });


    const superficieAutresBlocs =
      autresBlocs._sum.superficie ?? 0;


    const superficieApresModification =
      superficieAutresBlocs +
      superficie;


    // Vérification du dépassement

    if (
      superficieApresModification >
      terrain.superficie
    ) {

      const superficieDisponible =
        terrain.superficie -
        superficieAutresBlocs;


      throw new BadRequestException(
        `Impossible de modifier ce bloc. ` +
        `Le terrain "${terrain.reference}" ` +
        `possède une superficie de ${terrain.superficie} m². ` +
        `Il reste seulement ${superficieDisponible.toFixed(2)} m² disponibles.`,
      );

    }


    // Modification

    const blocModifie =
      await this.prisma.bloc.update({

        where: {
          id,
        },

        data: updateBlocDto,

      });


    await this.historiqueService.create(
      'MODIFICATION',
      'BLOCS',
      `Bloc "${bloc.reference}" modifié`,
    );


    return blocModifie;

  }


  // ============================================================
  // SUPPRESSION
  // ============================================================

  async remove(
  id: number,
) {

  const bloc =
    await this.prisma.bloc.findUnique({

      where: {
        id,
      },

      include: {
        parcelles: true,
      },

    });


  if (!bloc) {

    throw new NotFoundException(
      'Bloc introuvable',
    );

  }


  // ==========================================
  // Vérifier si des parcelles sont attribuées
  // ==========================================

  const parcellesAttribuees =
    bloc.parcelles.filter(
      (parcelle) =>
        parcelle.proprietaireId !== null,
    );


  if (parcellesAttribuees.length > 0) {

    throw new BadRequestException(
      `Impossible de supprimer le bloc "${bloc.reference}" car ${parcellesAttribuees.length} parcelle(s) sont déjà attribuée(s).`,
    );

  }


  // ==========================================
  // Suppression du bloc et de ses parcelles
  // ==========================================

  await this.prisma.$transaction(
    async (tx) => {

      // Supprimer d'abord les parcelles
      await tx.parcelle.deleteMany({

        where: {
          blocId: id,
        },

      });


      // Puis supprimer le bloc
      await tx.bloc.delete({

        where: {
          id,
        },

      });

    },
  );


  // ==========================================
  // Historique
  // ==========================================

  await this.historiqueService.create(
    'SUPPRESSION',
    'BLOCS',
    `Bloc "${bloc.reference}" supprimé avec ${bloc.parcelles.length} parcelle(s)`,
  );


  return {

    message:
      `Bloc "${bloc.reference}" supprimé avec succès.`,

    blocId:
      bloc.id,

    reference:
      bloc.reference,

    parcellesSupprimees:
      bloc.parcelles.length,

  };

}

  // ============================================================
  // AJOUTER DES PARCELLES
  // ============================================================

  async ajouterParcelles(
    blocId: number,

    nombre: number,
  ) {

    const bloc =
      await this.findOne(blocId);


    const ancienNombre =
      bloc.nombreParcelles;


    const nouveauNombre =
      ancienNombre +
      nombre;


    const nouvelleSuperficie =
      bloc.superficie /
      nouveauNombre;


    await this.prisma.parcelle.updateMany({

      where: {

        blocId,

        proprietaireId: null,

      },

      data: {

        superficie:
          nouvelleSuperficie,

      },

    });


    const nouvellesParcelles: {
      reference: string;
      numero: string;
      superficie: number;
      blocId: number;
    }[] = [];


    for (
      let i = ancienNombre + 1;
      i <= nouveauNombre;
      i++
    ) {

      nouvellesParcelles.push({

        reference:
          `${bloc.reference}-P${i}`,

        numero:
          String(i),

        superficie:
          nouvelleSuperficie,

        blocId,

      });

    }


    await this.prisma.parcelle.createMany({

      data:
        nouvellesParcelles,

    });


    await this.prisma.bloc.update({

      where: {
        id: blocId,
      },

      data: {

        nombreParcelles:
          nouveauNombre,

      },

    });


    const resultat =
      await this.findOne(blocId);


    await this.historiqueService.create(
      'MODIFICATION',
      'BLOCS',
      `Ajout de ${nombre} parcelle(s) au bloc "${bloc.reference}"`,
    );


    return resultat;

  }


  // ============================================================
  // REDUIRE DES PARCELLES
  // ============================================================

  async reduireParcelles(
    blocId: number,

    nombre: number,
  ) {

    const bloc =
      await this.findOne(blocId);


    const nouveauNombre =
      bloc.nombreParcelles -
      nombre;


    if (nouveauNombre <= 0) {

      throw new BadRequestException(
        'Le bloc doit conserver au moins une parcelle.',
      );

    }


    const parcelles =
      await this.prisma.parcelle.findMany({

        where: {
          blocId,
        },

        orderBy: {
          id: 'desc',
        },

      });


    const supprimer =
      parcelles.slice(
        0,
        nombre,
      );


    const attribuees =
      supprimer.filter(

        p =>
          p.proprietaireId !== null,

      );


    if (attribuees.length > 0) {

      throw new BadRequestException(
        'Impossible de supprimer une parcelle attribuée.',
      );

    }


    await this.prisma.parcelle.deleteMany({

      where: {

        id: {

          in:
            supprimer.map(
              p => p.id,
            ),

        },

      },

    });


    const nouvelleSuperficie =
      bloc.superficie /
      nouveauNombre;


    await this.prisma.parcelle.updateMany({

      where: {

        blocId,

        proprietaireId: null,

      },

      data: {

        superficie:
          nouvelleSuperficie,

      },

    });


    await this.prisma.bloc.update({

      where: {
        id: blocId,
      },

      data: {

        nombreParcelles:
          nouveauNombre,

      },

    });


    const resultat =
      await this.findOne(blocId);


    await this.historiqueService.create(
      'MODIFICATION',
      'BLOCS',
      `Réduction de ${nombre} parcelle(s) du bloc "${bloc.reference}"`,
    );


    return resultat;

  }


  // ============================================================
  // COORDONNEES
  // ============================================================

  async updateCoordinates(
    id: number,

    latitude: number,

    longitude: number,
  ) {

    const bloc =
      await this.prisma.bloc.findUnique({

        where: {
          id,
        },

      });


    if (!bloc) {

      throw new NotFoundException(
        'Bloc introuvable',
      );

    }


    const blocModifie =
      await this.prisma.bloc.update({

        where: {
          id,
        },

        data: {
          latitude,
          longitude,
        },

        include: {
          terrain: true,
          parcelles: true,
        },

      });


    await this.historiqueService.create(
      'MODIFICATION',
      'BLOCS',
      `Coordonnées du bloc "${bloc.reference}" modifiées`,
    );


    return blocModifie;

  }

}