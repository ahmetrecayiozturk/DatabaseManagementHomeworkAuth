import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { GameService } from './game.service';
import { GameMapper } from './game.mapper';
@Controller('game')
export class GameController {
  userId: number = 1;
  constructor(private readonly gameService: GameService) {}

  @Get()
  async get(): Promise<any> {
    return (await this.gameService.getGames(this.userId)).map(GameMapper.toDTO);
  }

  @Post()
  async createGame(@Body('name') name: string): Promise<any> {
    const gameRecord = await this.gameService.createGame(this.userId, name);
    return GameMapper.toDTO(gameRecord);
  }

  @Get(':id')
  async getInfo(@Param('id') id: number, @Req() req: any): Promise<any> {
    //const userId = req.user.id;
    const games = await this.gameService.getGames(this.userId, id);
    if (!games || games.length === 0) {
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }
    //add more specific game info
    return GameMapper.toDTO(games[0]);
  }

  @Post(':id/init')
  async initialize(@Param('id') id: number): Promise<any> {
    const games = await this.gameService.getGames(this.userId, id);
    if (!games || games.length === 0) {
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }
    let game = games[0];
    await this.gameService.initialize(game);
    game = await this.gameService.saveGame(game);
    return GameMapper.toDTO(game);
  }

  @Delete(':id')
  async deleteGame(@Param('id') id: number): Promise<any> {
    const gr = await this.gameService.getGames(this.userId, id);
    await this.gameService.deleteGame(gr[0]);
    return 'Game has been deleted.';
  }

  @Post(':id/query')
  async runQuery(
    @Param('id') id: string,
    @Body('query') query: string,
  ): Promise<any> {
    console.log('Running query for game id:', id);
    const gr = await this.gameService.getGames(this.userId, parseInt(id));
    return this.gameService.runQuery(gr[0], query);
  }
}
