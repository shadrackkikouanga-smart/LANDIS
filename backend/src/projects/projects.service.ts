import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HistoriqueService } from '../historique/historique.service';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';


@Injectable()
export class ProjectsService {

  constructor(
    private prisma: PrismaService,

    private historiqueService: HistoriqueService,
  ) {}


  async create(
    createProjectDto: CreateProjectDto,
  ) {

    const project =
      await this.prisma.project.create({

        data: {

          name: createProjectDto.name,

          reference: createProjectDto.reference,

          description: createProjectDto.description,

          location: createProjectDto.location,

          area: createProjectDto.area,

          status: createProjectDto.status,

        },

      });


    await this.historiqueService.create(
      'CREATION',
      'PROJETS',
      `Projet "${project.name}" (${project.reference}) créé`,
    );


    return project;

  }


  async findAll() {

    return this.prisma.project.findMany();

  }


  async findOne(
    id: number,
  ) {

    const project =
      await this.prisma.project.findUnique({

        where: {
          id,
        },

        // ADAPTATION PRISMA : Inclusion des sections pour atteindre les blocs
        include: {

          terrains: {

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

          },

        },

      });


    if (!project) {

      throw new NotFoundException(
        'Projet introuvable',
      );

    }


    const nombreTerrainsReels =
      project.terrains.length;


    const nombreTerrainsDeclares =
      nombreTerrainsReels;


    const ecartTerrains =
      nombreTerrainsDeclares -
      nombreTerrainsReels;


    // ADAPTATION DES CALCULS POUR TRAVERSER LES SECTIONS ET EXTRAIRE LES BLOCS
    const nombreBlocsReels =
      project.terrains.reduce(
        (total, terrain) =>
          total + (terrain.sections || []).reduce(
            (sectionTotal, section) => sectionTotal + (section.blocs || []).length,
            0
          ),
        0,
      );


    const nombreBlocsDeclares =
      project.terrains.reduce(
        (total, terrain) =>
          total + (terrain.sections || []).reduce(
            (sectionTotal, section) => sectionTotal + (section.blocs || []).reduce(
              (blocTotal, bloc) => blocTotal + bloc.nombreParcelles * 0 + 1,
              0
            ),
            0
          ),
        0,
      );


    const ecartBlocs =
      nombreBlocsDeclares -
      nombreBlocsReels;


    const nombreParcellesDeclarees =
      project.terrains.reduce(
        (total, terrain) =>
          total + (terrain.sections || []).reduce(
            (sectionTotal, section) => sectionTotal + (section.blocs || []).reduce(
              (blocTotal, bloc) => blocTotal + bloc.nombreParcelles,
              0
            ),
            0
          ),
        0,
      );


    const parcelles =
      project.terrains.flatMap(
        (terrain) =>
          (terrain.sections || []).flatMap(
            (section) =>
              (section.blocs || []).flatMap(
                (bloc) => bloc.parcelles || []
              ),
          ),
      );
    const nombreParcellesReelles =
      parcelles.length;


    const ecartParcelles =
      nombreParcellesDeclarees -
      nombreParcellesReelles;


    const parcellesAttribuees =
      parcelles.filter(

        (parcelle) =>

          parcelle.proprietaireId !== null,

      ).length;


    const parcellesDisponibles =
      nombreParcellesReelles -
      parcellesAttribuees;


    const surfaceTotaleProjet =
      project.area;


    // ADAPTATION DU CALCUL DE SURFACE POUR INCLURE LES SECTIONS INTERMÉDIAIRES
    const surfaceLotie =
      project.terrains.reduce(
        (total, terrain) =>
          total + (terrain.sections || []).reduce(
            (sectionTotal, section) =>
              sectionTotal + (section.blocs || []).reduce(
                (blocTotal, bloc) => blocTotal + bloc.superficie,
                0
              ),
            0
          ),
        0,
      );


    const surfaceRestante =
      Number(

        (

          surfaceTotaleProjet -
          surfaceLotie

        ).toFixed(2),

      );


    return {

      ...project,

      statistiques: {

        nombreTerrainsDeclares,

        nombreTerrainsReels,

        ecartTerrains,

        nombreBlocsDeclares,

        nombreBlocsReels,

        ecartBlocs,

        nombreParcellesDeclarees,

        nombreParcellesReelles,

        ecartParcelles,

        parcellesDisponibles,

        parcellesAttribuees,

        surfaceTotaleProjet,

        surfaceLotie,

        surfaceRestante,

        etatProjet:

          ecartTerrains === 0 &&

          ecartBlocs === 0 &&

          ecartParcelles === 0

            ? 'COMPLET'

            : 'INCOMPLET',

      },

    };

  }


  async update(
    id: number,

    updateProjectDto: UpdateProjectDto,

  ) {

    const existingProject =
      await this.findOne(id);


    const project =
      await this.prisma.project.update({

        where: {

          id,

        },

        data: {

          ...updateProjectDto,

        },

      });


    await this.historiqueService.create(
      'MODIFICATION',
      'PROJETS',
      `Projet "${existingProject.name}" (${existingProject.reference}) modifié`,
    );


    return project;

  }


  async remove(
    id: number,
  ) {

    const project =
      await this.findOne(id);


    const deletedProject =
      await this.prisma.project.delete({

        where: {

          id,

        },

      });


    await this.historiqueService.create(
      'SUPPRESSION',
      'PROJETS',
      `Projet "${project.name}" (${project.reference}) supprimé`,
    );


    return deletedProject;

  }

}
