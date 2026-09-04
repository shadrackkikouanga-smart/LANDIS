import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Res,
  NotFoundException,
} from '@nestjs/common';

import type { Response } from 'express';

import * as fs from 'fs';

import { DocumentsService } from './documents.service';

import { CreateDocumentDto } from './dto/create-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
  ) {}

  @Post()
  create(
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentsService.create(
      createDocumentDto,
    );
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get('transaction/:transactionId')
  findByTransaction(
    @Param('transactionId', ParseIntPipe)
    transactionId: number,
  ) {
    return this.documentsService.findByTransaction(
      transactionId,
    );
  }

  @Get('contrat/:transactionId/pdf')
  async genererContratVente(
    @Param('transactionId', ParseIntPipe)
    transactionId: number,
    @Res() res: Response,
  ) {
    const document =
      await this.documentsService.genererContratVente(
        transactionId,
      );

    if (!document.chemin) {
      throw new NotFoundException(
        'Chemin du contrat introuvable',
      );
    }

    if (!fs.existsSync(document.chemin)) {
      throw new NotFoundException(
        `Fichier du contrat introuvable : ${document.chemin}`,
      );
    }

    return res.download(
      document.chemin,
      document.nomFichier,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentsService.findOne(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentsService.remove(id);
  }
}