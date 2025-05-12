import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Types } from 'mongoose';
import { UserRoles } from 'src/enum/user-roles';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(UserRoles)
  @IsOptional()
  role?: UserRoles;

  @IsEmail()
  email: string;

  @Length(8, 22)
  @IsString()
  password: string;

  @IsOptional()
  @IsArray()
  posts?: Types.ObjectId[];
}
