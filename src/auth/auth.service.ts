import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterResponse } from './responses/register.response';
import { LoginResponse } from './responses/login.response';
import { IPayload } from 'src/types/payloads';
import { ITokens } from 'src/types/tokens';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerUserDto: CreateUserDto): Promise<RegisterResponse> {
    try {
      const existingUser = await this.usersService.findByEmail(
        registerUserDto.email,
      );

      if (existingUser) throw new BadRequestException('User already exists');

      const user = await this.usersService.create(registerUserDto);

      return { message: 'User registered successfully', userId: user.id };
    } catch (error) {
      console.error(`Error registering user: ${error.message}`);
      throw new BadRequestException(
        `User registration failed: ${error.message}!`,
      );
    }
  }

  async login(loginDto: LoginDto, res: Response): Promise<LoginResponse> {
    const { email, password } = loginDto;
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const arePasswordsMatch = bcrypt.compare(user.password, password);
      if (!arePasswordsMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payLoad = { userId: user.id, email, roles: user.role };

      const tokens = await this.generateTokens(payLoad);
      await this.saveCookies(res, tokens);

      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
      const hashedRefreshToken = await bcrypt.hash(
        tokens.refresh_token,
        saltRounds,
      );

      await this.usersService.update(user.id, {
        refresh_token: hashedRefreshToken,
      });

      return { message: 'Login successful', tokens };
    } catch (error) {
      console.error(`Error logging in user: ${error.message}`);
      throw new BadRequestException(`User login failed ${error.message}!`);
    }
  }

  private async generateTokens(payload: IPayload): Promise<ITokens> {
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_JWT_SECRET,
      expiresIn: process.env.ACCESS_EXPIRES_IN,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_JWT_SECRET,
      expiresIn: process.env.REFRESH_EXPIRES_IN,
    });

    return { access_token, refresh_token };
  }

  private async saveCookies(res: Response, tokens: ITokens): Promise<void> {
    const { access_token, refresh_token } = tokens;

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: isProd,
      maxAge: 15 * 60 * 1000,
      sameSite: 'lax',
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });
  }
}
