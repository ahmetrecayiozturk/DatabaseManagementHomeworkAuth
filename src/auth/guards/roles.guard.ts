import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from '../decorators/check-role.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { jwtConstants } from '../constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token not found');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: jwtConstants.secret,
      });

      // ✅ Session bilgilerini de request. user'a ekle
      request.user = {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
        sessionId: payload.sessionId,
        loginTime: payload.loginTime,
        lastActivity: payload.lastActivity,
      };

      // ✨ Save user information from token to session
      const session = request.session;
      if (session && !session.userId) {
        session.userId = payload.sub;
        session.username = payload.username;
        session.role = payload.role;
        session.sessionId = payload.sessionId;
        if (payload.loginTime) {
          session.loginTime = new Date(payload.loginTime);
        } else {
          session.loginTime = new Date();
        }
        session.lastActivity = new Date();
      }

      // ✅ Mevcut session varsa lastActivity'yi güncelle
      if (session && session.userId) {
        session.lastActivity = new Date();
      }

      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      const userRole = payload.role;

      if (!requiredRoles.includes(userRole)) {
        throw new ForbiddenException(
          `This operation requires ${requiredRoles.join(' or ')} role. Your role: ${userRole}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
