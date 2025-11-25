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
import { GameSandboxService } from './game-sandbox.service';

@Controller('game-sandbox')
export class GameSandboxController {
  userId: number = 1;
  constructor(private readonly gameSandboxService: GameSandboxService) {}

  @Get()
  async getSandboxList(): Promise<any> {
    return await this.gameSandboxService.getSandboxRecord(this.userId);
  }

  @Post()
  async createSandbox(@Body('name') name: string): Promise<any> {
    const sandboxRecord = await this.gameSandboxService.createSandboxRecord(
      this.userId,
      name,
    );
    return sandboxRecord;
  }

  @Post('initialize/:id')
  async InitializeSandbox(@Param('id') id: number): Promise<any> {
    const sr = await this.gameSandboxService.getSandboxRecord(this.userId, id);
    if (!sr) {
      throw new HttpException('Sandbox not found', HttpStatus.NOT_FOUND);
    }
    return this.gameSandboxService.initializeSandbox(sr[0]);
  }

  @Get(':id')
  async getInfo(@Param('id') id: number, @Req() req: any): Promise<any> {
    //const userId = req.user.id;
    const sandboxes = await this.gameSandboxService.getSandboxRecord(
      this.userId,
      id,
    );
    if (!sandboxes || sandboxes.length === 0) {
      throw new HttpException('Sandbox not found', HttpStatus.NOT_FOUND);
    }
    return sandboxes[0];
  }

  @Delete(':id')
  async deleteSandbox(@Param('id') id: number): Promise<any> {
    const sr = await this.gameSandboxService.getSandboxRecord(this.userId, id);
    await this.gameSandboxService.deleteSandbox(sr[0]);
    return 'Sandbox has been deleted.';
  }

  @Post('query/:id')
  async runQuery(
    @Param('id') id: string,
    @Body('query') query: string,
  ): Promise<any> {
    const sr = await this.gameSandboxService.getSandboxRecord(this.userId);
    return this.gameSandboxService.runQuery(sr[0], query);
  }
}
