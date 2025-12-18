import { Controller, Get, Session } from '@nestjs/common';
import { AppService } from './app.service';
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
