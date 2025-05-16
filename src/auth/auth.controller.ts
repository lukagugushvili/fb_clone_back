import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { RegisterResponse } from './responses/register.response';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './responses/login.response';
import { AuthGuard } from 'src/guard/auth.guard';
import { RequestUserResponse } from './responses/request-user.response';
import { AuthRequest } from 'src/types/auth-request.interface';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerUserDto: CreateUserDto,
  ): Promise<RegisterResponse> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req: AuthRequest): Promise<RequestUserResponse> {
    return {
      userId: req.user.userId,
      email: req.user.email,
      roles: req.user.roles,
    };
  }
}
