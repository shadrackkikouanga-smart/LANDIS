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

import { SectionsService } from './sections.service';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Controller('sections')
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
  ) {}

  @Post()
  create(
    @Body()
    createSectionDto: CreateSectionDto,
  ) {
    return this.sectionsService.create(
      createSectionDto,
    );
  }

  @Get()
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get('terrain/:terrainId')
  findByTerrain(
    @Param(
      'terrainId',
      ParseIntPipe,
    )
    terrainId: number,
  ) {
    return this.sectionsService.findByTerrain(
      terrainId,
    );
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateSectionDto: UpdateSectionDto,
  ) {
    return this.sectionsService.update(
      id,
      updateSectionDto,
    );
  }

  @Delete(':id')
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.sectionsService.remove(id);
  }
}