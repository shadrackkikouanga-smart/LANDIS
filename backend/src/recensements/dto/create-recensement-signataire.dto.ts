import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRecensementSignataireDto {
  @IsString()
  nom!: string;

  @IsString()
  prenom!: string;

  @IsOptional()
  @IsString()
  qualite?: string;

  @IsOptional()
  @IsString()
  fonction?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}