import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRecensementAutoriteDto {
  @IsString()
  nom!: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsString()
  fonction!: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}