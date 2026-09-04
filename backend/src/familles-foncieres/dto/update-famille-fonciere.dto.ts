import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateFamilleFonciereDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  estPrincipale?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}