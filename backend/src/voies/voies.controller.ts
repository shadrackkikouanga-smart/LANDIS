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

import { VoiesService } from './voies.service';

import { CreateVoieDto } from './dto/create-voie.dto';
import { UpdateVoieDto } from './dto/update-voie.dto';

@Controller('voies')
export class VoiesController {
  constructor(
    private readonly voiesService: VoiesService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateVoieDto,
  ) {
    return this.voiesService.create(dto);
  }

  @Get()
  findAll() {
    return this.voiesService.findAll();
  }

  @Get('terrain/:terrainId')
  findByTerrain(
    @Param(
      'terrainId',
      ParseIntPipe,
    )
    terrainId: number,
  ) {
    return this.voiesService.findByTerrain(
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
    return this.voiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body() dto: UpdateVoieDto,
  ) {
    return this.voiesService.update(
      id,
      dto,
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
    return this.voiesService.remove(id);
  }
}