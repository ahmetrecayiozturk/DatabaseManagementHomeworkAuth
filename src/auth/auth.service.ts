import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SessionStore } from './session.store';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionStore: SessionStore,
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

  async login(user: any, metadata?: any) {
    const sessionId = this.sessionStore.create(
      user.id,
      user.username,
      user.role,
      metadata,
    );

    return {
      sessionId,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      message: 'Login successful',
    };
  }

  async logout(sessionId: string) {
    const deleted = this.sessionStore.delete(sessionId);
    if (!deleted) {
      throw new UnauthorizedException('Session not found');
    }
    return { message: 'Logged out successfully' };
  }

  async register(
    username: string,
    password: string,
    role: 'admin' | 'user' = 'user',
  ) {
    const existing = await this.usersService.findOne(username);
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }

    const newUser = await this.usersService.create(username, password, role);

    const sessionId = this.sessionStore.create(
      newUser.id,
      newUser.username,
      newUser.role,
    );

    return {
      sessionId,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
      message: 'User registered successfully',
    };
  }

  getSession(sessionId: string) {
    const session = this.sessionStore.get(sessionId);
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }
    return session;
  }

  getUserSessions(userId: number) {
    return this.sessionStore.getByUserId(userId);
  }

  logoutAllDevices(userId: number) {
    const count = this.sessionStore.deleteByUserId(userId);
    return { message: `${count} session(s) terminated` };
  }

  getAllSessions() {
    return this.sessionStore.getAll();
  }

  logoutSession(sessionId: string) {
    const deleted = this.sessionStore.delete(sessionId);
    if (!deleted) {
      throw new UnauthorizedException('Session not found');
    }
    return { message: `Session ${sessionId} terminated` };
  }

  async getSessionByUserId(userId: number) {
    const sessions = this.sessionStore.getByUserId(userId);
    if (sessions.length === 0) {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return { message: 'No active sessions', userId: user.id };
    }
    return sessions;
  }

  async getSessionsByUserId(userId: number) {
    return this.sessionStore.getByUserId(userId);
  }

  async logoutAllSessions(userId: number) {
    const count = this.sessionStore.deleteByUserId(userId);
    return { message: `${count} session(s) terminated for user ${userId}` };
  }

  startSessionCleanup() {
    setInterval(
      () => {
        this.sessionStore.cleanExpired(1800000);
      },
      15 * 60 * 1000,
    );
  }
}
