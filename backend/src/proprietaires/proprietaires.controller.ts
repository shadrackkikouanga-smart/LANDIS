import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import {
  ApiTags,
} from '@nestjs/swagger';


import { ProprietairesService } from './proprietaires.service';

import { CreateProprietaireDto } from './dto/create-proprietaire.dto';

import { UpdateProprietaireDto } from './dto/update-proprietaire.dto';



@ApiTags('Proprietaires')
@Controller('proprietaires')
export class ProprietairesController {


  constructor(
    private readonly proprietairesService: ProprietairesService,
  ) {}



  @Post()
  create(
    @Body() createProprietaireDto: CreateProprietaireDto,
  ) {

    return this.proprietairesService.create(
      createProprietaireDto,
    );

  }




  @Get()
  findAll() {

    return this.proprietairesService.findAll();

  }




  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {

    return this.proprietairesService.findOne(
      id,
    );

  }




  @Patch(':id')
  update(

    @Param('id', ParseIntPipe) id: number,

    @Body() updateProprietaireDto: UpdateProprietaireDto,

  ) {

    return this.proprietairesService.update(
      id,
      updateProprietaireDto,
    );

  }




  @Delete(':id')
  remove(

    @Param('id', ParseIntPipe) id: number,

  ) {

    return this.proprietairesService.remove(
      id,
    );

  }


}