import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IPayload } from 'src/types/payloads';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request?.cookies['access_token'];

    if (!token) throw new UnauthorizedException('Invalid or expired token');

    try {
      const decoded = await this.jwtService.verifyAsync<IPayload>(token);
      request.user = decoded;
    } catch (error) {
      console.error(`Token verification error: ${error.message}`);
      throw new UnauthorizedException(`Invalid token: ${error.message}`);
    }

    return true;
  }
}
