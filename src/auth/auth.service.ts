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

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(username: string, plainPassword: string, role: 'admin' | 'user' = 'user') {
    const existing = await this.usersService.findOne(username);
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }
    return this.usersService.create(username, plainPassword, role);
  }
}
