import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookie['access_token'];

    if (!token) throw new UnauthorizedException('Token is required');

    try {
      const decoded = await this.jwtService.verifyAsync(token);
      request.user = decoded;
    } catch (error) {
      console.error(`Token verification error: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
