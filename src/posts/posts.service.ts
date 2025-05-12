import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './schema/post.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private readonly usersService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const { userId } = createPostDto;
    try {
      const user = await this.usersService.findById(userId);

      if (!user) {
        throw new NotFoundException(`User with ID: ${userId} not found`);
      }

      const posts = await this.postModel.create(createPostDto);

      await this.usersService.addPostToUser(user.id, posts.id);

      return posts;
    } catch (error) {
      console.error(`error creating post: ${error.message}`);
      throw new BadRequestException(`Could not create post: ${error.message}`);
    }
  }

  async remove(id: string): Promise<Post> {
    try {
      const post = await this.postModel.findByIdAndDelete(id);

      if (!post) {
        throw new NotFoundException(`Post with ID: ${id} not found`);
      }

      await this.usersService.removePostFromUser(
        post.userId.toString(),
        post.id,
      );

      return post;
    } catch (error) {
      console.error(`Error deleting post: ${error.message}`);
      throw new BadRequestException(`Could not delete post: ${error.message}`);
    }
  }
}
