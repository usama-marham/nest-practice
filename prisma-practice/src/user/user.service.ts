import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { error } from 'console';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(data: CreateUserDto): Promise<any> {
    try {
      const response = await this.prismaService.user.create({
        data,
      });
      if (!response) NotFoundException;
      return response;
    } catch (error) {}
    return error;
  }

  async findAll() {
    return this.prismaService.user.findMany();
  }

  async findOne(id: number): Promise<any> {
    return await this.prismaService.user.findFirst({
      where: { id },
    });
  }

  async update(id: number, body: any): Promise<any> {
    const updateUser = await this.prismaService.user.update({
      where: { id: Number(id) },
      data: body,
    });
    return updateUser;
  }

  async remove(id: number): Promise<any> {
    const deleteUser = await this.prismaService.user.delete({
      where: {
        id,
      },
    });
    return deleteUser;
  }
}
