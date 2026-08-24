import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { AcquereursService } from './acquereurs.service';

import { CreateAcquereurDto } from './dto/create-acquereur.dto';
import { UpdateAcquereurDto } from './dto/update-acquereur.dto';

@Controller('acquereurs')
export class AcquereursController {

  constructor(
    private readonly acquereursService: AcquereursService,
  ) {}


  @Post()
  create(
    @Body() createAcquereurDto: CreateAcquereurDto,
  ) {

    return this.acquereursService.create(
      createAcquereurDto,
    );

  }


  @Get()
  findAll() {

    return this.acquereursService.findAll();

  }


  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {

    return this.acquereursService.findOne(id);

  }


  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAcquereurDto: UpdateAcquereurDto,
  ) {

    return this.acquereursService.update(
      id,
      updateAcquereurDto,
    );

  }


  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {

    return this.acquereursService.remove(id);

  }

}