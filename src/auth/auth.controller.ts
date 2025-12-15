import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
  Session,
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
    @Session() session: Record<string, any>, // ✨ Session eklendi
  ) {
    return this.authService.login(req.user, session); // ✨ Session parametresi eklendi
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(
      dto.username,
      dto.password,
      dto.role ?? 'user',
    );
    return { message: 'User created', user };
  }

  // ✨ YENİ:  Logout endpoint
  @Post('logout')
  @UseGuards(SessionGuard)
  async logout(@Session() session: Record<string, any>) {
    return this.authService.logout(session);
  }

  // ✨ YENİ: Session bilgilerini getir
  @Get('session')
  @UseGuards(SessionGuard)
  async getSession(@Session() session: Record<string, any>) {
    return this.authService.validateSession(session);
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
