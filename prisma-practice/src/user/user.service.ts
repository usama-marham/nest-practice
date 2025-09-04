import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    return await this.prismaService.user.create({
      data,
    });
  }

  async findAll(skip = 0, take = 20): Promise<User[]> {
    return await this.prismaService.user.findMany({
      skip, // pagination offset
      take, // pagination limit
      orderBy: { id: 'asc' }, //smallest id first
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, body: any): Promise<User> {
    const updateUser = await this.prismaService.user.update({
      where: { id },
      data: body,
    });
    return updateUser;
  }

  async remove(id: number): Promise<void> {
    const deleteUser = await this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }
}
