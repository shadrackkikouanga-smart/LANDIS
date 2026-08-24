import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Cette adresse email est déjà utilisée',
      );
    }

    const hashedPassword =
      await argon2.hash(
        createUserDto.password,
      );

    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Utilisateur introuvable',
      );
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Utilisateur introuvable',
      );
    }

    if (
      updateUserDto.email &&
      updateUserDto.email !== user.email
    ) {
      const existingUser =
        await this.prisma.user.findUnique({
          where: {
            email: updateUserDto.email,
          },
        });

      if (existingUser) {
        throw new ConflictException(
          'Cette adresse email est déjà utilisée',
        );
      }
    }

    const data: any = {
      name: updateUserDto.name,
      email: updateUserDto.email,
      role: updateUserDto.role,
    };

    if (updateUserDto.password) {
      data.password =
        await argon2.hash(
          updateUserDto.password,
        );
    }

    return this.prisma.user.update({
      where: {
        id,
      },

      data,

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: number) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Utilisateur introuvable',
      );
    }

    await this.prisma.user.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message:
        'Utilisateur supprimé avec succès',
    };
  }
}