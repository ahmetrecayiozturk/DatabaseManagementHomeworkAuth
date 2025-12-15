import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { SessionGuard } from './guards/session.guard'; // ✨ YENİ

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    SessionGuard, // ✨ YENİ - SessionGuard'ı provider olarak ekle
  ],
  controllers: [AuthController],
  exports: [JwtModule, SessionGuard], // ✨ SessionGuard'ı export et
})
export class AuthModule {}
