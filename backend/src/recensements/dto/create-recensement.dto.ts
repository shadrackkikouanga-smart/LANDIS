import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { SituationRecensement } from '@prisma/client';

import { CreateRecensementDocumentDto } from './create-recensement-document.dto';
import { CreateRecensementSignataireDto } from './create-recensement-signataire.dto';
import { CreateRecensementAutoriteDto } from './create-recensement-autorite.dto';

export class CreateRecensementDto {
  @IsInt()
  @Min(1)
  parcelleId!: number;

  @IsEnum(SituationRecensement)
  situation!: SituationRecensement;

  @IsOptional()
  @IsString()
  occupantNom?: string;

  @IsOptional()
  @IsString()
  occupantPrenom?: string;

  @IsOptional()
  @IsString()
  occupantTelephone?: string;

  @IsOptional()
  @IsString()
  occupantAdresse?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  familleId?: number;

  @IsOptional()
  @IsString()
  vendeurDonateurNom?: string;

  @IsOptional()
  @IsString()
  vendeurDonateurPrenom?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  vendeurDonateurMembreId?: number;

  @IsOptional()
  @IsString()
  vendeurDonateurQualite?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  montantTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  montantPaye?: number;

  @IsOptional()
  @IsString()
  droitRevendique?: string;

  @IsOptional()
  @IsBoolean()
  cooperative?: boolean;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecensementDocumentDto)
  documents?: CreateRecensementDocumentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecensementSignataireDto)
  signataires?: CreateRecensementSignataireDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecensementAutoriteDto)
  autorites?: CreateRecensementAutoriteDto[];
}