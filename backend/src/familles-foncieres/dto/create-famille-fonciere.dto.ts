import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateFamilleFonciereDto {
  @IsString()
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  estPrincipale?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsInt()
  @Min(1)
  terrainId!: number;
}