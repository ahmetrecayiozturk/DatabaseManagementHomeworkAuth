import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findOneWithPassword(username);
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (match) {
      const result = { ...(user as any) };
      delete result.password;
      return result;
    }
    return null;
  }

  // ✨ Session parametresi eklendi
  async login(user: any, session?: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };

    // ✨ Session'a kullanıcı bilgilerini kaydet
    if (session) {
      session.userId = user.id;
      session.username = user.username;
      session.role = user.role;
      session.loginTime = new Date();
      session.lastActivity = new Date();
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  // ✨ YENİ:  Logout methodu
  async logout(session: any): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      session.destroy((err: any) => {
        if (err) {
          reject(new UnauthorizedException('Çıkış yapılırken bir hata oluştu'));
        } else {
          resolve({ message: 'Başarıyla çıkış yapıldı' });
        }
      });
    });
  }

  // ✨ YENİ: Session doğrulama
  async validateSession(session: any) {
    if (!session || !session.userId) {
      throw new UnauthorizedException('Geçerli bir session bulunamadı');
    }

    const user = await this.usersService.findById(session.userId);
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // Son aktivite zamanını güncelle
    session.lastActivity = new Date();

    return {
      userId: session.userId,
      username: session.username,
      role: session.role,
      loginTime: session.loginTime,
      lastActivity: session.lastActivity,
    };
  }

  async register(
    username: string,
    plainPassword: string,
    role: 'admin' | 'user' = 'user',
  ) {
    const existing = await this.usersService.findOne(username);
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }
    return this.usersService.create(username, plainPassword, role);
  }
}
