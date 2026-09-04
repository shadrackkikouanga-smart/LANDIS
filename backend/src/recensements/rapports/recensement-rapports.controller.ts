import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { RecensementRapportsService } from './recensement-rapports.service';

@Controller('recensements/rapports')
export class RecensementRapportsController {
  constructor(
    private readonly rapportsService: RecensementRapportsService,
  ) {}

  /**
   * GET /recensements/rapports/synthese
   *
   * Optionnel :
   * GET /recensements/rapports/synthese?terrainId=2
   */
  @Get('synthese')
  synthese(
    @Query('terrainId') terrainId?: string,
  ) {
    return this.rapportsService.synthese(
      terrainId ? Number(terrainId) : undefined,
    );
  }

  /**
   * GET /recensements/rapports/ventes
   *
   * Optionnel :
   * GET /recensements/rapports/ventes?terrainId=2
   */
  @Get('ventes')
  ventesParFamille(
    @Query('terrainId') terrainId?: string,
  ) {
    return this.rapportsService.ventesParFamille(
      terrainId ? Number(terrainId) : undefined,
    );
  }

  /**
   * GET /recensements/rapports/dons
   *
   * Optionnel :
   * GET /recensements/rapports/dons?terrainId=2
   */
  @Get('dons')
  donsParFamille(
    @Query('terrainId') terrainId?: string,
  ) {
    return this.rapportsService.donsParFamille(
      terrainId ? Number(terrainId) : undefined,
    );
  }

  /**
   * GET /recensements/rapports/prises-anarchiques
   *
   * Optionnel :
   * GET /recensements/rapports/prises-anarchiques?terrainId=2
   */
  @Get('prises-anarchiques')
  prisesAnarchiques(
    @Query('terrainId') terrainId?: string,
  ) {
    return this.rapportsService.prisesAnarchiques(
      terrainId ? Number(terrainId) : undefined,
    );
  }

  /**
   * GET /recensements/rapports/pieces
   *
   * Documents + signataires + autorités de l'État.
   */
  @Get('pieces')
  piecesEtAutorites(
    @Query('terrainId') terrainId?: string,
  ) {
    return this.rapportsService.piecesEtAutorites(
      terrainId ? Number(terrainId) : undefined,
    );
  }

  /**
   * GET /recensements/rapports/anomalies
   *
   * Compare tous les recensements avec LANDIS.
   */
  @Get('anomalies')
  anomalies(
    @Query('terrainId') terrainId?: string,
  ) {
    return this.rapportsService.anomalies(
      terrainId ? Number(terrainId) : undefined,
    );
  }

  /**
   * GET /recensements/rapports/global
   */
  @Get('global')
  global(
    @Query('terrainId') terrainId?: string,
  ) {
    return this.rapportsService.global(
      terrainId ? Number(terrainId) : undefined,
    );
  }

  /**
   * Vérification d'un terrain.
   *
   * GET /recensements/rapports/terrain/2
   */
  @Get('terrain/:terrainId')
  verifierTerrain(
    @Param('terrainId', ParseIntPipe) terrainId: number,
  ) {
    return this.rapportsService.verifierTerrain(terrainId);
  }
}