import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  lastName: string;

  @IsInt()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  age: number;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
