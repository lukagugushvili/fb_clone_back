import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserRoles } from 'src/enum/user-roles';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );

      const user = await this.userModel.create({
        ...createUserDto,
        role: UserRoles.USER,
        password: hashedPassword,
      });
      return user;
    } catch (error) {
      console.error(`Error creating user: ${error.message}`);
      throw new BadRequestException('Failed to create user');
    }
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      console.log('token', updateUserDto);
      if (updateUserDto.posts) {
        await this.removePostFromUser(id, updateUserDto.posts.toString());
      }

      if (updateUserDto.password) {
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

        if (isNaN(saltRounds) || saltRounds < 0) {
          throw new BadRequestException('Invalid salt rounds');
        }

        updateUserDto.password = await bcrypt.hash(
          updateUserDto.password,
          saltRounds,
        );
      }

      const user = await this.userModel.findByIdAndUpdate(
        id,
        { refresh_token: updateUserDto.refresh_token },
        { new: true },
      );

      if (!user) throw new NotFoundException('User not found');

      return user;
    } catch (error) {
      console.error(`Error updating user: ${error.message}`);
      throw new BadRequestException('Failed to update user');
    }
  }

  async addPostToUser(userId: string, postId: string): Promise<void> {
    try {
      const user = await this.userModel.findById(userId);

      if (!user)
        throw new NotFoundException(`User with ID: ${userId} not found`);

      const postObjectId = new Types.ObjectId(postId);

      if (user.posts.includes(postObjectId)) {
        user.posts = user.posts.filter((post) => post !== postObjectId);
      } else {
        user.posts.push(postObjectId);
      }

      await user.save();
    } catch (error) {
      console.error(`Error add post to user: ${error.message}`);
      throw new BadRequestException(
        `Could not add post to user: ${error.message}`,
      );
    }
  }

  async removePostFromUser(userId: string, postId: string): Promise<void> {
    try {
      const user = await this.userModel.findById(userId);

      if (!user)
        throw new NotFoundException(`User with ID: ${userId} not found`);

      const postObjectId = new Types.ObjectId(postId);

      user.posts = user.posts.filter(
        (p: Types.ObjectId) => p.toString() !== postObjectId.toString(),
      );

      await user.save();
    } catch (error) {
      console.error(`Error removing post from user: ${error.message}`);
      throw new BadRequestException(
        `Could not remove post from user: ${error.message}`,
      );
    }
  }
}
