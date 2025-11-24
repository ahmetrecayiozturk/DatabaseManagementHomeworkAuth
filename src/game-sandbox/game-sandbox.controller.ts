import {
  Body,
  Controller,
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
    try {
      return await this.gameSandboxService.getSandboxRecord(this.userId);
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


  @Get(':id')
  async getInfo(@Param('id') id: number,@Req() req: any): Promise<any> { 
  //const userId = req.user.id;
  try {
    const sandboxes = await this.gameSandboxService.getSandboxRecord(
      this.userId,
      id,
    );
    if (!sandboxes || sandboxes.length === 0) {
      throw new HttpException('Sandbox not found', HttpStatus.NOT_FOUND);
    }
    return sandboxes[0];
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  }
  
}
