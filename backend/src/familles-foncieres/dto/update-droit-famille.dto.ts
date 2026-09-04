import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { TypeDroitFamille } from '@prisma/client';

export class UpdateDroitFamilleDto {
  @IsOptional()
  @IsEnum(TypeDroitFamille)
  type?: TypeDroitFamille;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}