import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { User, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

import * as bcrypt from "bcrypt";
import { GetUsersDto } from './dto/get-users.dto';
import { contains } from 'class-validator';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService){}

  async create(createUserDto: CreateUserDto): Promise <User> {
    const hashedPassword = bcrypt.hashSync(createUserDto.password, 10)
    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword
      }
    });
  }

  async findAll(query: GetUsersDto): Promise <User[]> {
    const { skip = 0, take = 10, name, email, sortBy = "id", sortOrder} = query;
    return this.prisma.user.findMany({
      skip,
      take,
      where: {
        ...(name && { name: { contains: name, mode: "insensitive"} }),
        ...(email && { email: { contains: email, mode: 'insensitive' } }),
      },
      orderBy: sortBy ? {
        [sortBy]: sortOrder === "desc" ? "desc" : "asc"
      }: undefined
    });
  }

  async findOne(id: number): Promise <User> {
    const findData = await this.prisma.user.findFirst({
      where: {
        id: id
      }
    });

    if (!findData) {
      throw new NotFoundException(`User not found with id: ${id}`)
    }
    return findData;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise <User> {
    const findData = await this.prisma.user.findFirst({
      where: {
        id: id
      }
    });

    if (!findData) {
      throw new NotFoundException(`User not found with id: ${id}`)
    }

    if (updateUserDto.password) {
      updateUserDto.password =await bcrypt.hashSync(updateUserDto.password, 10)
    }

    return this.prisma.user.update({
      where: {id},
      data: updateUserDto
    });
  }

  async remove(id: number): Promise <User> {
    const findData = await this.prisma.user.findFirst({
      where: {
        id: id
      }
    });

    if (!findData) {
      throw new NotFoundException(`User not found with id: ${id}`)
    }
    return await this.prisma.user.delete({
      where: {
        id: id
      }
    });
  }
}
