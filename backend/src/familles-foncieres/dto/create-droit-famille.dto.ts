import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { TypeDroitFamille } from '@prisma/client';

export class CreateDroitFamilleDto {
  @IsEnum(TypeDroitFamille)
  type!: TypeDroitFamille;

  @IsOptional()
  @IsInt()
  @Min(1)
  membreId?: number;

  @IsOptional()
  @IsString()
  description?: string;
}