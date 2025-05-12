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
      throw new BadRequestException('User registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const arePasswordsMatch = bcrypt.compare(user.password, password);
      if (!arePasswordsMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payLoad = { userId: user.id, email, roles: user.role };
      const access_token = this.jwtService.sign(payLoad);

      return { message: 'Login successful', access_token };
    } catch (error) {
      console.error(`Error logging in user: ${error.message}`);
      throw new BadRequestException('User login failed');
    }
  }
}
