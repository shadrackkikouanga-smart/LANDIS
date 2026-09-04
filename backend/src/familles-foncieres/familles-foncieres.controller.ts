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

import { FamillesFoncieresService } from './familles-foncieres.service';

import { CreateFamilleFonciereDto } from './dto/create-famille-fonciere.dto';
import { UpdateFamilleFonciereDto } from './dto/update-famille-fonciere.dto';

import { CreateMembreFamilleDto } from './dto/create-membre-famille.dto';
import { UpdateMembreFamilleDto } from './dto/update-membre-famille.dto';

import { CreateDroitFamilleDto } from './dto/create-droit-famille.dto';
import { UpdateDroitFamilleDto } from './dto/update-droit-famille.dto';

@Controller('familles-foncieres')
export class FamillesFoncieresController {
  constructor(
    private readonly famillesFoncieresService: FamillesFoncieresService,
  ) {}

  // ============================================================
  // FAMILLES
  // ============================================================

  @Post()
  create(
    @Body()
    createFamilleDto: CreateFamilleFonciereDto,
  ) {
    return this.famillesFoncieresService.create(
      createFamilleDto,
    );
  }

  @Get()
  findAll() {
    return this.famillesFoncieresService.findAll();
  }

  @Get('terrain/:terrainId')
  findByTerrain(
    @Param('terrainId', ParseIntPipe)
    terrainId: number,
  ) {
    return this.famillesFoncieresService.findByTerrain(
      terrainId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.famillesFoncieresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateFamilleDto: UpdateFamilleFonciereDto,
  ) {
    return this.famillesFoncieresService.update(
      id,
      updateFamilleDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.famillesFoncieresService.remove(id);
  }

  // ============================================================
  // MEMBRES
  // ============================================================

  @Post(':id/membres')
  createMembre(
    @Param('id', ParseIntPipe)
    familleId: number,
    @Body()
    createMembreDto: CreateMembreFamilleDto,
  ) {
    return this.famillesFoncieresService.createMembre(
      familleId,
      createMembreDto,
    );
  }

  @Patch('membres/:membreId')
  updateMembre(
    @Param('membreId', ParseIntPipe)
    membreId: number,
    @Body()
    updateMembreDto: UpdateMembreFamilleDto,
  ) {
    return this.famillesFoncieresService.updateMembre(
      membreId,
      updateMembreDto,
    );
  }

  @Delete('membres/:membreId')
  removeMembre(
    @Param('membreId', ParseIntPipe)
    membreId: number,
  ) {
    return this.famillesFoncieresService.removeMembre(
      membreId,
    );
  }

  // ============================================================
  // DROITS
  // ============================================================

  @Post(':id/droits')
  createDroit(
    @Param('id', ParseIntPipe)
    familleId: number,
    @Body()
    createDroitDto: CreateDroitFamilleDto,
  ) {
    return this.famillesFoncieresService.createDroit(
      familleId,
      createDroitDto,
    );
  }

  @Patch('droits/:droitId')
  updateDroit(
    @Param('droitId', ParseIntPipe)
    droitId: number,
    @Body()
    updateDroitDto: UpdateDroitFamilleDto,
  ) {
    return this.famillesFoncieresService.updateDroit(
      droitId,
      updateDroitDto,
    );
  }

  @Delete('droits/:droitId')
  removeDroit(
    @Param('droitId', ParseIntPipe)
    droitId: number,
  ) {
    return this.famillesFoncieresService.removeDroit(
      droitId,
    );
  }
}