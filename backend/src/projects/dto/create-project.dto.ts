import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';


enum ProjectStatus {
  EN_PREPARATION = 'EN_PREPARATION',
  EN_COURS = 'EN_COURS',
  SUSPENDU = 'SUSPENDU',
  TERMINE = 'TERMINE',
}


export class CreateProjectDto {


  @IsString()
  name!: string;


  @IsString()
  reference!: string;


  @IsOptional()
  @IsString()
  description?: string;


  @IsString()
  location!: string;


  @IsNumber()
  area!: number;


  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

}