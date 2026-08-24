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


export class UpdateProjectDto {


  @IsOptional()
  @IsString()
  name?: string;


  @IsOptional()
  @IsString()
  reference?: string;


  @IsOptional()
  @IsString()
  description?: string;


  @IsOptional()
  @IsString()
  location?: string;


  @IsOptional()
  @IsNumber()
  area?: number;


  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;


}