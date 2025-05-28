import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
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
import { Response } from 'express';
import { CurrentUser } from 'src/decorator/current-user.decorator';

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
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    return this.authService.login(loginDto, res);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const userId = user?.userId;

    await this.authService.logout(userId, res);

    return { message: 'Logged out successfully' };
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
