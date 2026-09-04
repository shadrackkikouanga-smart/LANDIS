import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { RecensementsService } from './recensements.service';
import { ComparaisonRecensementService } from './comparaison/comparaison-recensement.service';

import { CreateRecensementDto } from './dto/create-recensement.dto';
import { UpdateRecensementDto } from './dto/update-recensement.dto';

@Controller('recensements')
export class RecensementsController {
  constructor(
    private readonly recensementsService: RecensementsService,
    private readonly comparaisonService: ComparaisonRecensementService,
  ) {}

  /**
   * Créer un recensement
   */
  @Post()
  create(@Body() dto: CreateRecensementDto) {
    return this.recensementsService.create(dto);
  }

  /**
   * Récupérer tous les recensements
   */
  @Get()
  findAll() {
    return this.recensementsService.findAll();
  }

  /**
   * Comparer tous les recensements avec les données LANDIS
   *
   * IMPORTANT :
   * Cette route doit être déclarée avant @Get(':id')
   * afin que "comparaison" ne soit pas interprété
   * comme un identifiant numérique.
   */
  @Get('comparaison')
  comparerTous() {
    return this.comparaisonService.comparerTous();
  }

  /**
   * Comparer le dernier recensement d'une parcelle
   *
   * Cette route doit être déclarée avant @Get(':id').
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
   * Récupérer les recensements d'une parcelle
   */
  @Get('parcelle/:parcelleId')
  findByParcelle(
    @Param('parcelleId', ParseIntPipe) parcelleId: number,
  ) {
    return this.recensementsService.findByParcelle(
      parcelleId,
    );
  }

  /**
   * Comparer un recensement précis
   *
   * Cette route doit également être déclarée avant
   * @Get(':id') pour éviter toute ambiguïté.
   */
  @Get(':id/comparaison')
  comparerRecensement(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.comparaisonService.comparerRecensement(
      id,
    );
  }

  /**
   * Récupérer un recensement par son ID
   */
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.recensementsService.findOne(id);
  }

  /**
   * Modifier un recensement
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecensementDto,
  ) {
    return this.recensementsService.update(id, dto);
  }

  /**
   * Supprimer un recensement
   */
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.recensementsService.remove(id);
  }
}