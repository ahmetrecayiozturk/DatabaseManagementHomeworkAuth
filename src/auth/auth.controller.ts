import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
  Session,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { CheckRole } from './decorators/check-role.decorator';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { SessionGuard } from './guards/session.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: any,
    //Session recordu
    @Session() session: Record<string, any>, // ✨ Session eklendi
  ) {
    return this.authService.login(req.user, session); // ✨ Session parametresi eklendi
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(
      dto.username,
      dto.password,
      dto.role ?? 'user',
    );
    return { message: 'User created', ...result };
  }

  // ✨ Logout endpoint
  @Post('logout')
  @UseGuards(SessionGuard)
  async logout(@Session() session: Record<string, any>) {
    return this.authService.logout(session);
  }

  // ✨ Session bilgilerini getir
  @Get('session')
  @UseGuards(SessionGuard)
  async getSession(@Session() session: Record<string, any>) {
    return this.authService.validateSession(session);
  }

  // ✨ User ID ile session getir
  @Post('get-session-by-user-id')
  @CheckRole('admin', 'user')
  async getSessionByUserId(@Body('userId') userId: number) {
    return this.authService.getSessionByUserId(userId);
  }

  // ✅ YENİ:  Kullanıcının tüm aktif session'larını listele
  @Get('sessions')
  @CheckRole('user', 'admin')
  async getMySessions(@CurrentUser() user: any) {
    return this.authService.getSessionsByUserId(user.id);
  }

  // ✅ YENİ: Admin - Belirli kullanıcının session'larını getir
  @Get('sessions/user/:userId')
  @CheckRole('admin')
  async getUserSessions(@Param('userId') userId: string) {
    return this.authService.getSessionsByUserId(Number(userId));
  }

  // ✅ YENİ:  Belirli bir session'ı sonlandır
  @Delete('sessions/:sessionId')
  @CheckRole('user', 'admin')
  async logoutSession(@Param('sessionId') sessionId: string) {
    return this.authService.logoutSession(sessionId);
  }

  // ✅ YENİ: Tüm cihazlardan çıkış yap
  @Delete('sessions/all')
  @CheckRole('user', 'admin')
  async logoutAllDevices(@CurrentUser() user: any) {
    return this.authService.logoutAllSessions(user.id);
  }

  // ✅ YENİ: Admin - Belirli kullanıcının tüm session'larını sonlandır
  @Delete('sessions/user/:userId/all')
  @CheckRole('admin')
  async adminLogoutUserAllSessions(@Param('userId') userId: string) {
    return this.authService.logoutAllSessions(Number(userId));
  }

  @CheckRole('admin')
  @Get('profile')
  getProfile(
    @CurrentUser() user: any,
    @Session() session: Record<string, any>, // ✨ Session eklendi
  ) {
    return {
      jwtUser: user, // JWT'den gelen bilgi
      sessionUser: {
        // ✨ Session'dan gelen bilgi
        userId: session.userId,
        username: session.username,
        role: session.role,
        loginTime: session.loginTime,
        lastActivity: session.lastActivity,
      },
    };
  }
}
