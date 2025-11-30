import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto.username, dto.password, dto.role ?? 'user');
    return { message: 'User created', user };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
