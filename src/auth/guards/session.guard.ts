import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const session = request.session;

    if (!session || !session.userId) {
      throw new UnauthorizedException(
        'Session bulunamadı veya süresi dolmuş.  Lütfen tekrar giriş yapın.',
      );
    }

    // Son aktivite kontrolü (30 dakika)
    const thirtyMinutes = 30 * 60 * 1000;
    const now = new Date().getTime();
    const lastActivity = new Date(session.lastActivity).getTime();

    if (now - lastActivity > thirtyMinutes) {
      throw new UnauthorizedException(
        'Session zaman aşımına uğradı. Lütfen tekrar giriş yapın.',
      );
    }

    // Son aktivite zamanını güncelle
    session.lastActivity = new Date();

    // Request'e session bilgilerini ekle (opsiyonel)
    request.sessionUser = {
      userId: session.userId,
      username: session.username,
      role: session.role,
    };

    return true;
  }
}
