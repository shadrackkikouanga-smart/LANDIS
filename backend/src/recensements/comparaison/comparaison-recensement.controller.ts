import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { ComparaisonRecensementService } from './comparaison-recensement.service';

@Controller('recensements')
export class ComparaisonRecensementController {
  constructor(
    private readonly comparaisonService: ComparaisonRecensementService,
  ) {}

  /**
   * Comparer tous les recensements avec les données LANDIS
   */
  @Get('comparaison')
  comparerTous() {
    return this.comparaisonService.comparerTous();
  }

  /**
   * Comparer le dernier recensement d'une parcelle
   */
  @Get('comparaison/parcelle/:parcelleId')
  comparerParcelle(
    @Param('parcelleId', ParseIntPipe) parcelleId: number,
  ) {
    return this.comparaisonService.comparerParcelle(
      parcelleId,
    );
  }

  /**
   * Comparer un recensement précis
   */
  @Get(':id/comparaison')
  comparerRecensement(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.comparaisonService.comparerRecensement(
      id,
    );
  }
}