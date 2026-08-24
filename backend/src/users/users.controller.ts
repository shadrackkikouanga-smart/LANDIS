import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
  ) {}

  /*
   * Création d'un utilisateur
   * DIRECTEUR uniquement
   */
  @Post()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('DIRECTEUR')
  async create(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(
      createUserDto,
    );
  }

  /*
   * Liste des utilisateurs
   * DIRECTEUR uniquement
   */
  @Get()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('DIRECTEUR')
  async findAll() {
    return this.usersService.findAll();
  }

  /*
   * Un utilisateur
   */
  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('DIRECTEUR')
  async findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.findOne(id);
  }

  /*
   * Modification d'un utilisateur
   */
  @Patch(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('DIRECTEUR')
  async update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(
      id,
      updateUserDto,
    );
  }

  /*
   * Suppression d'un utilisateur
   */
  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('DIRECTEUR')
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.remove(id);
  }
}