import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { GameSandboxService } from './game-sandbox.service';

@Controller('game-sandbox')
export class GameSandboxController {
  userId: number = 1;
  constructor(private readonly gameSandboxService: GameSandboxService) {}

  @Get()
  async getSandboxList(): Promise<any> {
    try {
      return await this.gameSandboxService.getSandbox(this.userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async createSandbox(@Body('name') name: string): Promise<any> {
    try {
      const sandboxRecord = await this.gameSandboxService.createSandboxRecord(
        this.userId,
        name,
      );
      return sandboxRecord;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
