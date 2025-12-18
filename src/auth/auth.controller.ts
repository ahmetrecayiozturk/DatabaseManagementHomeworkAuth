import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  Res,
  Param,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CheckRole } from './decorators/check-role.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      dto.username,
      dto.password,
    );
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const result = await this.authService.login(user, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.cookie('sessionId', result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000,
    });

    return result;
  }

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(
      dto.username,
      dto.password,
      dto.role,
    );

    res.cookie('sessionId', result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000,
    });

    return result;
  }

  @Post('logout')
  async logout(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(user.sessionId);
    res.clearCookie('sessionId');
    return result;
  }

  @Get('session')
  getSession(@CurrentUser() user: any) {
    return this.authService.getSession(user.sessionId);
  }

  @Get('sessions')
  getMySessions(@CurrentUser() user: any) {
    return this.authService.getUserSessions(user.userId);
  }

  @Delete('sessions/all')
  logoutAllDevices(@CurrentUser() user: any) {
    return this.authService.logoutAllDevices(user.userId);
  }

  @Delete('sessions/: sessionId')
  @CheckRole('admin', 'user')
  logoutSession(@Param('sessionId') sessionId: string) {
    return this.authService.logoutSession(sessionId);
  }

  @Get('admin/sessions')
  @CheckRole('admin')
  getAllSessions() {
    return this.authService.getAllSessions();
  }

  @Get('profile')
  @CheckRole('admin', 'user')
  getProfile(@CurrentUser() user: any) {
    return {
      message: 'Profile data',
      user,
    };
  }

  @Post('get-session-by-user-id')
  @CheckRole('admin', 'user')
  async getSessionByUserId(@Body('userId') userId: number) {
    return this.authService.getSessionByUserId(userId);
  }

  @Get('sessions/user/:userId')
  @CheckRole('admin')
  async getUserSessions(@Param('userId') userId: string) {
    return this.authService.getSessionsByUserId(Number(userId));
  }

  @Delete('sessions/user/:userId/all')
  @CheckRole('admin')
  async adminLogoutUserAllSessions(@Param('userId') userId: string) {
    return this.authService.logoutAllSessions(Number(userId));
  }
}
