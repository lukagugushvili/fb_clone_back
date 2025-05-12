import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post as PostSchema } from './schema/post.schema';
import { AuthGuard } from 'src/guard/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRoles } from 'src/enum/user-roles';
import { RolesGuard } from 'src/guard/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN, UserRoles.USER)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async createPost(@Body() createPostDto: CreatePostDto): Promise<PostSchema> {
    return this.postsService.create(createPostDto);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string): Promise<PostSchema> {
    return this.postsService.remove(id);
  }
}
