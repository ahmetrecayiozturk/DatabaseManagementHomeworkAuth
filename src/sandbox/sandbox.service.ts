import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Sandbox } from './sandbox.entity';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { QueryResultDto } from './query-result.dto';
import { QueryResultMapper } from './query-result.mapper';
import { TableDto } from './table.dto';

@Injectable()
export class SandboxService {
  templateDbName: string;
  constructor(
    @InjectDataSource() private mainDataSource: DataSource,
    @InjectRepository(Sandbox)
    private sandboxRepository: Repository<Sandbox>,
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

  async initializeSandbox(sr: Sandbox) {
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
      dbUsername: dbUser,
      dbPassword: dbPass,
    });
  }

  async createSandboxRecord(gameId: number): Promise<Sandbox> {
    const newSandbox = this.sandboxRepository.create({ gameId });
    return this.sandboxRepository.save(newSandbox);
  }
  async getSandboxRecord(gameId?: number, id?: number): Promise<Sandbox[]> {
    return this.sandboxRepository.find({ where: { id, gameId } });
  }

  async deleteSandbox(sr: Sandbox): Promise<void> {
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

  async runQuery(sr: Sandbox, query: string): Promise<QueryResultDto> {
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

    let result;
    let error;
    const start = Date.now();

    try {
      await sandboxConnection.initialize();
      result = await sandboxConnection.query(query);
    } catch (err) {
      console.error('Error running query in sandbox:', err);
      error = err;
    } finally {
      if (sandboxConnection.isInitialized) {
        await sandboxConnection.destroy();
      }
      const executionTime = Date.now() - start;
      return QueryResultMapper.toDTO(result, error, executionTime);
    }
  }

  async getTablesFromTemplate(): Promise<TableDto[]> {
    const tempClient = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.templateDbName,
    });

    try {
      await tempClient.initialize();

      const rows = await tempClient.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position;
    ` );

      const tablesMap: Record<string, string[]> = {};

      rows.forEach((row) => {
        if (!tablesMap[row.table_name]) {
          tablesMap[row.table_name] = [];
        }
        tablesMap[row.table_name].push(row.column_name);
      });
      const result: TableDto[] = Object.keys(tablesMap).map((tableName) => {
        return new TableDto(tableName, tablesMap[tableName]);
      });

      return result;
    } catch (error) {
      console.error('Schema fetch error:', error);
      return [];
    }
    finally {      
      if (tempClient.isInitialized) {
        await tempClient.destroy();
      }
    }
  }
}
