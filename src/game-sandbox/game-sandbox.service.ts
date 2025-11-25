import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SandboxRecord } from './sandbox.record.entity';
import { ConfigService } from '@nestjs/config';
import { SandboxStatus } from './sandbox.status.enum';
import * as crypto from 'crypto';

@Injectable()
export class GameSandboxService {
  templateDbName: string;
  constructor(
    @InjectDataSource() private mainDataSource: DataSource,
    @InjectRepository(SandboxRecord)
    private sandboxRepository: Repository<SandboxRecord>,
    private configService: ConfigService,
  ) {
    this.templateDbName = configService.get(
      'TEMPLATE_DB_NAME',
      'template_sandbox_db',
    );
    this.ensureTemplateDbExists().catch((err) => {
      console.error('Error ensuring template database exists:', err);
    });
  }

  private async ensureTemplateDbExists(): Promise<void> {
    const template = this.templateDbName;
    const exists = await this.mainDataSource.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [template],
    );

    if (exists.length > 0) return;
    console.log(`Template database "${template}" does not exist. Creating...`);
    await this.mainDataSource.query(
      `CREATE DATABASE ${template} TEMPLATE template0`,
    );
  }

  async initializeSandbox(sr: SandboxRecord) {
    const sandboxDbName = `sandbox_${sr.id}`;
    const dbUser = `db_user_${sr.id}`;
    const dbPass = crypto.randomBytes(16).toString('hex');

    const templateExists = await this.mainDataSource.query(`
      SELECT 1 FROM pg_database WHERE datname = '${this.templateDbName}'
    `);

    if (templateExists.length === 0) {
      throw new Error(
        `Template database '${this.templateDbName}' does not exist.`,
      );
    }

    await this.mainDataSource.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${sandboxDbName}'
      AND pid <> pg_backend_pid();
    `);

    await this.mainDataSource.query(`DROP DATABASE IF EXISTS ${sandboxDbName}`);
    await this.mainDataSource.query(`DROP USER IF EXISTS "${dbUser}"`);

    await this.mainDataSource.query(`
      CREATE DATABASE ${sandboxDbName} 
      WITH TEMPLATE ${this.templateDbName} 
    `);

    await this.mainDataSource.query(
      `CREATE USER "${dbUser}" WITH PASSWORD '${dbPass}'`,
    );
    await this.mainDataSource.query(
      `ALTER DATABASE ${sandboxDbName} OWNER TO "${dbUser}"`,
    );

    console.log('initialized sandbox ' + sandboxDbName);
    this.sandboxRepository.update(sr.id, {
      status: SandboxStatus.INITIALIZED,
      dbUsername: dbUser,
      dbPassword: dbPass,
    });
  }

  async createSandboxRecord(
    userId: number,
    name: string,
  ): Promise<SandboxRecord> {
    const newSandbox = this.sandboxRepository.create({ userId, name });
    return this.sandboxRepository.save(newSandbox);
  }
  async getSandboxRecord(
    userId?: number,
    id?: number,
  ): Promise<SandboxRecord[]> {
    return this.sandboxRepository.find({ where: { id, userId } });
  }

  async deleteSandbox(sr: SandboxRecord): Promise<void> {
    const sandboxDbName = `sandbox_${sr.id}`;
    const dbUser = `db_user_${sr.id}`;

    await this.mainDataSource.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${sandboxDbName}'
      AND pid <> pg_backend_pid();
    `);

    await this.mainDataSource.query(`DROP DATABASE IF EXISTS ${sandboxDbName}`);
    await this.mainDataSource.query(`DROP USER IF EXISTS "${dbUser}"`);
    await this.sandboxRepository.delete(sr.id);
  }

  async runQuery(sr: SandboxRecord, query: string): Promise<any> {
    if (!sr.dbUsername || !sr.dbPassword) {
      throw new Error('Sandbox not initialized');
    }
    const sandboxDbName = `sandbox_${sr.id}`;

    const sandboxConnection = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: sr.dbUsername,
      password: sr.dbPassword,
      database: sandboxDbName,
    });

    try {
      await sandboxConnection.initialize();
      return await sandboxConnection.query(query);
    } catch (error) {
      console.error('Error running query in sandbox:', error);
      return error.message;
    } finally {
      if (sandboxConnection.isInitialized) {
        await sandboxConnection.destroy();
      }
    }
  }
}
