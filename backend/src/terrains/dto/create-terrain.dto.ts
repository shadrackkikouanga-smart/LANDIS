import { IsNotEmpty, IsNumber, IsString, IsOptional } from "class-validator";


export class CreateTerrainDto {

  @IsString()
  @IsNotEmpty()
  reference!: string;


  @IsString()
  @IsNotEmpty()
  nom!: string;


  @IsNumber()
  superficie!: number;


  @IsOptional()
  @IsString()
  localisation?: string;


  @IsOptional()
  @IsString()
  statut?: string;


  @IsNumber()
  projectId!: number;

}