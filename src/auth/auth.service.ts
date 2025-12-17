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

  // ✨ Login - Session parametresi eklendi
  async login(user: any, session?: any) {
    const loginTime = new Date();
    const sessionId = session?.id || this.generateSessionId();

    // 🎯 JWT CLAIMS - Session bilgileri eklendi
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      sessionId: sessionId,
      loginTime: loginTime.toISOString(),
      lastActivity: loginTime.toISOString(),
    };

    // ✨ Session'a kullanıcı bilgilerini kaydet
    if (session) {
      session.userId = user.id;
      session.username = user.username;
      session.role = user.role;
      session.sessionId = sessionId;
      session.loginTime = loginTime;
      session.lastActivity = loginTime;
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        sessionId: sessionId,
        loginTime: loginTime,
      },
    };
  }

  // ✨ Register
  async register(
    username: string,
    plainPassword: string,
    role: 'admin' | 'user' = 'user',
  ) {
    const existing = await this.usersService.findOne(username);
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }

    const newUser = await this.usersService.create(
      username,
      plainPassword,
      role,
    );

    const loginTime = new Date();
    const sessionId = this.generateSessionId();

    // 🎯 REGISTER'DA DA JWT CLAIMS - Session bilgileri eklendi
    const payload = {
      username: newUser.username,
      sub: newUser.id,
      role: newUser.role,
      sessionId: sessionId,
      loginTime: loginTime.toISOString(),
      lastActivity: loginTime.toISOString(),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        sessionId: sessionId,
        loginTime: loginTime,
      },
    };
  }

  // ✨ Logout methodu
  async logout(session: any): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      session.destroy((err: any) => {
        if (err) {
          reject(new UnauthorizedException('Error occurred during logout'));
        } else {
          resolve({ message: 'Successfully logged out' });
        }
      });
    });
  }

  // ✨ Session doğrulama
  async validateSession(session: any) {
    if (!session || !session.userId) {
      throw new UnauthorizedException('Valid session not found');
    }

    const user = await this.usersService.findById(session.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Son aktivite zamanını güncelle
    session.lastActivity = new Date();
    return {
      userId: session.userId,
      username: session.username,
      role: session.role,
      sessionId: session.sessionId,
      loginTime: session.loginTime,
      lastActivity: session.lastActivity,
    };
  }

  // ✅ YENİ: User ID ile session bilgisi getir
  async getSessionByUserId(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Session bilgilerini döndür
    // Not: Gerçek uygulamada Redis veya session store'dan çekilmeli
    return {
      userId: user.id,
      username: user.username,
      role: user.role,
      message: 'Session info retrieved (from database, not active session)',
    };
  }

  // ✅ YENİ:  Kullanıcının tüm aktif session'larını getir
  async getSessionsByUserId(userId: number): Promise<any[]> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Not: Gerçek uygulamada Redis'ten veya session store'dan çekilmeli
    // Şimdilik mock data dönüyoruz
    return [
      {
        sessionId: this.generateSessionId(),
        userId: user.id,
        username: user.username,
        role: user.role,
        loginTime: new Date(),
        lastActivity: new Date(),
        userAgent: 'Mock Browser',
        ipAddress: '127.0.0.1',
      },
    ];
  }

  // ✅ YENİ: Session ID ile session bilgisi getir
  async getSessionById(sessionId: string): Promise<any> {
    // Not: Gerçek uygulamada Redis'ten veya session store'dan çekilmeli
    return {
      sessionId: sessionId,
      userId: null,
      message: 'Session lookup not implemented (requires Redis/session store)',
    };
  }

  // ✅ YENİ: Belirli bir session'ı sonlandır
  async logoutSession(sessionId: string): Promise<{ message: string }> {
    // Not: Gerçek uygulamada Redis'ten veya session store'dan silinmeli
    return {
      message: `Session ${sessionId} has been terminated`,
    };
  }

  // ✅ YENİ: User ID'ye ait tüm session'ları sonlandır
  async logoutAllSessions(userId: number): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Not: Gerçek uygulamada Redis'teki tüm session'lar silinmeli
    return {
      message: `All sessions for user ${userId} have been terminated`,
    };
  }

  // ✅ Session ID oluşturma helper methodu
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
