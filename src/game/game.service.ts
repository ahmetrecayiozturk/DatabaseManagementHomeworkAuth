import { Injectable } from '@nestjs/common';
import { Game } from './game.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SandboxService } from 'src/sandbox/sandbox.service';

@Injectable()
export class GameService {
  constructor(
    @InjectDataSource() private mainDataSource: DataSource,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    private sandboxService: SandboxService,
  ) {}

  async getGames(userId?: number, id?: number): Promise<Game[]> {
    return this.gameRepository.find({ where: { id, userId } });
  }
  async createGame(userId: number, name: string): Promise<Game> {
    const newGame = this.gameRepository.create({
      userId,
      name,
    });
    return this.gameRepository.save(newGame);
  }

  async initialize(game: Game): Promise<void> {
    const sr = await this.sandboxService.createSandboxRecord(game.id);
    await this.sandboxService.initializeSandbox(sr);

    game.isInitialized = true;
    await this.gameRepository.save(game);
  }

  async saveGame(game: Game): Promise<Game> {
    return this.gameRepository.save(game);
  }

  async deleteGame(game: Game): Promise<void> {
    await this.gameRepository.remove(game);
    let sr = await this.sandboxService.getSandboxRecord(game.id);
    await this.sandboxService.deleteSandbox(sr[0]);
  }

  async runQuery(game: Game, query: string): Promise<any> {
    const sr = await this.sandboxService.getSandboxRecord(game.id);
    return this.sandboxService.runQuery(sr[0], query);
  }
}
