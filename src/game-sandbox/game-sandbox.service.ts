import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SandboxRecord } from './sandbox.record.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GameSandboxService {
  constructor(
    @InjectDataSource() private mainDataSource: DataSource,
    @InjectRepository(SandboxRecord)
    private sandboxRepository: Repository<SandboxRecord>,
    private configService: ConfigService,
  ) {}

  async createSandboxRecord(
    userId: number,
    name: string,
  ): Promise<SandboxRecord> {
    const newSandbox = this.sandboxRepository.create({ userId, name });
    return this.sandboxRepository.save(newSandbox);
  }
  async getSandbox(userId?: number, id?: number): Promise<SandboxRecord[]> {
    return this.sandboxRepository.find({ where: { id, userId } });
  }
}
