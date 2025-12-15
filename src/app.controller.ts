import { Controller, Get, Session, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { SessionGuard } from './auth/guards/session.guard';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // ✨ YENİ: Session test endpoint
  @Get('test-session')
  @UseGuards(SessionGuard)
  testSession(@Session() session: Record<string, any>) {
    return {
      message: 'Session çalışıyor! ',
      sessionData: {
        userId: session.userId,
        username: session.username,
        role: session.role,
        loginTime: session.loginTime,
        lastActivity: session.lastActivity,
      },
    };
  }
}
