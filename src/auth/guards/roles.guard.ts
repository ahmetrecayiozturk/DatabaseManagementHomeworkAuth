import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/check-role.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SessionStore } from '../session.store';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private sessionStore: SessionStore,
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

    const sessionId =
      request.cookies?.sessionId || request.headers['x-session-id'];

    if (!sessionId) {
      throw new UnauthorizedException('Session ID not found');
    }

    const session = this.sessionStore.get(sessionId);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const thirtyMinutes = 30 * 60 * 1000;
    const now = Date.now();
    const lastActivity = session.lastActivity.getTime();

    if (now - lastActivity > thirtyMinutes) {
      this.sessionStore.delete(sessionId);
      throw new UnauthorizedException('Session expired');
    }

    this.sessionStore.updateActivity(sessionId);

    request.user = {
      userId: session.userId,
      username: session.username,
      role: session.role,
      sessionId: session.sessionId,
    };

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(session.role)) {
      throw new ForbiddenException(
        `This operation requires ${requiredRoles.join(' or ')} role. Your role:  ${session.role}`,
      );
    }

    return true;
  }
}
