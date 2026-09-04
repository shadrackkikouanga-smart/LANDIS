import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateMembreFamilleDto {
  @IsString()
  nom!: string;

  @IsString()
  prenom!: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsString()
  @MinLength(2)
  qualite!: string;

  @IsOptional()
  @IsString()
  observations?: string;
}