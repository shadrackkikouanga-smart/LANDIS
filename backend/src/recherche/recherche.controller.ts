import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import {
  RechercheService,
} from './recherche.service';

@Controller('recherche')
export class RechercheController {
  constructor(
    private readonly rechercheService: RechercheService,
  ) {}

  // ============================================================
  // RECHERCHE GLOBALE
  // ============================================================

  @Get()
  rechercher(
    @Query('q')
    q: string,
  ) {
    return this.rechercheService.rechercher(
      q,
    );
  }
}