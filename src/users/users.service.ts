import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(
    username: string,
    plainPassword: string,
    role: 'admin' | 'user' = 'user',
  ): Promise<User> {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(plainPassword, saltRounds);
    const user = this.usersRepository.create({
      username,
      password: hashed,
      role,
    });
    const saved = await this.usersRepository.save(user);
    // don't return password to outside
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = saved;
    return result as User;
  }

  // for internal use (returns full user with password)
  async findOneWithPassword(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async updateRole(userId: number, role: 'admin' | 'user'): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    user.role = role;
    return this.usersRepository.save(user);
  }
}
