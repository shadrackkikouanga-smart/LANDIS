import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsEnum,
} from 'class-validator';

import { TypeVoie } from '@prisma/client';

export class CreateBlocDto {
  @IsString()
  reference!: string;

  @IsNumber()
  superficie!: number;

  @IsInt()
  nombreParcelles!: number;

  @IsInt()
  sectionId!: number;

  // Coordonnées du bloc
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  // Voie située au-dessus du bloc
  @IsOptional()
  @IsEnum(TypeVoie)
  voieHautType?: TypeVoie;

  @IsOptional()
  @IsNumber()
  voieHautLargeur?: number;

  // Voie située en dessous du bloc
  @IsOptional()
  @IsEnum(TypeVoie)
  voieBasType?: TypeVoie;

  @IsOptional()
  @IsNumber()
  voieBasLargeur?: number;

  // Voie située à gauche du bloc
  @IsOptional()
  @IsEnum(TypeVoie)
  voieGaucheType?: TypeVoie;

  @IsOptional()
  @IsNumber()
  voieGaucheLargeur?: number;

  // Voie située à droite du bloc
  @IsOptional()
  @IsEnum(TypeVoie)
  voieDroiteType?: TypeVoie;

  @IsOptional()
  @IsNumber()
  voieDroiteLargeur?: number;
}